import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

class RFQLineBase(BaseModel):
    product_id: str
    quantity: int
    unit: str

class RFQLineCreate(RFQLineBase):
    pass

class RFQLineResponse(RFQLineBase):
    id: uuid.UUID
    rfq_id: uuid.UUID

    class Config:
        from_attributes = True

class VendorSummary(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True

class RFQBase(BaseModel):
    title: str
    description: str | None = None
    category_id: str | None = None
    deadline: datetime | None = None
    status: str = "Draft"
    gst_percentage: float | None = 0.0

class RFQCreate(RFQBase):
    lines: List[RFQLineCreate] = []
    vendor_ids: List[uuid.UUID] = []

class RFQUpdate(BaseModel):
    status: str

class RFQResponse(RFQBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    lines: List[RFQLineResponse] = []
    vendors: List[VendorSummary] = []

    class Config:
        from_attributes = True
