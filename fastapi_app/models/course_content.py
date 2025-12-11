from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from ..db.base import Base


class CourseContent(Base):
    __tablename__ = "chi_tiet_khoa_hoc"

    id = Column(Integer, primary_key=True, index=True)
    khoa_hoc_id = Column(Integer, ForeignKey("khoa_hoc.id"), nullable=False)
    tieu_de_muc = Column(String(200), nullable=False)
    noi_dung = Column(Text)
    hinh_anh = Column(String(255))
    video_path = Column(String(500))
    video_duration = Column(Integer, default=0)
    thu_tu = Column(Integer, default=0)
    is_unlocked = Column(Boolean, default=True)
    unlock_date = Column(DateTime(timezone=True))
    # Tài liệu và resources
    tai_lieu_pdf = Column(String(500), nullable=True)  # Đường dẫn file PDF
    tai_lieu_links = Column(JSONB, nullable=True)  # Danh sách links: [{"title": "...", "url": "..."}, ...]
    resources = Column(JSONB, nullable=True)  # Tài nguyên khác: [{"type": "pdf|link|code", "title": "...", "url": "...", "description": "..."}, ...]
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    course = relationship("Course", back_populates="contents")



