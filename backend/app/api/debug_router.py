# ============================================================
# 📁 backend/app/api/debug_router.py
# ============================================================

from fastapi import APIRouter, Request, Cookie, Header, Response, Depends
from app.core.config import settings
from jose import jwt, JWTError, ExpiredSignatureError

router = APIRouter(prefix="/debug", tags=["Debug"])


@router.get("/echo")
def echo_headers(
        request: Request,
        access_token: str | None = Cookie(default=None),
        authorization: str | None = Header(default=None),
):
    """Echo headers and cookie presence."""
    return {
        "url": str(request.url),
        "origin_header": request.headers.get("origin"),
        "cookie_header": request.headers.get("cookie"),
        "access_token_cookie_present": bool(access_token),
        "authorization_header_present": bool(authorization),
        "samesite_env": settings.COOKIE_SAMESITE,
        "secure_env": settings.COOKIE_SECURE,
    }


@router.get("/decode")
def decode_cookie(access_token: str | None = Cookie(default=None)):
    """Try to decode the cookie directly and report details."""
    if not access_token:
        return {"cookie_present": False, "decoded": None, "error": "No cookie received"}
    try:
        payload = jwt.decode(
            access_token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return {"cookie_present": True, "decoded": payload}
    except ExpiredSignatureError:
        return {"cookie_present": True, "error": "Token expired"}
    except JWTError as e:
        return {"cookie_present": True, "error": f"JWTError: {e}"}


@router.get("/set-test-cookie")
def set_test_cookie(response: Response):
    """Force-set a test cookie so we can check SameSite and Secure flags."""
    response.set_cookie(
        key="debug_cookie",
        value="test123",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )
    return {"message": "Test cookie set"}
