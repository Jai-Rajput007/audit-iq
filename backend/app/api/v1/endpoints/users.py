from fastapi import APIRouter, Depends

from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(user)


@router.get("/admin/check")
def admin_check(user: User = Depends(require_role({"Admin"}))) -> dict[str, str]:
    return {"status": "ok", "message": f"Admin access granted for {user.email}"}
