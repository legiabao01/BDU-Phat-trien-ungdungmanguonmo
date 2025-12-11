from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.base import Base


class Assignment(Base):
    __tablename__ = "bai_tap"

    id = Column(Integer, primary_key=True, index=True)
    khoa_hoc_id = Column(Integer, ForeignKey("khoa_hoc.id"), nullable=False)
    tieu_de = Column(String(200), nullable=False)
    noi_dung = Column(Text, nullable=False)
    han_nop = Column(DateTime(timezone=True))
    is_required = Column(Boolean, default=False)
    diem_toi_da = Column(Numeric(5, 2), default=10.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", backref="assignments")


class Submission(Base):
    __tablename__ = "nop_bai"

    id = Column(Integer, primary_key=True, index=True)
    bai_tap_id = Column(Integer, ForeignKey("bai_tap.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    noi_dung = Column(Text)
    file_path = Column(String(500))
    diem = Column(Numeric(5, 2))
    nhan_xet = Column(Text)
    trang_thai = Column(String(20), default="submitted")  # submitted, graded, done
    ngay_nop = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assignment = relationship("Assignment", backref="submissions")
    user = relationship("User", backref="submissions")



