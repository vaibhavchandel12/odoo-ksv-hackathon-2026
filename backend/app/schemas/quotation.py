import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# --- Quotation Line Schemas ---

class QuotationLineBase(BaseModel):
    product_id: str
    vendor_code: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    lead_time_days: int | None = Field(None, ge=0)

class QuotationLineCreate(QuotationLineBase):
    pass

class QuotationLineResponse(QuotationLineBase):
    id: uuid.UUID
    quotation_id: uuid.UUID
    product_name: str | None = None

    class Config:
        from_attributes = True

# --- Quotation Schemas ---

class QuotationCreate(BaseModel):
    rfq_id: uuid.UUID
    lines: List[QuotationLineCreate]

class QuotationUpdate(BaseModel):
    status: str | None = None
    manager_status: str | None = None
    financer_status: str | None = None
    manager_remarks: str | None = None
    financer_remarks: str | None = None
    assigned_manager_id: uuid.UUID | None = None
    assigned_financer_id: uuid.UUID | None = None

class QuotationResponse(BaseModel):
    id: uuid.UUID
    vendor_id: uuid.UUID
    rfq_id: uuid.UUID
    status: str
    manager_status: str
    financer_status: str
    manager_remarks: str | None = None
    financer_remarks: str | None = None
    manager_approved_at: datetime | None = None
    financer_approved_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    lines: List[QuotationLineResponse] = []

    class Config:
        from_attributes = True

class QuotationListResponse(QuotationResponse):
    vendor_name: str
    rfq_title: str | None = None
    manager_name: str | None = None
    financer_name: str | None = None
    has_po: bool = False
