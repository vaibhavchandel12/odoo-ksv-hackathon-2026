import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Integer, Table, Column, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

rfq_vendors = Table(
    "rfq_vendors",
    Base.metadata,
    Column("rfq_id", ForeignKey("rfqs.id", ondelete="CASCADE"), primary_key=True),
    Column("vendor_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)

class RFQ(Base):
    __tablename__ = "rfqs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Draft", nullable=False)
    category_id: Mapped[str | None] = mapped_column(ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    gst_percentage: Mapped[Float | None] = mapped_column(Float, nullable=True, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category")
    lines = relationship("RFQLine", back_populates="rfq", cascade="all, delete-orphan")
    vendors = relationship("User", secondary=rfq_vendors, backref="assigned_rfqs")

class RFQLine(Base):
    __tablename__ = "rfq_lines"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    rfq_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="NOS")

    rfq = relationship("RFQ", back_populates="lines")
    product = relationship("Product")
