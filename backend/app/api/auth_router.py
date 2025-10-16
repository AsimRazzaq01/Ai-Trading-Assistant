# backend/app/api/auth_router.py

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Header
from pydantic import BaseModel, EmailStr, Field, model_validator
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.db.database import get_db
from app.db import models
from app.core.security import hash_password, create_access_token, verify_password
from app.core.config import settings

router = APIRouter()

# ============================================================
# 📦 Schemas
# ============================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str = Field(..., min_length=6)

    # ✅ Pydantic v2 validator — replaces old field_validator
    @model_validator(mode="after")
    def ensure_identifier(self):
        if not self.email and not self.username:
            raise ValueError("Provide either email or username")
        return self


# ============================================================
# 🧩 Routes
# ============================================================

@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Login with email or username."""
    q = db.query(models.User)

    if payload.email:
        db_user = q.filter(models.User.email == payload.email).first()
    else:
        db_user = q.filter(models.User.username == payload.username).first()

    if not db_user or not verify_password(payload.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email/username or password")

    token = create_access_token({"sub": str(db_user.id)})

    # ✅ Send HttpOnly cookie for SSR use
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24,
        path="/",
    )

    return {"message": "Login successful", "access_token": token, "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response):
    """Clear cookie on logout."""
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}



