from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.audit import AuditLogResponse
from sqlalchemy import desc

router = APIRouter()

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["Admin"]))
):
    """Admin-only: Get all system audit logs."""
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).all()
    
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "user_name": f"{log.user.first_name} {log.user.last_name}" if log.user else "System",
            "user_email": log.user.email if log.user else "N/A",
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": log.created_at
        })
        
    return result
