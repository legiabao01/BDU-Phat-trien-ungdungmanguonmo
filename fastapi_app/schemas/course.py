from pydantic import BaseModel
from typing import Optional
from ..models.course import CourseMode


class CourseBase(BaseModel):
    tieu_de: str
    mo_ta: Optional[str] = None
    cap_do: Optional[str] = None
    hinh_anh: Optional[str] = None
    gia: float = 0
    gia_goc: Optional[float] = None
    so_buoi: int = 0
    thoi_luong: Optional[str] = None
    hinh_thuc: CourseMode = CourseMode.online
    teacher_id: Optional[int] = None


class CourseCreate(CourseBase):
    pass


class CourseOut(CourseBase):
    id: int

    class Config:
        from_attributes = True