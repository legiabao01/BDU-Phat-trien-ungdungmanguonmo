import enum
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.base import Base


class CourseStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    draft = "draft"


class CourseMode(str, enum.Enum):
    online = "online"
    offline = "offline"
    hybrid = "hybrid"


class Course(Base):
    __tablename__ = "khoa_hoc"

    id = Column(Integer, primary_key=True, index=True)
    tieu_de = Column(String(200), nullable=False)
    mo_ta = Column(Text)
    cap_do = Column(String(50))
    hinh_anh = Column(String(255))
    gia = Column(Numeric(10, 2), default=0)
    gia_goc = Column(Numeric(10, 2))
    so_buoi = Column(Integer, default=0)
    thoi_luong = Column(String(50))
    hinh_thuc = Column(Enum(CourseMode), default=CourseMode.online)
    trang_thai = Column(Enum(CourseStatus), default=CourseStatus.active)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    teacher = relationship("User", backref="courses")
    contents = relationship("CourseContent", back_populates="course", cascade="all, delete-orphan")
