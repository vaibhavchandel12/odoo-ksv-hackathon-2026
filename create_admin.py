import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

env_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "backend", ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                parts = line.split("=", 1)
                os.environ[parts[0].strip()] = parts[1].strip()

from backend.app.core.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.role import Role
from backend.app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        if not admin_role:
            print("Admin role not found. Please run initialize_database.py first.")
            return

        admin_email = "admin@vendorbridge.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"Admin user already exists with email: {admin_email}")
            return
            
        new_admin = User(
            first_name="Super",
            last_name="Admin",
            email=admin_email,
            phone="1234567890",
            password_hash=get_password_hash("admin123"),
            role_id=admin_role.id,
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print(f"Admin user created successfully! Email: {admin_email}, Password: admin123")
    except Exception as e:
        db.rollback()
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
