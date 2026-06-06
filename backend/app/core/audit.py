from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import logging
from backend.app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)

def log_audit(
    db: Session,
    user_id: Optional[UUID],
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    details: Optional[str] = None
):
    try:
        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            details=details
        )
        db.add(audit_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log audit event: {e}")
