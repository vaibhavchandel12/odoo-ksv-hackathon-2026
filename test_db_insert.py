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
from backend.app.models.product import Product

def test_insert():
    db = SessionLocal()
    try:
        url = "https://www.google.com/imgres?q=chair&imgurl=https%3A%2F%2Fthetimberguy.com%2Fcdn%2Fshop%2Fproducts%2FSolid-Sheesham-Wood-Chair-45-L-x-45-B-x-89-H-cm-17_71-L-x-17_71-B-x-35-H-inches_1200x.jpg%3Fv%3D1662401281&imgrefurl=https%3A%2F%2Fthetimberguy.com%2Fproducts%2Fsolid-sheesham-wood-chair-45-l-x-45-b-x-89-h-cm-17-71-l-x-17-71-b-x-35-h-inches%3Fsrsltid%3DAfmBOooWtVzd9NKuodAfN72YIr64QRkH3yV5PCQgrTtKyqMhFmAKitaP&docid=JkQ2WgSWCoUfDM&tbnid=qGGffqEbI9y02M&vet=12ahUKEwjz5MyJh_KUAxUUzDgGHU8JGWQQnPAOegQIFRAB..i&w=832&h=832&hcb=2&ved=2ahUKEwjz5MyJh_KUAxUUzDgGHU8JGWQQnPAOegQIFRAB"
        print(f"URL length: {len(url)}")
        db_product = Product(name="chair", image_url=url, category_id=None, cost=12.0, on_hand_qty=1)
        db.add(db_product)
        db.commit()
        print("Success!")
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_insert()
