import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.sql import text

# Force backend directories to be in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Load environment variables from backend/.env explicitly
env_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "backend", ".env")
if os.path.exists(env_path):
    print(f"Loading env parameters from: {env_path}")
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                parts = line.split("=", 1)
                os.environ[parts[0].strip()] = parts[1].strip()
else:
    print(f"WARNING: env file not found at {env_path}")

print("=== VendorBridge Supabase Table Initializer ===")

try:
    from backend.app.core.config import settings
    from backend.app.core.database import engine, SessionLocal
    from backend.app.models.base import Base
    from backend.app.models.role import Role
    from backend.app.models.user import User
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

print(f"Connecting to database: {settings.DATABASE_URL}...")
try:
    # Test connection and fetch a result
    with engine.connect() as conn:
        if settings.DATABASE_URL.startswith("sqlite"):
            res = conn.execute(text("SELECT sqlite_version()"))
        else:
            res = conn.execute(text("SELECT version()"))
        print(f"Connection Successful! Database Version: {res.fetchone()[0]}")
except Exception as e:
    print(f"Error: Could not connect to database. details: {e}")
    sys.exit(1)

print("\nCreating all tables (roles, users, etc.)...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    print(f"Error creating tables: {e}")
    sys.exit(1)

print("\nSeeding preloaded roles...")
db = SessionLocal()
try:
    existing_count = db.query(Role).count()
    if existing_count == 0:
        default_roles = [
            Role(name="Admin", description="Administrator with full system control and access to all settings, configurations, and user management."),
            Role(name="Procurement Officer", description="Procurement staff member responsible for creating and managing RFQs, purchase orders, quotations, and invoices."),
            Role(name="Manager", description="Management persona responsible for reviewing and approving procurements, RFQs, purchase orders, and viewing dashboard reports."),
            Role(name="Vendor", description="Vendor representative with access to the Vendor Portal to view RFQs and submit quotations.")
        ]
        db.add_all(default_roles)
        db.commit()
        print(f"Seeded {len(default_roles)} default roles successfully!")
    else:
        print(f"Roles already exist ({existing_count} found). Skipping seeding.")
finally:
    db.close()

print("\n=== Database initialization completed successfully! ===")
