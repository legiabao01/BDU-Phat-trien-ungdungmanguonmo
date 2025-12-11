from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from ..db.base import Base


class Review(Base):
    __tablename__ = "danh_gia_khoa_hoc"

    id = Column(Integer, primary_key=True, index=True)
    khoa_hoc_id = Column(Integer, ForeignKey("khoa_hoc.id"), nullable=False)
    nguoi_dung_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    diem = Column(Integer, nullable=False)  # 1-5 sao
    noi_dung = Column(Text)  # Nội dung đánh giá
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # course = relationship("Course", back_populates="reviews")  # TODO: Uncomment khi được import vào main.py
    # user = relationship("User", back_populates="reviews")  # TODO: Uncomment khi được import vào main.py

