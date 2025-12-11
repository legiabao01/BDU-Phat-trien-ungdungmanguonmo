from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ...db.session import get_db
from ...models.review import Review
from ...models.course import Course
from ...models.user import User
from ...schemas.review import ReviewCreate, ReviewOut, ReviewWithUser
from ...api.deps import get_current_active_user
from ...models.user import User

router = APIRouter()


@router.get("/courses/{course_id}/reviews", response_model=list[ReviewWithUser])
def list_reviews(course_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách đánh giá của khóa học"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    
    reviews = db.query(Review).filter(Review.khoa_hoc_id == course_id).order_by(Review.created_at.desc()).all()
    
    result = []
    for review in reviews:
        user = db.query(User).filter(User.id == review.nguoi_dung_id).first()
        review_dict = {
            **review.__dict__,
            "user_name": user.ho_ten if user else None,
            "user_email": user.email if user else None
        }
        result.append(ReviewWithUser(**review_dict))
    
    return result


@router.post("/courses/{course_id}/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    course_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Tạo đánh giá cho khóa học (chỉ học viên đã đăng ký)"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    
    # Kiểm tra học viên đã đăng ký khóa học chưa
    from ...models.enrollment import Enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.khoa_hoc_id == course_id,
        Enrollment.trang_thai == 'active'
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn cần đăng ký khóa học trước khi đánh giá"
        )
    
    # Kiểm tra đã đánh giá chưa
    existing_review = db.query(Review).filter(
        Review.khoa_hoc_id == course_id,
        Review.nguoi_dung_id == current_user.id
    ).first()
    
    if existing_review:
        # Cập nhật đánh giá cũ
        existing_review.diem = payload.diem
        existing_review.noi_dung = payload.noi_dung
        db.commit()
        db.refresh(existing_review)
        return existing_review
    
    # Tạo đánh giá mới
    review = Review(
        khoa_hoc_id=course_id,
        nguoi_dung_id=current_user.id,
        diem=payload.diem,
        noi_dung=payload.noi_dung
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/courses/{course_id}/reviews/stats")
def get_review_stats(course_id: int, db: Session = Depends(get_db)):
    """Lấy thống kê đánh giá của khóa học"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    
    reviews = db.query(Review).filter(Review.khoa_hoc_id == course_id).all()
    
    if not reviews:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    total = len(reviews)
    average = sum(r.diem for r in reviews) / total
    distribution = {i: sum(1 for r in reviews if r.diem == i) for i in range(1, 6)}
    
    return {
        "total_reviews": total,
        "average_rating": round(average, 1),
        "rating_distribution": distribution
    }

