from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DiscussionBase(BaseModel):
    noi_dung: str


class DiscussionCreate(DiscussionBase):
    pass


class DiscussionOut(DiscussionBase):
    id: int
    khoa_hoc_id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True



