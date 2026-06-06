import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from backend.app.schemas.role import Role

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    role_id: uuid.UUID
    is_active: bool = True
    gst_details: str | None = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserPublicSignup(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    gst_details: str | None = None
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    role_id: uuid.UUID | None = None
    is_active: bool | None = None
    gst_details: str | None = None
    password: str | None = Field(None, min_length=8)

class UserResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    role_id: uuid.UUID
    role: Role | None = None
    is_active: bool
    gst_details: str | None = None
    last_login: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        
class UserListResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    role_name: str
    is_active: bool
    gst_details: str | None = None
    last_login: datetime | None = None
    created_at: datetime
