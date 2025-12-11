from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum as SQLEnum, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..db.base import Base


class EnrollmentStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class Enrollment(Base):
    __tablename__ = "dang_ky_khoa_hoc"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    khoa_hoc_id = Column(Integer, ForeignKey("khoa_hoc.id"), nullable=False)
    trang_thai = Column(String(20), default="active")
    ngay_dang_ky = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="enrollments")
    course = relationship("Course", backref="enrollments")



