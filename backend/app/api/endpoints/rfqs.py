from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.api import deps
from backend.app.models.rfq import RFQ, RFQLine
from backend.app.models.user import User
from backend.app.schemas.rfq import RFQCreate, RFQUpdate, RFQResponse
from backend.app.core.email import send_rfq_email_to_vendor
from backend.app.core.audit import log_audit

router = APIRouter()

@router.post("/", response_model=RFQResponse, status_code=status.HTTP_201_CREATED)
def create_rfq(
    rfq_in: RFQCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["Admin", "Procurement Officer"]))
):
    """Create a new Request for Quotation."""
    db_rfq = RFQ(
        title=rfq_in.title,
        description=rfq_in.description,
        category_id=rfq_in.category_id,
        deadline=rfq_in.deadline,
        status=rfq_in.status,
        gst_percentage=rfq_in.gst_percentage
    )
    db.add(db_rfq)
    db.flush()

    for line in rfq_in.lines:
        db_line = RFQLine(
            rfq_id=db_rfq.id,
            product_id=line.product_id,
            quantity=line.quantity,
            unit=line.unit
        )
        db.add(db_line)

    if rfq_in.vendor_ids:
        vendors = db.query(User).filter(User.id.in_(rfq_in.vendor_ids)).all()
        db_rfq.vendors.extend(vendors)

    db.commit()
    db.refresh(db_rfq)
    
    log_audit(db, current_user.id, "CREATE", "RFQ", str(db_rfq.id), f"Created RFQ: {db_rfq.title}")
    
    # Send email notification if sent to vendor
    if db_rfq.status == "Sent to Vendor":
        for vendor in db_rfq.vendors:
            send_rfq_email_to_vendor(vendor.email, vendor.first_name, db_rfq.title)

    return db_rfq

@router.get("/", response_model=List[RFQResponse])
def get_rfqs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all RFQs. Vendors only see Active RFQs."""
    from sqlalchemy.orm import joinedload
    query = db.query(RFQ).options(joinedload(RFQ.lines), joinedload(RFQ.vendors))
    if current_user.role.name == "Vendor":
        query = query.filter(RFQ.status.in_(["Sent to Vendor", "Reviewed Quotations"]))
        query = query.filter(RFQ.vendors.any(User.id == current_user.id))
    return query.all()

import uuid

@router.get("/{rfq_id}", response_model=RFQResponse)
def get_rfq(
    rfq_id: uuid.UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get a specific RFQ by ID."""
    from sqlalchemy.orm import joinedload
    rfq = db.query(RFQ).options(joinedload(RFQ.lines), joinedload(RFQ.vendors)).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    if current_user.role.name == "Vendor":
        if rfq.status not in ["Sent to Vendor", "Reviewed Quotations"] or not any(v.id == current_user.id for v in rfq.vendors):
            raise HTTPException(status_code=403, detail="Not authorized to view this RFQ")
    return rfq

@router.put("/{rfq_id}", response_model=RFQResponse)
def update_rfq(
    rfq_id: uuid.UUID,
    rfq_in: RFQCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["Admin", "Procurement Officer"]))
):
    """Update an existing Request for Quotation."""
    db_rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not db_rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    old_status = db_rfq.status

    db_rfq.title = rfq_in.title
    db_rfq.description = rfq_in.description
    db_rfq.category_id = rfq_in.category_id
    db_rfq.deadline = rfq_in.deadline
    db_rfq.status = rfq_in.status
    db_rfq.gst_percentage = rfq_in.gst_percentage

    # Update lines: simplistic approach is to delete old and insert new
    db.query(RFQLine).filter(RFQLine.rfq_id == rfq_id).delete()
    for line in rfq_in.lines:
        db_line = RFQLine(
            rfq_id=db_rfq.id,
            product_id=line.product_id,
            quantity=line.quantity,
            unit=line.unit
        )
        db.add(db_line)

    # Update vendors
    db_rfq.vendors = []
    if rfq_in.vendor_ids:
        vendors = db.query(User).filter(User.id.in_(rfq_in.vendor_ids)).all()
        db_rfq.vendors.extend(vendors)

    db.commit()
    db.refresh(db_rfq)

    log_audit(db, current_user.id, "UPDATE", "RFQ", str(db_rfq.id), f"Updated RFQ: {db_rfq.title}")

    # Optionally send email if status changed to Sent to Vendor
    if db_rfq.status == "Sent to Vendor" and old_status != "Sent to Vendor":
        for vendor in db_rfq.vendors:
            send_rfq_email_to_vendor(vendor.email, vendor.first_name, db_rfq.title)

    return db_rfq
