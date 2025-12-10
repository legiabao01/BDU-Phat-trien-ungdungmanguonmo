from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models.course_content import CourseContent

router = APIRouter()


@router.get("/courses/{course_id}/lessons")
def list_lessons(course_id: int, db: Session = Depends(get_db)):
    return db.query(CourseContent).filter(CourseContent.khoa_hoc_id == course_id).all()

