import random
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

env_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                parts = line.split("=", 1)
                os.environ[parts[0].strip()] = parts[1].strip()

from backend.app.core.database import SessionLocal
from backend.app.models.category import Category
from backend.app.models.product import Product

catalog = {
    "Laptops & Computers": {
        "keywords": "laptop,computer",
        "products": [
            ("MacBook Pro 16", 2499.99),
            ("Dell XPS 13", 1399.99),
            ("ThinkPad X1 Carbon", 1599.99),
            ("Razer Blade 15", 2299.99),
            ("Asus ROG Zephyrus", 1899.99),
            ("HP Spectre x360", 1499.99),
            ("Acer Swift 3", 899.99),
            ("Lenovo Legion 5", 1199.99),
            ("Apple iMac 24", 1299.99),
            ("Surface Pro 9", 1099.99),
        ]
    },
    "Smartphones": {
        "keywords": "smartphone,phone",
        "products": [
            ("iPhone 15 Pro", 999.99),
            ("Samsung Galaxy S24", 899.99),
            ("Google Pixel 8", 699.99),
            ("OnePlus 12", 799.99),
            ("Motorola Edge+", 699.99),
            ("Sony Xperia 1 V", 1199.99),
            ("Asus Zenfone 10", 699.99),
            ("Nothing Phone 2", 599.99),
            ("Xiaomi 14", 899.99),
            ("Oppo Find X6", 999.99),
        ]
    },
    "Audio & Headphones": {
        "keywords": "headphones,audio",
        "products": [
            ("Sony WH-1000XM5", 399.99),
            ("Bose QuietComfort 45", 329.99),
            ("Apple AirPods Pro 2", 249.99),
            ("Sennheiser Momentum 4", 349.99),
            ("Jabra Elite 85t", 199.99),
            ("Shure AONIC 50", 299.99),
            ("Audio-Technica ATH-M50x", 149.99),
            ("Bowers & Wilkins Px7", 399.99),
            ("Beats Studio Pro", 349.99),
            ("Marshall Monitor II", 319.99),
        ]
    },
    "Cameras & Photography": {
        "keywords": "camera,photography",
        "products": [
            ("Sony Alpha a7 IV", 2499.99),
            ("Canon EOS R6", 2499.99),
            ("Nikon Z6 II", 1999.99),
            ("Fujifilm X-T5", 1699.99),
            ("Panasonic Lumix GH6", 2199.99),
            ("Leica Q2", 5795.00),
            ("Olympus OM-D E-M1", 1799.99),
            ("GoPro HERO12 Black", 399.99),
            ("DJI Mini 4 Pro", 759.99),
            ("Insta360 X3", 449.99),
        ]
    },
    "Wearable Technology": {
        "keywords": "smartwatch,wearable",
        "products": [
            ("Apple Watch Series 9", 399.99),
            ("Samsung Galaxy Watch 6", 299.99),
            ("Garmin Fenix 7", 699.99),
            ("Fitbit Charge 6", 159.99),
            ("Google Pixel Watch 2", 349.99),
            ("Amazfit GTR 4", 199.99),
            ("Suunto 9 Baro", 499.99),
            ("Withings ScanWatch", 299.99),
            ("Polar Vantage V2", 499.99),
            ("Oura Ring Gen3", 299.99),
        ]
    },
    "Office Furniture": {
        "keywords": "desk,office chair",
        "products": [
            ("Herman Miller Aeron", 1295.00),
            ("Steelcase Gesture", 1199.00),
            ("Autonomous SmartDesk 2", 499.00),
            ("Uplift V2 Standing Desk", 599.00),
            ("Secretlab Titan Evo", 549.00),
            ("IKEA Markus Chair", 249.00),
            ("Branch Ergonomic Chair", 329.00),
            ("Vari Electric Standing Desk", 695.00),
            ("Humanscale Freedom", 1099.00),
            ("Fully Jarvis Desk", 549.00),
        ]
    },
    "Network & Storage": {
        "keywords": "router,harddrive",
        "products": [
            ("Netgear Nighthawk AX12", 399.99),
            ("Asus ROG Rapture GT-AX11000", 449.99),
            ("TP-Link Deco X90", 449.99),
            ("Eero Pro 6E", 399.99),
            ("Google Nest Wifi Pro", 299.99),
            ("Samsung 990 Pro 2TB SSD", 199.99),
            ("WD Black SN850X 2TB", 189.99),
            ("Seagate IronWolf 8TB NAS", 199.99),
            ("Synology DiskStation DS923+", 599.99),
            ("SanDisk Extreme Portable 2TB", 169.99),
        ]
    },
    "Monitors & Displays": {
        "keywords": "monitor,display",
        "products": [
            ("LG UltraGear 27GN950", 799.99),
            ("Dell UltraSharp U2723QE", 699.99),
            ("Samsung Odyssey G9", 1499.99),
            ("Asus ProArt PA329CV", 799.99),
            ("Alienware AW3423DW OLED", 1099.99),
            ("BenQ PD3220U", 1099.99),
            ("Acer Predator X38", 1699.99),
            ("Gigabyte M32U", 699.99),
            ("MSI Optix MAG274QRF-QD", 399.99),
            ("Apple Studio Display", 1599.99),
        ]
    },
    "Gaming Consoles & Accessories": {
        "keywords": "gaming,controller",
        "products": [
            ("PlayStation 5", 499.99),
            ("Xbox Series X", 499.99),
            ("Nintendo Switch OLED", 349.99),
            ("Steam Deck OLED", 549.99),
            ("Meta Quest 3", 499.99),
            ("Xbox Elite Controller Series 2", 179.99),
            ("DualSense Edge Controller", 199.99),
            ("Logitech G Pro X Superlight", 149.99),
            ("Razer Huntsman V2", 199.99),
            ("Corsair K100 RGB", 229.99),
        ]
    },
    "PC Components": {
        "keywords": "cpu,gpu,motherboard",
        "products": [
            ("Nvidia GeForce RTX 4090", 1599.99),
            ("AMD Radeon RX 7900 XTX", 999.99),
            ("Intel Core i9-14900K", 589.99),
            ("AMD Ryzen 9 7950X3D", 699.99),
            ("ASUS ROG Crosshair X670E", 699.99),
            ("MSI MEG Z790 Godlike", 1199.99),
            ("Corsair Dominator Platinum 64GB", 299.99),
            ("G.Skill Trident Z5 RGB 32GB", 149.99),
            ("Noctua NH-D15 Cooler", 119.99),
            ("Corsair RM1000x Power Supply", 189.99),
        ]
    }
}

def seed_data():
    db = SessionLocal()
    try:
        # Clear existing data
        db.query(Product).delete()
        db.query(Category).delete()
        db.commit()
        print("Cleared old products and categories.")

        # Create Categories and Products
        categories_added = 0
        products_added = 0

        for cat_name, cat_data in catalog.items():
            category = Category(id=str(uuid.uuid4()), name=cat_name)
            db.add(category)
            categories_added += 1

            for index, (prod_name, prod_price) in enumerate(cat_data["products"]):
                qty = random.randint(10, 200)
                
                # Using an image generation service that supports keywords
                # To prevent browser caching identical URLs, add a random query param
                cache_buster = random.randint(1, 10000)
                image_url = f"https://loremflickr.com/400/400/{cat_data['keywords']}?lock={cache_buster}"

                product = Product(
                    id=str(uuid.uuid4()),
                    name=prod_name,
                    category_id=category.id,
                    cost=prod_price,
                    on_hand_qty=qty,
                    image_url=image_url
                )
                db.add(product)
                products_added += 1

        db.commit()
        print(f"Successfully added {categories_added} categories and {products_added} products.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
