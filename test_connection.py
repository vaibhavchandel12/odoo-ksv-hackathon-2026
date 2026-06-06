import sys
from sqlalchemy import create_engine
from sqlalchemy.sql import text

# Try port 6543 (transaction pooler)
db_url = "postgresql://postgres:%5Bom10000%40odoo%5D@db.zvdwxfyhybabvluryvyz.supabase.co:6543/postgres"

print("Connecting to:", db_url)
try:
    engine = create_engine(db_url, connect_args={"connect_timeout": 5})
    with engine.connect() as conn:
        res = conn.execute(text("SELECT 1"))
        print("Success! Query result:", res.fetchone())
except Exception as e:
    print("Error connecting to database:", e)
    sys.exit(1)

