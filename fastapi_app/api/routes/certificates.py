from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets

from ...db.session import get_db
from ...models.certificate import Certificate
from ...models.course import Course
from ...models.progress import Progress
from ...models.course_content import CourseContent
from ...api.deps import get_current_active_user
from ...models.user import User

router = APIRouter()


@router.get("/courses/{course_id}/certificate")
def get_certificate(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    
    # Kiểm tra đã hoàn thành chưa (100% progress)
    total_lessons = db.query(CourseContent).filter(CourseContent.khoa_hoc_id == course_id).count()
    completed_lessons = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.course_id == course_id,
        Progress.completed == True
    ).count()
    
    if total_lessons == 0 or completed_lessons < total_lessons:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn chưa hoàn thành khóa học. Cần hoàn thành 100% để nhận chứng nhận."
        )
    
    # Tìm hoặc tạo certificate
    certificate = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.course_id == course_id
    ).first()
    
    if not certificate:
        # Tạo certificate code
        certificate_code = f"CERT-{course_id}-{current_user.id}-{secrets.token_hex(8).upper()}"
        certificate = Certificate(
            user_id=current_user.id,
            course_id=course_id,
            certificate_code=certificate_code
        )
        db.add(certificate)
        db.commit()
        db.refresh(certificate)
    
    return {
        "id": certificate.id,
        "user_id": certificate.user_id,
        "course_id": certificate.course_id,
        "certificate_code": certificate.certificate_code,
        "issued_at": certificate.issued_at,
        "course_title": course.tieu_de,
        "user_name": current_user.ho_ten
    }


@router.post("/courses/{course_id}/complete")
def mark_course_complete(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Đánh dấu hoàn thành khóa học và tạo certificate"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    
    # Kiểm tra đã hoàn thành chưa
    total_lessons = db.query(CourseContent).filter(CourseContent.khoa_hoc_id == course_id).count()
    completed_lessons = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.course_id == course_id,
        Progress.completed == True
    ).count()
    
    if completed_lessons < total_lessons:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bạn chưa hoàn thành khóa học. Đã hoàn thành {completed_lessons}/{total_lessons} bài học."
        )
    
    # Tạo certificate nếu chưa có
    certificate = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.course_id == course_id
    ).first()
    
    if not certificate:
        certificate_code = f"CERT-{course_id}-{current_user.id}-{secrets.token_hex(8).upper()}"
        certificate = Certificate(
            user_id=current_user.id,
            course_id=course_id,
            certificate_code=certificate_code
        )
        db.add(certificate)
        db.commit()
        db.refresh(certificate)
    
    return {
        "message": "Khóa học đã hoàn thành!",
        "certificate_code": certificate.certificate_code
    }



