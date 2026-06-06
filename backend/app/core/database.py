import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

logger = logging.getLogger("vendorbridge.database")

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

db_url = settings.DATABASE_URL
engine = None

# Verify connection to primary PostgreSQL database with a short timeout to prevent server hanging
if settings.DATABASE_URL.startswith("postgresql"):
    try:
        # Create a temporary engine to test connection
        test_engine = create_engine(settings.DATABASE_URL, connect_args={"connect_timeout": 3})
        with test_engine.connect() as conn:
            # Connection succeeded
            pass
        engine = test_engine
        print("Successfully connected to primary Supabase PostgreSQL database.")
    except Exception as e:
        print(f"WARNING: Database connection failed. Falling back to SQLite. Error: {e}")
        logger.warning(f"Primary database connection failed. Falling back to local SQLite. Error: {e}")
        db_url = "sqlite:///./vendorbridge.db"
        connect_args = {"check_same_thread": False}

if engine is None:
    engine = create_engine(db_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
