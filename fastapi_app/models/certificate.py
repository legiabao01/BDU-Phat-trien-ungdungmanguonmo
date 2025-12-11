from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from ..db.base import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("khoa_hoc.id"), nullable=False)
    certificate_code = Column(String(100), unique=True, nullable=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())



