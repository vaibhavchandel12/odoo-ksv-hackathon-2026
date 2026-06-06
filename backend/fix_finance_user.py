import uuid
from backend.app.core.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.role import Role
from backend.app.core.security import get_password_hash

db = SessionLocal()
try:
    finance = db.query(User).filter(User.email == "finance@vendorbridge.com").first()
    if finance:
        finance.password_hash = get_password_hash("finance123")
        db.commit()
        print(f"Updated password for {finance.email} to 'finance123'")
    else:
        role = db.query(Role).filter(Role.name == "Financer").first()
        if not role:
            print("Financer role not found!")
        else:
            finance = User(
                first_name="Finance",
                last_name="Manager",
                email="finance@vendorbridge.com",
                password_hash=get_password_hash("finance123"),
                role_id=role.id,
                is_active=True
            )
            db.add(finance)
            db.commit()
            print(f"Created user finance@vendorbridge.com with password 'finance123'")
finally:
    db.close()
