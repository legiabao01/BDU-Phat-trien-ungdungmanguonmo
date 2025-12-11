from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, EmailStr

from ...api import deps
from ...schemas.user import UserOut
from ...models.user import User, UserRole
from ...db.session import get_db
from sqlalchemy.orm import Session
from ...core.security import hash_password

router = APIRouter()


class UserUpdate(BaseModel):
    ho_ten: str | None = None
    email: EmailStr | None = None
    so_dien_thoai: str | None = None
    role: str | None = None
    is_active: bool | None = None


class UserCreate(BaseModel):
    ho_ten: str
    email: EmailStr
    password: str
    so_dien_thoai: str | None = None
    role: str = "student"
    is_active: bool = True


@router.get("/users/me", response_model=UserOut)
def get_me(current_user: User = Depends(deps.get_current_active_user)):
    return current_user


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người dùng không tồn tại")
    return user


@router.get("/users")
def list_users(
    role: str | None = None,
    is_active: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """List all users - chỉ admin mới có quyền"""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ admin mới có quyền")
    
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.all()
    return users


@router.post("/admin/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Tạo người dùng mới - chỉ admin"""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ admin mới có quyền")
    
    # Kiểm tra email đã tồn tại
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email đã tồn tại")
    
    user = User(
        ho_ten=payload.ho_ten,
        email=payload.email,
        password_hash=hash_password(payload.password),
        so_dien_thoai=payload.so_dien_thoai,
        role=UserRole(payload.role),
        is_active=payload.is_active
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/admin/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Cập nhật thông tin người dùng - chỉ admin"""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ admin mới có quyền")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người dùng không tồn tại")
    
    if payload.ho_ten:
        user.ho_ten = payload.ho_ten
    if payload.email:
        # Kiểm tra email trùng
        existing = db.query(User).filter(User.email == payload.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email đã tồn tại")
        user.email = payload.email
    if payload.so_dien_thoai is not None:
        user.so_dien_thoai = payload.so_dien_thoai
    if payload.role:
        user.role = UserRole(payload.role)
    if payload.is_active is not None:
        user.is_active = payload.is_active
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Xóa người dùng - chỉ admin (hoặc khóa tài khoản)"""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ admin mới có quyền")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người dùng không tồn tại")
    
    # Không cho xóa chính mình
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không thể xóa chính mình")
    
    # Thay vì xóa, khóa tài khoản
    user.is_active = False
    db.commit()
    return None

