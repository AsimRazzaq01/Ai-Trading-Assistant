# backend/app/api/deps.py
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.core.config import settings
from app.db.database import get_db
from app.db import models

COOKIE_NAME = "access_token"


def get_current_user_from_cookie(
        request: Request,
        db: Session = Depends(get_db),
) -> models.User:
    """
    Extracts and validates JWT token from HttpOnly cookie,
    decodes it to get the user ID, and returns the current user.
    """
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError("Missing subject claim")
        user_id = int(user_id)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
