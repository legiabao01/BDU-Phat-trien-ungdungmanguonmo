from fastapi import APIRouter, Depends

from ...api import deps
from ...schemas.user import UserOut
from ...models.user import User

router = APIRouter()


@router.get("/users/me", response_model=UserOut)
def get_me(current_user: User = Depends(deps.get_current_active_user)):
    return current_user

