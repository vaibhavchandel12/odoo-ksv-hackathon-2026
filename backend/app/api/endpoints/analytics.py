from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from backend.app.api.deps import get_db, get_current_user
from backend.app.models.user import User
from backend.app.models.role import Role
from backend.app.models.rfq import RFQ
from backend.app.models.quotation import Quotation
from backend.app.models.purchase_order import PurchaseOrder, PurchaseOrderLine
from backend.app.models.product import Product

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get dashboard stats based on the user's role."""
    role_name = current_user.role.name
    
    stats = {}
    
    if role_name == "Admin":
        total_users = db.query(User).count()
        open_pos = db.query(PurchaseOrder).count()
        pending_approvals = db.query(Quotation).filter(Quotation.status == "Pending").count()
        active_rfqs = db.query(RFQ).filter(RFQ.status == "Open").count()
        stats = {
            "total_users": total_users,
            "open_pos": open_pos,
            "pending_approvals": pending_approvals,
            "active_rfqs": active_rfqs
        }
        
    elif role_name == "Procurement Officer":
        active_rfqs = db.query(RFQ).filter(RFQ.status == "Open").count()
        received_bids = db.query(Quotation).count()
        total_pos = db.query(PurchaseOrder).count()
        invoices = db.query(PurchaseOrder).filter(PurchaseOrder.status.in_(["Billed", "Paid"])).count()
        
        stats = {
            "active_rfqs": active_rfqs,
            "received_bids": received_bids,
            "purchase_orders": total_pos,
            "invoices": invoices
        }
        
    elif role_name == "Manager":
        pending_approvals = db.query(Quotation).filter(Quotation.status == "Pending").count()
        approved_pos = db.query(PurchaseOrder).count()  # Simplified for hackathon
        total_value = db.query(func.sum(PurchaseOrder.grand_total)).scalar() or 0
        
        stats = {
            "pending_approvals": pending_approvals,
            "approved_value": f"₹{total_value:,.2f}",
            "approval_turnaround": "4.2h",
            "total_purchase_value": f"₹{total_value:,.2f}"
        }
        
    elif role_name == "Vendor":
        available_rfqs = db.query(RFQ).filter(RFQ.status == "Open").count()
        submitted_bids = db.query(Quotation).filter(Quotation.vendor_id == current_user.id).count()
        awarded = db.query(Quotation).filter(Quotation.vendor_id == current_user.id, Quotation.status == "Approved").count()
        
        # Calculate pending invoiced amount
        pos = db.query(PurchaseOrder).join(Quotation).filter(Quotation.vendor_id == current_user.id, PurchaseOrder.status == "Billed").all()
        pending_value = sum(po.grand_total for po in pos)
        
        stats = {
            "available_rfqs": available_rfqs,
            "submitted_bids": submitted_bids,
            "awarded_contracts": awarded,
            "pending_invoiced": f"₹{pending_value:,.2f}"
        }
        
    return stats

@router.get("/reports", response_model=Dict[str, Any])
def get_reports_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get data for the Reports & Analytics screen."""
    # Ensure only authorized roles can access this
    if current_user.role.name not in ["Admin", "Manager", "Financer"]:
        raise HTTPException(status_code=403, detail="Not authorized to view reports")
        
    # Vendor Performance: Spend by Vendor
    vendor_spend = db.query(
        User.first_name,
        func.sum(PurchaseOrder.grand_total).label("total_spend"),
        func.count(PurchaseOrder.id).label("po_count")
    ).select_from(PurchaseOrder).join(Quotation).join(User, Quotation.vendor_id == User.id).group_by(User.first_name).all()
    
    vendor_data = [{"vendor": row.first_name, "total_spend": float(row.total_spend) if row.total_spend else 0, "po_count": row.po_count} for row in vendor_spend]
    
    # Simple overall totals
    total_spend = db.query(func.sum(PurchaseOrder.grand_total)).scalar() or 0
    total_pos = db.query(PurchaseOrder).count()
    
    # Top 10 products on hand
    top_on_hand = db.query(Product).order_by(Product.on_hand_qty.desc()).limit(10).all()
    top_on_hand_data = [{"name": p.name, "qty": p.on_hand_qty} for p in top_on_hand]

    # Most purchased products
    most_purchased = db.query(
        Product.name,
        func.sum(PurchaseOrderLine.quantity).label("total_purchased")
    ).select_from(PurchaseOrderLine).join(Product, PurchaseOrderLine.product_id == Product.id).group_by(Product.name).order_by(func.sum(PurchaseOrderLine.quantity).desc()).limit(10).all()
    
    most_purchased_data = [{"name": row.name, "qty": row.total_purchased} for row in most_purchased]

    return {
        "vendor_performance": vendor_data,
        "top_products_on_hand": top_on_hand_data,
        "most_purchased_products": most_purchased_data,
        "summary": {
            "total_spend": float(total_spend),
            "total_purchase_orders": total_pos
        }
    }
