import requests
from backend.app.core.security import create_access_token
from backend.app.core.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.role import Role

db = SessionLocal()
admin = db.query(User).join(Role).filter(Role.name == "Admin").first()
dummy = db.query(User).filter(User.email == "dummy@example.com").first()

token = create_access_token(admin.id)

print("Sending PATCH request...")
res = requests.patch(
    f"http://127.0.0.1:8000/api/users/{dummy.id}",
    json={"password": "newpassword123", "role_id": str(dummy.role_id), "is_active": True},
    headers={"Authorization": f"Bearer {token}"}
)
print("Status:", res.status_code)
print("Response:", res.text)
