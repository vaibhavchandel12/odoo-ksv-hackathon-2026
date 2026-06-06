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

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    role_id: uuid.UUID | None = None
    is_active: bool | None = None
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
    created_at: datetime
