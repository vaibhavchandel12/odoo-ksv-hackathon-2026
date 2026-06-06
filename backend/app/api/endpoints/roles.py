from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api import deps
from backend.app.models.role import Role
from backend.app.schemas.role import Role as RoleSchema

router = APIRouter()

@router.get("", response_model=list[RoleSchema])
def read_roles(db: Session = Depends(deps.get_db)):
    """Fetch all configured roles in the system for display and registration."""
    roles = db.query(Role).all()
    return roles
