import uuid
from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from backend.app.api import deps
from backend.app.models.user import User
from backend.app.models.quotation import Quotation, QuotationLine
from backend.app.models.purchase_order import PurchaseOrder, PurchaseOrderLine
from backend.app.schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderResponse, PurchaseOrderLineResponse

router = APIRouter()

@router.post("/", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
def create_purchase_order(
    po_in: PurchaseOrderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["Admin", "Procurement Officer", "Manager"]))
):
    """Generate a Purchase Order from an Approved Quotation."""
    # Verify quotation exists and is approved
    try:
        q_uuid = uuid.UUID(str(po_in.quotation_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid quotation ID format")

    quotation = db.query(Quotation).options(joinedload(Quotation.lines)).filter(Quotation.id == q_uuid).first()
    
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
        
    if quotation.status != "Approved":
        raise HTTPException(status_code=400, detail="Can only generate PO for Approved quotations")

    # Check if PO already exists for this quotation
    existing_po = db.query(PurchaseOrder).filter(PurchaseOrder.quotation_id == q_uuid).first()
    if existing_po:
        raise HTTPException(status_code=400, detail="A Purchase Order has already been generated for this quotation")

    # Generate PO Number
    po_count = db.query(PurchaseOrder).count()
    po_number = f"PO-{datetime.utcnow().year}-{str(po_count + 1).zfill(4)}"

    # Calculate Totals
    subtotal = sum(line.price * line.quantity for line in quotation.lines)
    
    # 9% CGST and SGST
    cgst = round(subtotal * 0.09, 2)
    sgst = round(subtotal * 0.09, 2)
    grand_total = subtotal + cgst + sgst

    db_po = PurchaseOrder(
        po_number=po_number,
        vendor_id=quotation.vendor_id,
        quotation_id=quotation.id,
        status="Pending Payment",
        po_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=30),
        subtotal=subtotal,
        cgst=cgst,
        sgst=sgst,
        grand_total=grand_total
    )
    db.add(db_po)
    db.flush()

    for line in quotation.lines:
        db_po_line = PurchaseOrderLine(
            po_id=db_po.id,
            product_id=line.product_id,
            quantity=line.quantity,
            unit_price=line.price,
            total_price=line.price * line.quantity
        )
        db.add(db_po_line)

    db.commit()
    db.refresh(db_po)
    
    return _format_po_response(db_po, db)


@router.get("/", response_model=List[PurchaseOrderResponse])
def get_purchase_orders(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all purchase orders. Vendors see only their own."""
    query = db.query(PurchaseOrder).options(
        joinedload(PurchaseOrder.vendor),
        joinedload(PurchaseOrder.lines).joinedload(PurchaseOrderLine.product)
    )
    
    if current_user.role.name == "Vendor":
        query = query.filter(PurchaseOrder.vendor_id == current_user.id)
        
    pos = query.all()
    return [_format_po_response(po, db) for po in pos]


@router.get("/{po_id}", response_model=PurchaseOrderResponse)
def get_purchase_order(
    po_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    try:
        po_uuid = uuid.UUID(po_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid PO ID")

    po = db.query(PurchaseOrder).options(
        joinedload(PurchaseOrder.vendor),
        joinedload(PurchaseOrder.lines).joinedload(PurchaseOrderLine.product)
    ).filter(PurchaseOrder.id == po_uuid).first()
    
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
        
    if current_user.role.name == "Vendor" and po.vendor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return _format_po_response(po, db)


@router.patch("/{po_id}/pay", response_model=PurchaseOrderResponse)
def mark_po_as_paid(
    po_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["Admin", "Manager", "Procurement Officer"]))
):
    try:
        po_uuid = uuid.UUID(po_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid PO ID")

    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_uuid).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
        
    po.status = "Paid"
    db.commit()
    db.refresh(po)
    
    po_full = db.query(PurchaseOrder).options(
        joinedload(PurchaseOrder.vendor),
        joinedload(PurchaseOrder.lines).joinedload(PurchaseOrderLine.product)
    ).filter(PurchaseOrder.id == po_uuid).first()
    
    return _format_po_response(po_full, db)


def _format_po_response(po: PurchaseOrder, db: Session) -> PurchaseOrderResponse:
    lines_resp = []
    for line in po.lines:
        lines_resp.append(PurchaseOrderLineResponse(
            id=line.id,
            po_id=line.po_id,
            product_id=line.product_id,
            quantity=line.quantity,
            unit_price=line.unit_price,
            total_price=line.total_price,
            product_name=line.product.name if line.product else "Unknown Product"
        ))
        
    return PurchaseOrderResponse(
        id=po.id,
        po_number=po.po_number,
        vendor_id=po.vendor_id,
        quotation_id=po.quotation_id,
        status=po.status,
        po_date=po.po_date,
        due_date=po.due_date,
        subtotal=po.subtotal,
        cgst=po.cgst,
        sgst=po.sgst,
        grand_total=po.grand_total,
        created_at=po.created_at,
        updated_at=po.updated_at,
        lines=lines_resp,
        vendor_name=f"{po.vendor.first_name} {po.vendor.last_name}" if po.vendor else None,
        vendor_email=po.vendor.email if po.vendor else None
    )
