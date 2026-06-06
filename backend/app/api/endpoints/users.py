from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.role import Role
from backend.app.schemas.user import UserResponse, UserUpdate, UserListResponse, UserCreate
from backend.app.core.security import get_password_hash

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(deps.get_current_user)):
    """Fetch the active authenticated user profile details based on the session token."""
    return current_user

@router.get("/", response_model=List[UserListResponse])
def read_all_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["Admin"]))
):
    """Admin-only: fetch all users with their roles."""
    users = db.query(User).all()
    # We need to map role_name for UserListResponse. 
    # Luckily, the User model has a relationship to Role
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "role_name": user.role.name if user.role else "Unknown",
            "is_active": user.is_active,
            "last_login": user.last_login,
            "created_at": user.created_at
        })
    return result

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["Admin"]))
):
    """Admin-only: create a new user."""
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
        
    role = db.query(Role).filter(Role.id == user_in.role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role_id")
        
    db_user = User(
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        role_id=user_in.role_id,
        is_active=user_in.is_active,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["Admin"]))
):
    """Admin-only: update user details, including role, status, and password."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_in.model_dump(exclude_unset=True)
    
    # Handle password hashing
    if "password" in update_data:
        password = update_data.pop("password")
        if password:
            user.password_hash = get_password_hash(password)
            
    # Handle role validation
    if "role_id" in update_data:
        role = db.query(Role).filter(Role.id == update_data["role_id"]).first()
        if not role:
            raise HTTPException(status_code=400, detail="Invalid role_id")
            
    # Apply updates
    for field, value in update_data.items():
        setattr(user, field, value)
        
    db.commit()
    db.refresh(user)
    return user
