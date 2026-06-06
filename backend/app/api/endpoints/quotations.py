import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.rfq import RFQ
from backend.app.models.quotation import Quotation, QuotationLine
from backend.app.models.product import Product
from backend.app.models.purchase_order import PurchaseOrder
from backend.app.schemas.quotation import QuotationCreate, QuotationUpdate, QuotationListResponse, QuotationLineResponse
from backend.app.core.audit import log_audit

router = APIRouter()

@router.post("/", response_model=QuotationListResponse, status_code=status.HTTP_201_CREATED)
def create_quotation(
    quotation_in: QuotationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["Vendor"]))
):
    """Vendor-only: Submit a new quotation with multiple products."""
    
    # Verify RFQ exists and is active
    rfq = db.query(RFQ).filter(RFQ.id == quotation_in.rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    if rfq.status not in ["Sent to Vendor", "Reviewed Quotations"]:
        raise HTTPException(status_code=400, detail="Cannot submit quotation for inactive RFQ")

    # Create Quotation
    db_quotation = Quotation(
        vendor_id=current_user.id,
        rfq_id=quotation_in.rfq_id,
        status="Pending"
    )
    db.add(db_quotation)
    db.flush() # flush to get the quotation ID

    # Auto-update RFQ status if this is the first quotation
    if rfq.status == "Sent to Vendor":
        rfq.status = "Reviewed Quotations"
        db.add(rfq)

    lines_response = []
    
    # Create Quotation Lines
    for line_in in quotation_in.lines:
        # Verify product exists
        product = db.query(Product).filter(Product.id == str(line_in.product_id)).first()
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product with ID {line_in.product_id} not found")

        db_line = QuotationLine(
            quotation_id=db_quotation.id,
            product_id=str(line_in.product_id),
            vendor_code=line_in.vendor_code,
            quantity=line_in.quantity,
            price=line_in.price,
            lead_time_days=line_in.lead_time_days
        )
        db.add(db_line)
        db.flush() # Get line ID
        
        lines_response.append(QuotationLineResponse(
            id=db_line.id,
            quotation_id=db_quotation.id,
            product_id=db_line.product_id,
            vendor_code=db_line.vendor_code,
            quantity=db_line.quantity,
            price=db_line.price,
            lead_time_days=db_line.lead_time_days,
            product_name=product.name
        ))

    db.commit()
    db.refresh(db_quotation)
    
    log_audit(db, current_user.id, "CREATE", "Quotation", str(db_quotation.id), f"Vendor {current_user.first_name} submitted quotation for RFQ")

    return QuotationListResponse(
        id=db_quotation.id,
        vendor_id=db_quotation.vendor_id,
        rfq_id=db_quotation.rfq_id,
        status=db_quotation.status,
        manager_status=db_quotation.manager_status,
        financer_status=db_quotation.financer_status,
        manager_remarks=db_quotation.manager_remarks,
        financer_remarks=db_quotation.financer_remarks,
        manager_approved_at=db_quotation.manager_approved_at,
        financer_approved_at=db_quotation.financer_approved_at,
        created_at=db_quotation.created_at,
        updated_at=db_quotation.updated_at,
        vendor_name=f"{current_user.first_name} {current_user.last_name}",
        rfq_title=rfq.title,
        manager_name=None,
        financer_name=None,
        has_po=False,
        lines=lines_response
    )

@router.get("/", response_model=List[QuotationListResponse])
def get_quotations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get quotations.
    Vendors see only their own.
    Procurement/Admin see all.
    """
    query = db.query(Quotation).options(
        joinedload(Quotation.vendor),
        joinedload(Quotation.rfq),
        joinedload(Quotation.manager),
        joinedload(Quotation.financer),
        joinedload(Quotation.lines).joinedload(QuotationLine.product)
    )
    
    if current_user.role.name == "Vendor":
        query = query.filter(Quotation.vendor_id == current_user.id)
    elif current_user.role.name not in ["Admin", "Procurement Officer", "Manager"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    quotations = query.all()
    
    # Check which quotations have purchase orders
    quotation_ids = [q.id for q in quotations]
    pos = db.query(PurchaseOrder.quotation_id).filter(PurchaseOrder.quotation_id.in_(quotation_ids)).all()
    po_quotation_ids = {po[0] for po in pos}
    
    result = []
    for q in quotations:
        lines_resp = []
        for line in q.lines:
            lines_resp.append(QuotationLineResponse(
                id=line.id,
                quotation_id=line.quotation_id,
                product_id=line.product_id,
                vendor_code=line.vendor_code,
                quantity=line.quantity,
                price=line.price,
                lead_time_days=line.lead_time_days,
                product_name=line.product.name if line.product else None
            ))

        result.append(QuotationListResponse(
            id=q.id,
            vendor_id=q.vendor_id,
            rfq_id=q.rfq_id,
            status=q.status,
            manager_status=q.manager_status,
            financer_status=q.financer_status,
            manager_remarks=q.manager_remarks,
            financer_remarks=q.financer_remarks,
            manager_approved_at=q.manager_approved_at,
            financer_approved_at=q.financer_approved_at,
            created_at=q.created_at,
            updated_at=q.updated_at,
            vendor_name=f"{q.vendor.first_name} {q.vendor.last_name}" if q.vendor else "Unknown",
            rfq_title=q.rfq.title if q.rfq else "Unknown",
            manager_name=f"{q.manager.first_name} {q.manager.last_name}" if q.manager else None,
            financer_name=f"{q.financer.first_name} {q.financer.last_name}" if q.financer else None,
            has_po=q.id in po_quotation_ids,
            lines=lines_resp
        ))
    return result

@router.patch("/{quotation_id}", response_model=QuotationListResponse)
def update_quotation_status(
    quotation_id: str,
    update_data: QuotationUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update quotation status (Approve/Reject) depending on role."""
    try:
        q_uuid = uuid.UUID(quotation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid quotation ID format")

    quotation = db.query(Quotation).options(
        joinedload(Quotation.vendor),
        joinedload(Quotation.rfq),
        joinedload(Quotation.manager),
        joinedload(Quotation.financer),
        joinedload(Quotation.lines).joinedload(QuotationLine.product)
    ).filter(Quotation.id == q_uuid).first()
    
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
        
    role = current_user.role.name
    
    if update_data.manager_status and role == "Manager":
        if update_data.manager_status not in ["Awaiting", "Approved", "Rejected"]:
            raise HTTPException(status_code=400, detail="Invalid manager status")
        quotation.manager_status = update_data.manager_status
        quotation.manager_id = current_user.id
        from datetime import datetime
        quotation.manager_approved_at = datetime.utcnow()
        if update_data.manager_remarks is not None:
            quotation.manager_remarks = update_data.manager_remarks

    if update_data.financer_status and role == "Financer":
        if update_data.financer_status not in ["Awaiting", "Approved", "Rejected"]:
            raise HTTPException(status_code=400, detail="Invalid financer status")
        quotation.financer_status = update_data.financer_status
        quotation.financer_id = current_user.id
        from datetime import datetime
        quotation.financer_approved_at = datetime.utcnow()
        if update_data.financer_remarks is not None:
            quotation.financer_remarks = update_data.financer_remarks

    # If Financer approves, the overall quotation is approved
    if quotation.financer_status == "Approved" and quotation.manager_status == "Approved":
        quotation.status = "Approved"
    elif quotation.financer_status == "Rejected" or quotation.manager_status == "Rejected":
        quotation.status = "Rejected"
    
    # Allow Procurement/Admin to override overall status directly
    if update_data.status and role in ["Admin", "Procurement Officer"]:
        if update_data.status not in ["Pending", "Approved", "Rejected"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        quotation.status = update_data.status

    # Auto-reject other quotations if this one is overall approved
    if quotation.status == "Approved":
        other_quotations = db.query(Quotation).filter(
            Quotation.rfq_id == quotation.rfq_id,
            Quotation.id != quotation.id,
            Quotation.status == "Pending"
        ).all()
        for oq in other_quotations:
            oq.status = "Rejected"
            
    db.commit()
    db.refresh(quotation)
    
    log_audit(db, current_user.id, "UPDATE", "Quotation", str(quotation.id), f"Quotation updated by {role} - Overall Status: {quotation.status}")
    
    lines_resp = []
    for line in quotation.lines:
        lines_resp.append(QuotationLineResponse(
            id=line.id,
            quotation_id=line.quotation_id,
            product_id=line.product_id,
            vendor_code=line.vendor_code,
            quantity=line.quantity,
            price=line.price,
            lead_time_days=line.lead_time_days,
            product_name=line.product.name if line.product else None
        ))
    
    return QuotationListResponse(
        id=quotation.id,
        vendor_id=quotation.vendor_id,
        rfq_id=quotation.rfq_id,
        status=quotation.status,
        manager_status=quotation.manager_status,
        financer_status=quotation.financer_status,
        manager_remarks=quotation.manager_remarks,
        financer_remarks=quotation.financer_remarks,
        manager_approved_at=quotation.manager_approved_at,
        financer_approved_at=quotation.financer_approved_at,
        created_at=quotation.created_at,
        updated_at=quotation.updated_at,
        vendor_name=f"{quotation.vendor.first_name} {quotation.vendor.last_name}" if quotation.vendor else "Unknown",
        rfq_title=quotation.rfq.title if quotation.rfq else "Unknown",
        manager_name=f"{quotation.manager.first_name} {quotation.manager.last_name}" if quotation.manager else None,
        financer_name=f"{quotation.financer.first_name} {quotation.financer.last_name}" if quotation.financer else None,
        has_po=db.query(PurchaseOrder).filter(PurchaseOrder.quotation_id == quotation.id).first() is not None,
        lines=lines_resp
    )
