import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

env_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "backend", ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                parts = line.split("=", 1)
                os.environ[parts[0].strip()] = parts[1].strip()

from backend.app.core.database import engine

def alter_table():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;"))
            print("Successfully changed image_url type to TEXT.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    alter_table()
