from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from db.session import Base


class CourseContent(Base):
    __tablename__ = "course_content"

    id = Column(Integer, primary_key=True, index=True)
    khoa_hoc_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    tieu_de_muc = Column(String(200), nullable=False)
    noi_dung = Column(Text)
    hinh_anh = Column(String(255))
    video_path = Column(String(500))
    video_duration = Column(Integer, default=0)
    thu_tu = Column(Integer, default=0)
    is_unlocked = Column(Boolean, default=True)
    unlock_date = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

