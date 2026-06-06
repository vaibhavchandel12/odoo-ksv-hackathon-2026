import asyncio
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.role import Role
from backend.app.core.security import get_password_hash

def test():
    db = SessionLocal()
    try:
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        admin = db.query(User).filter(User.role_id == admin_role.id).first()
        print("Admin user:", admin.email if admin else "None")
        
        # Create a dummy user
        dummy = db.query(User).filter(User.email == "dummy@example.com").first()
        if not dummy:
            dummy = User(
                first_name="Dummy",
                last_name="User",
                email="dummy@example.com",
                role_id=admin_role.id,
                password_hash=get_password_hash("oldpassword")
            )
            db.add(dummy)
            db.commit()
            db.refresh(dummy)
            print("Created dummy user")
            
        print("Dummy user id:", dummy.id)
    finally:
        db.close()

if __name__ == "__main__":
    test()
