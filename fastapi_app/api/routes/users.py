from fastapi import APIRouter, Depends, HTTPException, status

from ...api import deps
from ...schemas.user import UserOut
from ...models.user import User
from ...db.session import get_db
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/users/me", response_model=UserOut)
def get_me(current_user: User = Depends(deps.get_current_active_user)):
    return current_user


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """List all users - chỉ admin mới có quyền"""
    from ...models.user import UserRole
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ admin mới có quyền")
    
    users = db.query(User).all()
    return users

