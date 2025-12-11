from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from ..db.base import Base


class Discussion(Base):
    __tablename__ = "thao_luan"

    id = Column(Integer, primary_key=True, index=True)
    khoa_hoc_id = Column(Integer, ForeignKey("khoa_hoc.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    noi_dung = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())



