import logging
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api import deps
from backend.app.core.config import settings
from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from backend.app.models.user import User
from backend.app.models.role import Role
from backend.app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from backend.app.schemas.user import UserPublicSignup

router = APIRouter()
logger = logging.getLogger("vendorbridge.auth")

def create_reset_token(email: str) -> str:
    """Create a short-lived token for password resets."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    return jwt.encode(
        {"exp": expire, "sub": email, "type": "reset"},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserPublicSignup, db: Session = Depends(deps.get_db)):
    """Registers a new user as a Vendor and returns access and refresh JWTs."""
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # Hardcode role to Vendor for public signups
    role = db.query(Role).filter(Role.name == "Vendor").first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Vendor role not found in the system."
        )
        
    db_user = User(
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        role_id=role.id,
        is_active=True, # Active by default
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(db_user.id)
    refresh_token = create_refresh_token(db_user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=TokenResponse)
def login(login_in: LoginRequest, db: Session = Depends(deps.get_db)):
    """Log in an existing user and return access and refresh JWTs."""
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is deactivated"
        )
        
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(deps.get_db)):
    """Generates a password reset token and outputs the reset link."""
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        reset_token = create_reset_token(user.email)
        # Construct the local link for convenience
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        
        # Log to terminal console for development visibility
        print(f"\n========================================\n"
              f"PASSWORD RESET EMAIL SENT (MOCK):\n"
              f"To: {user.email}\n"
              f"Reset Link: {reset_link}\n"
              f"========================================\n")
              
        return {
            "message": "Password reset link has been dispatched to your email address.",
            "reset_token": reset_token  # Returned for frontend integration / testing convenience
        }
    
    # Return positive message anyway to prevent email harvesting
    return {
        "message": "If the email is registered, a password reset link has been dispatched."
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(deps.get_db)):
    """Verifies reset token and updates the user's password."""
    try:
        payload = jwt.decode(req.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "reset":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")
        email = payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The password reset link has expired.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or corrupt password reset link.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Your password has been reset successfully."}
