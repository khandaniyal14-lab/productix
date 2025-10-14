from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth, deps
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])
"""
# ------------------------
# REGISTER ORG + ADMIN
# ------------------------
@router.post("/register", response_model=schemas.UserResponse)
def register_org(user_in: schemas.UserCreate, org_in: schemas.OrganizationCreate, db: Session = Depends(get_db)):
    # create org
    org = models.Organization(name=org_in.name, subscription_plan=org_in.subscription_plan)
    db.add(org)
    db.commit()
    db.refresh(org)

    # create admin user
    hashed = auth.hash_password(user_in.password)
    user = models.User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed,
        role=models.UserRole.org_admin,
        organization_id=org.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ------------------------
# LOGIN
# ------------------------
@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not auth.verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_access_token({
        "id": user.id,
        "role": user.role.value,
        "organization_id": user.organization_id
    })
    return {"access_token": token, "token_type": "bearer"}
"""