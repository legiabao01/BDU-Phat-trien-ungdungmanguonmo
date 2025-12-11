from sqlalchemy import Column, Integer, Boolean, ForeignKey, Float, DateTime
from sqlalchemy.sql import func
from ..db.base import Base


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("khoa_hoc.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("chi_tiet_khoa_hoc.id"), nullable=True)
    completed = Column(Boolean, default=False)
    progress_percentage = Column(Float, default=0.0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())



