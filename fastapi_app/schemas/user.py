from pydantic import BaseModel, EmailStr
from typing import Optional
from ..models.user import UserRole


class UserBase(BaseModel):
    ho_ten: str
    email: EmailStr
    so_dien_thoai: Optional[str] = None
    role: UserRole = UserRole.student


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True
