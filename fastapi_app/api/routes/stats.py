from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import Dict

from ...db.session import get_db
from ...models.user import User
from ...models.course import Course
from ...models.enrollment import Enrollment
from ...models.assignment import Assignment, Submission
from ...api.deps import get_current_active_user

router = APIRouter()


@router.get("/teachers/me/stats")
def get_teacher_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lấy thống kê cho giáo viên"""
    from ...models.user import UserRole
    if current_user.role not in [UserRole.teacher, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ giáo viên mới có quyền"
        )
    
    # Số khóa học của giáo viên
    total_courses = db.query(Course).filter(
        Course.teacher_id == current_user.id
    ).count()
    
    # Tổng số học viên đã đăng ký các khóa học của giáo viên
    total_students = db.query(func.count(distinct(Enrollment.user_id))).join(
        Course, Enrollment.khoa_hoc_id == Course.id
    ).filter(
        Course.teacher_id == current_user.id,
        Enrollment.trang_thai == "active"
    ).scalar() or 0
    
    # Số bài tập cần chấm (submissions chưa được chấm)
    pending_submissions = db.query(func.count(Submission.id)).join(
        Assignment, Submission.bai_tap_id == Assignment.id
    ).join(
        Course, Assignment.khoa_hoc_id == Course.id
    ).filter(
        Course.teacher_id == current_user.id,
        Submission.trang_thai == "submitted"
    ).scalar() or 0
    
    return {
        "total_courses": total_courses,
        "total_students": total_students,
        "pending_submissions": pending_submissions
    }


@router.get("/admin/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lấy thống kê cho admin"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ admin mới có quyền"
        )
    
    # Tổng khóa học
    total_courses = db.query(Course).count()
    
    # Tổng người dùng
    total_users = db.query(User).count()
    
    # Tổng giáo viên
    from ...models.user import UserRole
    total_teachers = db.query(User).filter(User.role == UserRole.teacher).count()
    
    # Tổng học viên
    total_students = db.query(User).filter(User.role == UserRole.student).count()
    
    return {
        "total_courses": total_courses,
        "total_users": total_users,
        "total_teachers": total_teachers,
        "total_students": total_students
    }


@router.get("/teachers/me/courses/with-stats")
def get_teacher_courses_with_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lấy danh sách khóa học của giáo viên kèm số học viên"""
    from ...models.user import UserRole
    if current_user.role not in [UserRole.teacher, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ giáo viên mới có quyền"
        )
    
    courses = db.query(Course).filter(
        Course.teacher_id == current_user.id
    ).all()
    
    result = []
    for course in courses:
        # Đếm số học viên đã đăng ký khóa này
        student_count = db.query(func.count(distinct(Enrollment.user_id))).filter(
            Enrollment.khoa_hoc_id == course.id,
            Enrollment.trang_thai == "active"
        ).scalar() or 0
        
        result.append({
            "id": course.id,
            "tieu_de": course.tieu_de,
            "mo_ta": course.mo_ta,
            "cap_do": course.cap_do,
            "hinh_anh": course.hinh_anh,
            "gia": float(course.gia) if course.gia else 0,
            "gia_goc": float(course.gia_goc) if course.gia_goc else None,
            "so_buoi": course.so_buoi,
            "thoi_luong": course.thoi_luong,
            "hinh_thuc": course.hinh_thuc.value if course.hinh_thuc else "online",
            "trang_thai": course.trang_thai.value if course.trang_thai else "active",
            "teacher_id": course.teacher_id,
            "created_at": course.created_at,
            "student_count": student_count
        })
    
    return result

