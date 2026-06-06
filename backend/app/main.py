from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import engine, SessionLocal
from backend.app.models.base import Base
from backend.app.models.role import Role
from backend.app.api.endpoints import auth, users, roles

# Auto-create tables (useful for local SQLite fallback and initializing postgres)
Base.metadata.create_all(bind=engine)

# Seed default roles if they do not exist
db = SessionLocal()
try:
    if db.query(Role).count() == 0:
        default_roles = [
            Role(name="Admin", description="Administrator with full system control and access to all settings, configurations, and user management."),
            Role(name="Procurement Officer", description="Procurement staff member responsible for creating and managing RFQs, purchase orders, quotations, and invoices."),
            Role(name="Manager", description="Management persona responsible for reviewing and approving procurements, RFQs, purchase orders, and viewing dashboard reports."),
            Role(name="Vendor", description="Vendor representative with access to the Vendor Portal to view RFQs and submit quotations.")
        ]
        db.add_all(default_roles)
        db.commit()
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS to allow communication from any port (specifically React's localhost:5173 / localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to specific origins in a strict production env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include endpoint routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(roles.router, prefix=f"{settings.API_V1_STR}/roles", tags=["roles"])

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs_url": "/docs"
    }
