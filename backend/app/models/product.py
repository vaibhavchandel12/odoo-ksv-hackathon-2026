from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
import uuid

from backend.app.models.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    image_url = Column(String(500), nullable=True)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=True)
    cost = Column(Float, nullable=False, default=0.0)
    on_hand_qty = Column(Integer, nullable=False, default=0)

    category = relationship("Category", back_populates="products")
