from fastapi.testclient import TestClient
from app.main import app, get_current_user

client = TestClient(app)

def test_analyze_route():
    response = client.post("/analyze", json={
        "combined_productivity": "Productivity = 22.17",
        "single_productivity": {
            "Direct Labor Hours / Total Units Produced": "33.33",
            "Electricity Consumption / Total Units Produced": "66.23"
        },
        "inputs": {
            "Direct Labor Hours": 150,
            "Electricity Consumption": 75.5
        },
        "outputs": {
            "Total Units Produced": 5000
        },
        "targeted_productivity": "25.0",
        "standard_productivity": "20.0"
    })

    print("Status code:", response.status_code)
    print("Response body:", response.json())

from app.database import SessionLocal
from app.models import Tenant, User

db = SessionLocal()

# Create tenant
tenant = Tenant(name="Test Tenant")
db.add(tenant)
db.commit()
db.refresh(tenant)

# Create user
user = User(
    name="Test User",
    email="test@example.com",
    password_hash="fakehash",
    tenant_id=tenant.id
)
db.add(user)
db.commit()
db.refresh(user)

db.close()

from fastapi.testclient import TestClient
from app.main import app
from app.models import User
from app.database import SessionLocal

client = TestClient(app)

# Override current_user
def override_get_current_user():
    db = SessionLocal()
    user = db.query(User).filter(User.email=="test@example.com").first()
    db.close()
    return user

app.dependency_overrides[get_current_user] = override_get_current_user

