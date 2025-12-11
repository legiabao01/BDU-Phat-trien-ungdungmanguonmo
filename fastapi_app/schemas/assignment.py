from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class AssignmentBase(BaseModel):
    tieu_de: str
    noi_dung: str
    han_nop: Optional[datetime] = None
    is_required: bool = False
    diem_toi_da: Optional[Decimal] = 10.0


class AssignmentCreate(AssignmentBase):
    khoa_hoc_id: int


class AssignmentOut(AssignmentBase):
    id: int
    khoa_hoc_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubmissionBase(BaseModel):
    noi_dung: Optional[str] = None
    file_path: Optional[str] = None


class SubmissionCreate(SubmissionBase):
    bai_tap_id: int


class SubmissionOut(SubmissionBase):
    id: int
    bai_tap_id: int
    user_id: int
    diem: Optional[Decimal] = None
    nhan_xet: Optional[str] = None
    trang_thai: str
    ngay_nop: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True



