from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from ...db.session import get_db
from ...models.progress import Progress
from ...models.course_content import CourseContent
from ...schemas.progress import ProgressCreate, ProgressOut
from ...api.deps import get_current_active_user
from ...models.user import User

router = APIRouter()


def _validate_lesson(db: Session, course_id: int, lesson_id: Optional[int]) -> None:
    """Đảm bảo lesson thuộc course; nếu course chưa có lesson, trả lỗi rõ ràng."""
    if lesson_id is None:
        return
    lesson = db.query(CourseContent).filter(
        CourseContent.id == lesson_id,
        CourseContent.khoa_hoc_id == course_id,
    ).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bài học không thuộc khóa hoặc không tồn tại",
        )


def _recalc_percentage(db: Session, user_id: int, course_id: int, delta_completed: int = 0) -> float:
    total_lessons = db.query(CourseContent).filter(CourseContent.khoa_hoc_id == course_id).count()
    if total_lessons == 0:
        # Tránh chia 0, báo lỗi rõ ràng để course phải có lesson
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Khóa học chưa có bài học, không thể tính tiến độ",
        )

    completed_lessons = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.course_id == course_id,
        Progress.completed.is_(True),
    ).count()

    completed_lessons = max(0, completed_lessons + delta_completed)
    return round((completed_lessons / total_lessons) * 100, 2)


@router.post("/courses/{course_id}/progress", response_model=ProgressOut, status_code=status.HTTP_201_CREATED)
def update_progress(
    course_id: int,
    lesson_id: Optional[int] = None,
    completed: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _validate_lesson(db, course_id, lesson_id)

    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.course_id == course_id,
        Progress.lesson_id == lesson_id,
    ).first()

    if not progress:
        delta = 1 if completed else 0
        percentage = _recalc_percentage(db, current_user.id, course_id, delta_completed=delta)
        progress = Progress(
            user_id=current_user.id,
            course_id=course_id,
            lesson_id=lesson_id,
            completed=completed,
            progress_percentage=percentage,
        )
        db.add(progress)
    else:
        previous = progress.completed
        progress.completed = completed

        delta = 0
        if completed and not previous:
            delta = 1
        elif not completed and previous:
            delta = -1

        progress.progress_percentage = _recalc_percentage(
            db,
            current_user.id,
            course_id,
            delta_completed=delta,
        )

    db.commit()
    db.refresh(progress)
    return progress


@router.get("/courses/{course_id}/progress", response_model=ProgressOut)
def get_progress(
    course_id: int,
    lesson_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _validate_lesson(db, course_id, lesson_id)

    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.course_id == course_id,
        Progress.lesson_id == lesson_id,
    ).first()

    if not progress:
        # Tính progress tổng thể cho course (kể cả khi chưa có record)
        try:
            progress_percentage = _recalc_percentage(db, current_user.id, course_id)
        except HTTPException as exc:
            if exc.status_code == status.HTTP_400_BAD_REQUEST:
                # Trả về progress trống nhưng báo chưa có bài học
                raise exc
            raise

        return {
            "id": 0,
            "user_id": current_user.id,
            "course_id": course_id,
            "lesson_id": lesson_id,
            "completed": False,
            "progress_percentage": progress_percentage,
            "updated_at": None,
        }

    return progress


@router.get("/users/me/progress", response_model=list[ProgressOut])
def get_all_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lấy tất cả progress của user"""
    progress_list = db.query(Progress).filter(Progress.user_id == current_user.id).all()
    return progress_list
