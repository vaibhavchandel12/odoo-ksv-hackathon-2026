import urllib.request
import json

url = "http://localhost:8000/api/products/"
payload = {
    "name": "chair",
    "image_url": "https://www.google.com/imgres?q=chair&imgurl=https%3A%2F%2Fthetimberguy.com%2Fcdn%2Fshop%2Fproducts%2FSolid-Sheesham-Wood-Chair-45-L-x-45-B-x-89-H-cm-17_71-L-x-17_71-B-x-35-H-inches_1200x.jpg%3Fv%3D1662401281&imgrefurl=https%3A%2F%2Fthetimberguy.com%2Fproducts%2Fsolid-sheesham-wood-chair-45-l-x-45-b-x-89-h-cm-17-71-l-x-17-71-b-x-35-h-inches%3Fsrsltid%3DAfmBOooWtVzd9NKuodAfN72YIr64QRkH3yV5PCQgrTtKyqMhFmAKitaP&docid=JkQ2WgSWCoUfDM&tbnid=qGGffqEbI9y02M&vet=12ahUKEwjz5MyJh_KUAxUUzDgGHU8JGWQQnPAOegQIFRAB..i&w=832&h=832&hcb=2&ved=2ahUKEwjz5MyJh_KUAxUUzDgGHU8JGWQQnPAOegQIFRAB",
    "cost": 12,
    "on_hand_qty": 1,
    "category_id": None
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Response: {response.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
