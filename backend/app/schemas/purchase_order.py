import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class PurchaseOrderLineBase(BaseModel):
    product_id: str
    quantity: int
    unit_price: float
    total_price: float

class PurchaseOrderLineResponse(PurchaseOrderLineBase):
    id: uuid.UUID
    po_id: uuid.UUID
    product_name: Optional[str] = None

    class Config:
        from_attributes = True

class PurchaseOrderCreate(BaseModel):
    quotation_id: uuid.UUID

class PurchaseOrderResponse(BaseModel):
    id: uuid.UUID
    po_number: str
    vendor_id: uuid.UUID
    quotation_id: Optional[uuid.UUID] = None
    status: str
    po_date: datetime
    due_date: datetime
    subtotal: float
    cgst: float
    sgst: float
    grand_total: float
    created_at: datetime
    updated_at: datetime
    lines: List[PurchaseOrderLineResponse] = []
    
    vendor_name: Optional[str] = None
    vendor_email: Optional[str] = None

    class Config:
        from_attributes = True
