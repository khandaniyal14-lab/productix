from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from .database import get_db
from .models import User
from .auth import SECRET_KEY, ALGORITHM

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.split(" ")[1]  # Bearer <token>
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        tenant_id = payload.get("tenant_id")
        user = db.query(User).filter(User.id == user_id, User.tenant_id == tenant_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
