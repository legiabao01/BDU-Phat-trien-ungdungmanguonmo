from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProgressBase(BaseModel):
    course_id: int
    lesson_id: Optional[int] = None
    completed: bool = False
    progress_percentage: Optional[float] = 0.0


class ProgressCreate(ProgressBase):
    pass


class ProgressOut(ProgressBase):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True



