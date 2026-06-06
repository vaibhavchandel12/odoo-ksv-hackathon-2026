import uuid
from datetime import datetime
from pydantic import BaseModel

class RoleBase(BaseModel):
    name: str
    description: str | None = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    pass

class Role(RoleBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
