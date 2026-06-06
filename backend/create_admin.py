import os
import sys
import uuid

# Add the parent directory to the path so we can import from backend
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

env_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), ".env")
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
        # Find the Admin role
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        if not admin_role:
            print("Error: Admin role not found in the database. Please run initialize_database.py first.")
            return

        # Check if admin already exists
        admin_email = "admin@vendorbridge.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if existing_admin:
            print(f"Admin account already exists with email: {admin_email}")
            return

        # Create the admin user
        admin_user = User(
            id=uuid.uuid4(),
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            first_name="System",
            last_name="Administrator",
            role_id=admin_role.id,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print(f"Successfully created admin account!\nEmail: {admin_email}\nPassword: admin123")

    except Exception as e:
        db.rollback()
        print(f"Error creating admin account: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
