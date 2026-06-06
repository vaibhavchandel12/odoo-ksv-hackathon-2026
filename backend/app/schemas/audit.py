from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    user_name: Optional[str]
    user_email: Optional[str]
    action: str
    entity_type: str
    entity_id: Optional[str]
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
