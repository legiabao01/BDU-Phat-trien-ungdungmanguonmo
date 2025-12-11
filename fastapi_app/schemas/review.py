from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    diem: int = Field(..., ge=1, le=5, description="Điểm đánh giá từ 1-5 sao")
    noi_dung: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewOut(ReviewBase):
    id: int
    khoa_hoc_id: int
    nguoi_dung_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReviewWithUser(ReviewOut):
    user_name: Optional[str] = None
    user_email: Optional[str] = None

