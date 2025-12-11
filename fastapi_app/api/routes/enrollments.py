from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models.enrollment import Enrollment
from ...models.course import Course
from ...schemas.enrollment import EnrollmentCreate, EnrollmentOut
from ...api.deps import get_current_active_user
from ...models.user import User

router = APIRouter()


@router.post("/courses/{course_id}/enroll", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED)
def enroll_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Đăng ký khóa học - logic hợp lý và đầy đủ"""
    # Kiểm tra khóa học tồn tại
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Khóa học không tồn tại"
        )
    
    # Kiểm tra khóa học có đang active không
    if course.trang_thai != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Khóa học này hiện không khả dụng"
        )
    
    # Kiểm tra đã đăng ký chưa
    try:
        existing = db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id,
            Enrollment.khoa_hoc_id == course_id
        ).first()
    except Exception as e:
        # Nếu bảng chưa tồn tại, tạo bảng và thử lại
        from ...db.base import Base
        from ...db.session import engine
        Base.metadata.create_all(bind=engine, tables=[Enrollment.__table__])
        existing = db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id,
            Enrollment.khoa_hoc_id == course_id
        ).first()
    
    if existing:
        if existing.trang_thai == "cancelled":
            # Cho phép đăng ký lại nếu đã bị hủy
            existing.trang_thai = "active"
            db.commit()
            db.refresh(existing)
            return existing
        elif existing.trang_thai == "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bạn đã đăng ký khóa học này rồi"
            )
        elif existing.trang_thai == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bạn đã hoàn thành khóa học này rồi"
            )
    
    # Kiểm tra giá khóa học (nếu có giá > 0 thì cần thanh toán, nhưng MVP có thể bỏ qua)
    # Trong MVP, cho phép đăng ký miễn phí hoặc có giá
    
    # Tạo enrollment mới
    enrollment = Enrollment(
        user_id=current_user.id,
        khoa_hoc_id=course_id,
        trang_thai="active"
    )
    
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/users/me/enrollments", response_model=list[EnrollmentOut])
def get_my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.trang_thai != "cancelled"
    ).all()
    return enrollments


@router.get("/users/me/enrollments/with-courses")
def get_my_enrollments_with_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lấy enrollments kèm thông tin course"""
    from ...models.course import Course
    enrollments = db.query(Enrollment).join(Course).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.trang_thai != "cancelled"
    ).all()
    
    result = []
    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.khoa_hoc_id).first()
        result.append({
            "id": enrollment.id,
            "user_id": enrollment.user_id,
            "khoa_hoc_id": enrollment.khoa_hoc_id,
            "trang_thai": enrollment.trang_thai,
            "ngay_dang_ky": enrollment.ngay_dang_ky,
            "course": {
                "id": course.id,
                "tieu_de": course.tieu_de,
                "mo_ta": course.mo_ta,
                "cap_do": course.cap_do,
                "hinh_anh": course.hinh_anh,
                "gia": float(course.gia) if course.gia else 0,
                "so_buoi": course.so_buoi,
                "hinh_thuc": course.hinh_thuc.value if course.hinh_thuc else "online"
            }
        })
    return result


@router.get("/courses/{course_id}/enrollment")
def check_enrollment(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.khoa_hoc_id == course_id,
        Enrollment.trang_thai == "active"
    ).first()
    
    return {"is_enrolled": enrollment is not None, "enrollment": enrollment}

