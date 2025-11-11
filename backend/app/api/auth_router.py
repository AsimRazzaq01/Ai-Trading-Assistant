# ============================================================
# 📁 backend/app/api/auth_router.py
# ============================================================

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Header, Cookie
from pydantic import BaseModel, EmailStr, Field, model_validator
from sqlalchemy.orm import Session
from jose import jwt, JWTError, ExpiredSignatureError
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
    """Login with email or username and issue JWT cookie."""
    q = db.query(models.User)
    db_user = None

    if payload.email:
        db_user = q.filter(models.User.email == payload.email).first()
    elif payload.username:
        db_user = q.filter(models.User.username == payload.username).first()

    if not db_user or not verify_password(payload.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email/username or password")

    # ✅ Create JWT token
    token = create_access_token({"sub": str(db_user.id)})

    # =========================================================
    # 🍪 Cookie configuration (env-aware)
    # =========================================================
    is_prod = settings.ENV.lower() == "production"

    cookie_kwargs = {
        "key": settings.COOKIE_NAME,
        "value": token,
        "httponly": True,
        "secure": True if is_prod else False,
        "samesite": "none" if is_prod else "lax",
        "max_age": 60 * 60 * 24,  # 1 day
        "path": "/",
    }

    if is_prod and settings.COOKIE_DOMAIN:
        cookie_kwargs["domain"] = settings.COOKIE_DOMAIN

    response.set_cookie(**cookie_kwargs)

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/logout")
def logout(response: Response):
    """Clear authentication cookie."""
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/",
        domain=settings.COOKIE_DOMAIN or None,
    )
    return {"message": "Logged out"}


@router.get("/me")
def read_me(
        authorization: Optional[str] = Header(None),
        access_token: Optional[str] = Cookie(None),
        db: Session = Depends(get_db),
):
    """Return current user based on Bearer or Cookie JWT."""
    token = None

    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = int(payload.get("sub"))
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {"id": user.id, "email": user.email}



























# from typing import Optional
# from fastapi import APIRouter, Depends, HTTPException, Response, Header
# from pydantic import BaseModel, EmailStr, Field, model_validator
# from sqlalchemy.orm import Session
# from jose import jwt, JWTError
#
# from app.db.database import get_db
# from app.db import models
# from app.core.security import hash_password, create_access_token, verify_password
# from app.core.config import settings
#
# router = APIRouter()
#
# # ============================================================
# # 📦 Schemas
# # ============================================================
#
# class RegisterRequest(BaseModel):
#     email: EmailStr
#     password: str = Field(..., min_length=6)
#
#
# class LoginRequest(BaseModel):
#     email: Optional[EmailStr] = None
#     username: Optional[str] = None
#     password: str = Field(..., min_length=6)
#
#     # ✅ Pydantic v2 validator — replaces old field_validator
#     @model_validator(mode="after")
#     def ensure_identifier(self):
#         if not self.email and not self.username:
#             raise ValueError("Provide either email or username")
#         return self
#
#
# # ============================================================
# # 🧩 Routes
# # ============================================================
#
# @router.post("/register")
# def register(payload: RegisterRequest, db: Session = Depends(get_db)):
#     """Register a new user."""
#     existing = db.query(models.User).filter(models.User.email == payload.email).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="Email already registered")
#
#     new_user = models.User(
#         email=payload.email,
#         hashed_password=hash_password(payload.password),
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#
#     return {"message": "User registered successfully"}
#
#
# #@router.post("/login")
# # def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
# #     """Login with email or username."""
# #     q = db.query(models.User)
# #
# #     if payload.email:
# #         db_user = q.filter(models.User.email == payload.email).first()
# #     else:
# #         db_user = q.filter(models.User.username == payload.username).first()
# #
# #     if not db_user or not verify_password(payload.password, db_user.hashed_password):
# #         raise HTTPException(status_code=400, detail="Invalid email/username or password")
# #
# #     token = create_access_token({"sub": str(db_user.id)})
# #
# #     # ✅ Send HttpOnly cookie for SSR use
# #     response.set_cookie(
# #         key="access_token",
# #         value=token,
# #         httponly=True,
# #         samesite="lax",
# #         max_age=60 * 60 * 24,
# #         path="/",
# #     )
# #
# #     return {"message": "Login successful", "access_token": token, "token_type": "bearer"}
#
#
#
# @router.post("/login")
# def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
#     # ... your user lookup + token creation remains the same ...
#     token = create_access_token({"sub": str(db_user.id)})
#
#     # Cookie flags: Lax for localhost; None+Secure for https (Vercel/Railway or Render)
#     is_prod = settings.ENV.lower() == "production"
#     response.set_cookie(
#         key="access_token",
#         value=token,
#         httponly=True,
#         samesite="none" if is_prod else "lax",
#         secure=True if is_prod else False,
#         max_age=60 * 60 * 24,
#         path="/",
#     )
#
#     return {"message": "Login successful", "access_token": token, "token_type": "bearer"}
#
#
#
# @router.post("/logout")
# def logout(response: Response):
#     """Clear cookie on logout."""
#     response.delete_cookie("access_token", path="/")
#     return {"message": "Logged out"}
#
#
# @router.get("/me")
# def read_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
#     """Get current logged-in user from Bearer token."""
#     if not authorization or not authorization.lower().startswith("bearer "):
#         raise HTTPException(status_code=401, detail="Authentication required")
#
#     token = authorization.split(" ", 1)[1]
#     try:
#         payload = jwt.decode(
#             token,
#             settings.JWT_SECRET_KEY,
#             algorithms=[settings.JWT_ALGORITHM],
#         )
#         user_id = int(payload.get("sub"))
#     except (JWTError, ValueError, TypeError):
#         raise HTTPException(status_code=401, detail="Invalid or expired token")
#
#     user = db.get(models.User, user_id)
#     if not user:
#         raise HTTPException(status_code=401, detail="User not found")
#
#     return {"id": user.id, "email": user.email}

