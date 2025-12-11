from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ...core.security import verify_password, hash_password, create_access_token
from ...db.session import get_db
from ...models.user import User, UserRole
from ...schemas.auth import LoginRequest, RegisterRequest, Token
from ...schemas.user import UserOut

router = APIRouter()


@router.post("/auth/register", response_model=UserOut)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email đã tồn tại")

    user = User(
        ho_ten=payload.ho_ten,
        email=payload.email,
        password_hash=hash_password(payload.password),
        so_dien_thoai=payload.so_dien_thoai,
        role=UserRole.student,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=Token)
def login(payload: LoginRequest = Body(...), db: Session = Depends(get_db)):
    # Nhận JSON body: { "email": "...", "password": "..." }
    username = payload.email
    password = payload.password

    user = db.query(User).filter(User.email == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sai email hoặc mật khẩu")

    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)
