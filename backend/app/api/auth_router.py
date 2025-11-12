# ============================================================
# 📁 backend/app/api/auth_router.py
# ============================================================

from typing import Optional, Literal, cast
from fastapi import APIRouter, Depends, HTTPException, Response, Header, Cookie
from pydantic import BaseModel, EmailStr, Field, model_validator
from sqlalchemy.orm import Session
from jose import jwt, JWTError, ExpiredSignatureError  # type: ignore
from app.db.database import get_db
from app.db import models
from app.core.security import hash_password, create_access_token, verify_password
from app.core.config import settings

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str = Field(..., min_length=6)

    @model_validator(mode="after")
    def ensure_identifier(self):
        if not self.email and not self.username:
            raise ValueError("Provide either email or username")
        return self


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}


@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    q = db.query(models.User)
    db_user = q.filter(models.User.email == payload.email).first() if payload.email else q.filter(models.User.username == payload.username).first()

    if not db_user or not verify_password(payload.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": str(db_user.id)})

    # ✅ Determine if we're in production (cross-origin setup)
    is_production = settings.ENV.lower() == "production"
    
    # ✅ Cookie settings for cross-origin (Vercel frontend → Railway backend)
    if is_production:
        # For cross-origin cookies, we need SameSite=None and Secure=True
        # DO NOT set domain for cross-origin cookies (browser handles it)
        response.set_cookie(
            key=settings.COOKIE_NAME,
            value=token,
            httponly=True,
            samesite="none",
            secure=True,
            max_age=60 * 60 * 24,
            path="/",
            domain=settings.COOKIE_DOMAIN if settings.COOKIE_DOMAIN else None,
        )
    else:
        # Local development: SameSite=Lax, Secure=False, no domain
        samesite_value = cast(
            Literal["lax", "strict", "none"],
            (settings.COOKIE_SAMESITE or "lax").lower()
        )
        response.set_cookie(
            key=settings.COOKIE_NAME,
            value=token,
            httponly=True,
            samesite=samesite_value,
            secure=bool(settings.COOKIE_SECURE),
            max_age=60 * 60 * 24,
            path="/",
        )
    return {"message": "Login successful", "access_token": token, "token_type": "bearer"}


@router.get("/me")
def read_me(
        authorization: Optional[str] = Header(None),
        access_token: Optional[str] = Cookie(None),
        db: Session = Depends(get_db)
):
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {"id": user.id, "email": user.email}




