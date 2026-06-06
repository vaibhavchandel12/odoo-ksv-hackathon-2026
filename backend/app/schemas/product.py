from pydantic import BaseModel, ConfigDict
from typing import Optional

class ProductBase(BaseModel):
    name: str
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    cost: float = 0.0
    on_hand_qty: int = 0

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    cost: Optional[float] = None
    on_hand_qty: Optional[int] = None

class ProductRead(ProductBase):
    id: str
    
    model_config = ConfigDict(from_attributes=True)
