from fastapi import APIRouter, Depends
from backend.app.api import deps
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(deps.get_current_user)):
    """Fetch the active authenticated user profile details based on the session token."""
    return current_user
