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

@router.get("/notifications")
def get_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get the 5 most recent system notifications relevant to the user."""
    # For a hackathon, we'll return recent system audits, filtering out noisy ones
    query = db.query(AuditLog).filter(AuditLog.action.in_(["CREATE", "UPDATE", "EMAIL"])).order_by(desc(AuditLog.created_at))
    
    # Filter based on role logic
    if current_user.role.name == "Vendor":
        query = query.filter(AuditLog.details.like(f"%{current_user.email}%")) # Try to find vendor specific alerts
    elif current_user.role.name == "Manager":
        query = query.filter(AuditLog.entity_type.in_(["Quotation", "PurchaseOrder"]))
        
    logs = query.limit(5).all()
    
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "action": log.action,
            "entity": log.entity_type,
            "message": log.details,
            "time": log.created_at
        })
        
    # Provide a fallback mock notification if the log is empty
    if not result:
        result.append({
            "id": "mock-1",
            "action": "SYSTEM",
            "entity": "System",
            "message": f"Welcome to VendorBridge, {current_user.first_name}!",
            "time": "Just now"
        })
        
    return result
