import os
import sys
import uuid
import random
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

env_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                parts = line.split("=", 1)
                os.environ[parts[0].strip()] = parts[1].strip()

from backend.app.core.database import SessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models.role import Role
from backend.app.models.user import User
from backend.app.models.category import Category
from backend.app.models.product import Product
from backend.app.models.rfq import RFQ, RFQLine
from backend.app.models.quotation import Quotation, QuotationLine
from backend.app.models.purchase_order import PurchaseOrder, PurchaseOrderLine

def seed_business_data():
    db = SessionLocal()
    try:
        print("Starting business data seed...")
        
        # 1. Ensure Roles exist
        roles = {}
        for role_name in ["Vendor", "Manager", "Procurement Officer", "Financer", "Admin"]:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name, description=f"{role_name} System Role")
                db.add(role)
                db.commit()
                db.refresh(role)
            roles[role_name] = role

        # 2. Create Vendor Users
        vendor_companies = [
            ("TechSupply", "Inc"), ("Global", "Hardware"), ("Office", "Depot"),
            ("Alpha", "Electronics"), ("Omega", "Solutions")
        ]
        vendors = []
        for first, last in vendor_companies:
            email = f"contact@{first.lower()}{last.lower()}.com"
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    first_name=first,
                    last_name=last,
                    email=email,
                    phone=f"555-{random.randint(1000, 9999)}",
                    password_hash=get_password_hash("vendor123"),
                    role_id=roles["Vendor"].id,
                    gst_details=f"GST{random.randint(100000, 999999)}IN"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            vendors.append(user)
        print(f"Ensured {len(vendors)} vendor users exist.")

        # Ensure Staff exist
        manager = db.query(User).filter(User.email == "manager@vendorbridge.com").first()
        if not manager:
            manager = User(first_name="Sys", last_name="Manager", email="manager@vendorbridge.com", password_hash=get_password_hash("password"), role_id=roles["Manager"].id)
            db.add(manager)
            db.commit()

        financer = db.query(User).filter(User.email == "finance@vendorbridge.com").first()
        if not financer:
            financer = User(first_name="Sys", last_name="Financer", email="finance@vendorbridge.com", password_hash=get_password_hash("password"), role_id=roles["Financer"].id)
            db.add(financer)
            db.commit()
            
        pro_officer = db.query(User).filter(User.email == "procurement@vendorbridge.com").first()
        if not pro_officer:
            pro_officer = User(first_name="Sys", last_name="Procurement", email="procurement@vendorbridge.com", password_hash=get_password_hash("password"), role_id=roles["Procurement Officer"].id)
            db.add(pro_officer)
            db.commit()


        # 3. Get Products & Categories
        categories = db.query(Category).all()
        products = db.query(Product).all()

        if not categories or not products:
            print("No products or categories found! Please run seed_data.py first.")
            return

        # 4. Create RFQs
        rfq_titles = [
            "Q3 Electronics Procurement", "Office Expansion Hardware", 
            "Annual Server Upgrades", "Employee Work-from-Home Kits",
            "Warehouse Networking Gear", "Design Team Monitors",
            "Executive Office Furniture", "Security Camera Install",
            "Data Center Storage Expand", "Mobile Device Fleet Refresh"
        ]

        rfqs = []
        for i, title in enumerate(rfq_titles):
            category = random.choice(categories)
            rfq = RFQ(
                title=title,
                description=f"Detailed request for quotation for {title}.",
                status="Open Bidding" if i < 7 else "Closed",
                category_id=category.id,
                deadline=datetime.utcnow() + timedelta(days=random.randint(-5, 15)),
                gst_percentage=18.0
            )
            
            # Add random vendors
            assigned_vendors = random.sample(vendors, k=random.randint(2, 4))
            for v in assigned_vendors:
                rfq.vendors.append(v)

            db.add(rfq)
            db.commit()
            db.refresh(rfq)
            rfqs.append(rfq)

            # Add RFQ Lines
            cat_products = [p for p in products if p.category_id == category.id]
            if not cat_products:
                cat_products = products

            selected_products = random.sample(cat_products, k=random.randint(2, 5))
            for sp in selected_products:
                line = RFQLine(
                    rfq_id=rfq.id,
                    product_id=sp.id,
                    quantity=random.randint(5, 50),
                    unit="NOS"
                )
                db.add(line)
            db.commit()

        print(f"Created {len(rfqs)} RFQs with lines and assigned vendors.")

        # 5. Create Quotations for some RFQs
        quotations = []
        po_count = 0
        for rfq in rfqs[:8]: # Create quotes for the first 8 RFQs
            for vendor in rfq.vendors:
                # 70% chance a vendor submits a quote
                if random.random() < 0.7:
                    q = Quotation(
                        vendor_id=vendor.id,
                        rfq_id=rfq.id,
                        status="Submitted"
                    )
                    db.add(q)
                    db.commit()
                    db.refresh(q)
                    quotations.append(q)

                    # Add Quotation Lines based on RFQ Lines
                    rfq_lines = db.query(RFQLine).filter(RFQLine.rfq_id == rfq.id).all()
                    for r_line in rfq_lines:
                        product = db.query(Product).filter(Product.id == r_line.product_id).first()
                        base_price = product.cost if product else 100.0
                        variance = random.uniform(0.85, 1.15) # +/- 15%
                        q_line = QuotationLine(
                            quotation_id=q.id,
                            product_id=r_line.product_id,
                            vendor_code=f"VEN-{random.randint(1000,9999)}",
                            quantity=r_line.quantity,
                            price=round(base_price * variance, 2),
                            lead_time_days=random.randint(3, 21)
                        )
                        db.add(q_line)
                    db.commit()

        print(f"Created {len(quotations)} Quotations from vendors.")

        # 6. Approve some Quotations and Create POs
        # Group quotes by RFQ
        for rfq in rfqs[:5]: # Select a winner for the first 5 RFQs
            rfq_quotes = [q for q in quotations if q.rfq_id == rfq.id]
            if rfq_quotes:
                winner = random.choice(rfq_quotes)
                winner.manager_status = "Approved"
                winner.financer_status = "Approved"
                winner.status = "Approved"
                winner.manager_id = manager.id
                winner.financer_id = financer.id
                winner.manager_approved_at = datetime.utcnow()
                winner.financer_approved_at = datetime.utcnow()
                
                rfq.status = "Completed"
                db.commit()

                # Create PO
                subtotal = 0.0
                q_lines = db.query(QuotationLine).filter(QuotationLine.quotation_id == winner.id).all()
                for ql in q_lines:
                    subtotal += ql.quantity * ql.price

                cgst = subtotal * 0.09
                sgst = subtotal * 0.09
                grand_total = subtotal + cgst + sgst

                po = PurchaseOrder(
                    po_number=f"PO-{datetime.utcnow().year}-{random.randint(1000,9999)}",
                    vendor_id=winner.vendor_id,
                    quotation_id=winner.id,
                    status="Pending Bill",
                    subtotal=round(subtotal, 2),
                    cgst=round(cgst, 2),
                    sgst=round(sgst, 2),
                    grand_total=round(grand_total, 2)
                )
                db.add(po)
                db.commit()
                db.refresh(po)
                po_count += 1

                for ql in q_lines:
                    po_line = PurchaseOrderLine(
                        po_id=po.id,
                        product_id=ql.product_id,
                        quantity=ql.quantity,
                        unit_price=ql.price,
                        total_price=round(ql.quantity * ql.price, 2)
                    )
                    db.add(po_line)
                db.commit()

        print(f"Approved quotations and created {po_count} Purchase Orders.")
        print("Data Seeding Complete!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding business data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_business_data()
