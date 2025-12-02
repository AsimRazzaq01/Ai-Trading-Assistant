# ============================================================
# 📁 backend/app/api/auth_router.py
# ============================================================

from typing import Optional, Literal, cast
from fastapi import APIRouter, Depends, HTTPException, Response, Header, Cookie, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, Field, model_validator
from sqlalchemy.orm import Session
from jose import jwt, JWTError, ExpiredSignatureError  # type: ignore
from authlib.integrations.starlette_client import OAuth, OAuthError  # type: ignore
import httpx  # type: ignore
from app.db.database import get_db
from app.db import models
from app.core.security import hash_password, create_access_token, verify_password
from app.core.config import settings

router = APIRouter()

# Initialize OAuth (lazy initialization to avoid import errors)
oauth = None

def get_oauth():
    """Get or create OAuth instance."""
    global oauth
    if oauth is None:
        try:
            oauth = OAuth()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OAuth initialization failed: {str(e)}")
    return oauth


class RegisterRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    name: Optional[str] = None
    password: str = Field(..., min_length=6)

    @model_validator(mode="after")
    def ensure_identifier(self):
        if not self.email and not self.username:
            raise ValueError("Provide either email or username")
        return self


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
    try:
        # Check for duplicate email if email is provided
        if payload.email:
            existing_email = db.query(models.User).filter(models.User.email == payload.email).first()
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check for duplicate username if username is provided
        if payload.username:
            existing_username = db.query(models.User).filter(models.User.username == payload.username).first()
            if existing_username:
                raise HTTPException(status_code=400, detail="Username already taken")

        new_user = models.User(
            email=payload.email,
            username=payload.username,
            name=payload.name,
            hashed_password=hash_password(payload.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User registered successfully"}
    except Exception as e:
        db.rollback()
        # Log the actual error for debugging
        error_msg = str(e)
        print(f"❌ Registration error: {error_msg}")
        
        # Check if it's a database constraint error (email NOT NULL)
        if "not null" in error_msg.lower() or "null value" in error_msg.lower():
            raise HTTPException(
                status_code=500,
                detail="Database schema needs to be updated. Please run: ALTER TABLE users ALTER COLUMN email DROP NOT NULL;"
            )
        
        # Re-raise HTTPExceptions as-is
        if isinstance(e, HTTPException):
            raise e
        
        # Generic error
        raise HTTPException(status_code=500, detail=f"Registration failed: {error_msg}")


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

    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "name": user.name
    }


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    """Change user password. Requires old password verification."""
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload_jwt = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload_jwt.get("sub"))
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Verify old password
    if not verify_password(payload.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Update password
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    db.refresh(user)

    return {"message": "Password changed successfully"}


# ============================================================
# 🔐 OAuth Helper Functions
# ============================================================

def set_auth_cookie(response: Response, token: str):
    """Helper function to set authentication cookie with proper settings."""
    is_production = settings.ENV.lower() == "production"
    
    if is_production:
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


def get_or_create_oauth_user(
    db: Session,
    email: str,
    provider: str,
    provider_id: str,
    name: Optional[str] = None,
    username: Optional[str] = None
) -> models.User:
    """Get existing OAuth user or create a new one."""
    # First, try to find by provider_id
    user = db.query(models.User).filter(
        models.User.provider == provider,
        models.User.provider_id == provider_id
    ).first()
    
    if user:
        # Update email/name if changed
        if email and user.email != email:
            user.email = email
        if name and user.name != name:
            user.name = name
        db.commit()
        db.refresh(user)
        return user
    
    # If not found by provider_id, check by email
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if user:
        # Link OAuth to existing account
        user.provider = provider
        user.provider_id = provider_id
        if name:
            user.name = name
        db.commit()
        db.refresh(user)
        return user
    
    # Create new user
    # OAuth users don't need a password, but we'll set a random one for safety
    # (they'll never use it since they login via OAuth)
    random_password = hash_password(f"oauth_{provider}_{provider_id}_no_password")
    
    new_user = models.User(
        email=email,
        name=name,
        username=username,
        hashed_password=random_password,
        provider=provider,
        provider_id=provider_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ============================================================
# 🔵 Google OAuth
# ============================================================

# Register Google OAuth
# Note: We'll register it dynamically in the route to handle missing config gracefully


@router.get("/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth login."""
    try:
        oauth_instance = get_oauth()
        
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise HTTPException(
                status_code=500, 
                detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
            )
        
        # ✅ CRITICAL: In production, GOOGLE_REDIRECT_URI MUST be explicitly set
        # and MUST exactly match what's registered in Google Cloud Console
        if settings.ENV.lower() == "production":
            if not settings.GOOGLE_REDIRECT_URI:
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "GOOGLE_REDIRECT_URI must be explicitly set in production. "
                        "Set it to your exact Railway backend URL: https://your-backend.up.railway.app/auth/google/callback"
                    )
                )
            redirect_uri = settings.GOOGLE_REDIRECT_URI.rstrip('/')
        else:
            # Local development: construct from request or use explicit setting
            if settings.GOOGLE_REDIRECT_URI:
                redirect_uri = settings.GOOGLE_REDIRECT_URI.rstrip('/')
            else:
                backend_url_str = str(request.base_url).rstrip('/')
                redirect_uri = f"{backend_url_str}/auth/google/callback"
        
        # Log the redirect URI being used (for debugging)
        print(f"🔐 Google OAuth redirect URI: {redirect_uri}")
        print(f"🔐 Environment: {settings.ENV}")
        print(f"🔐 GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID[:20]}...")
        
        # ✅ Ensure session is initialized (SessionMiddleware should handle this, but we'll verify)
        # The session is used by Authlib to store the OAuth state for CSRF protection
        session = request.session
        print(f"🔐 Session ID before OAuth: {session.get('_id', 'not set')}")
        print(f"🔐 Session keys before redirect: {list(session.keys())}")
        
        # Register Google OAuth if not already registered
        try:
            _ = oauth_instance.google
        except (AttributeError, KeyError):
            oauth_instance.register(
                name="google",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
                server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
                client_kwargs={
                    "scope": "openid email profile"
                }
            )
        
        # ✅ Use authorize_redirect which will set the state in the session
        # Create a response object to ensure session is saved
        response = await oauth_instance.google.authorize_redirect(request, redirect_uri)
        
        # ✅ Explicitly ensure session is saved before redirect
        # The session middleware should handle this, but we'll verify it's in the response
        print(f"🔐 Session keys after authorize_redirect: {list(request.session.keys())}")
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"OAuth error: {str(e)}\n{traceback.format_exc()}"
        print(f"❌ Google OAuth login error: {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth callback."""
    oauth_instance = get_oauth()
    
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500, 
            detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
        )
    
    # ✅ Ensure redirect URI matches what was used in /google/login
    if settings.ENV.lower() == "production":
        if not settings.GOOGLE_REDIRECT_URI:
            raise HTTPException(
                status_code=500,
                detail=(
                    "GOOGLE_REDIRECT_URI must be explicitly set in production. "
                    "Set it to your exact Railway backend URL: https://your-backend.up.railway.app/auth/google/callback"
                )
            )
        redirect_uri = settings.GOOGLE_REDIRECT_URI.rstrip('/')
    else:
        if settings.GOOGLE_REDIRECT_URI:
            redirect_uri = settings.GOOGLE_REDIRECT_URI.rstrip('/')
        else:
            backend_url_str = str(request.base_url).rstrip('/')
            redirect_uri = f"{backend_url_str}/auth/google/callback"
    
    print(f"🔐 Google OAuth callback - redirect URI: {redirect_uri}")
    
    # ✅ Debug session state
    session = request.session
    print(f"🔐 Session ID in callback: {session.get('_id', 'not set')}")
    print(f"🔐 Session keys in callback: {list(session.keys())}")
    print(f"🔐 All cookies received: {list(request.cookies.keys())}")
    
    # Ensure Google OAuth is registered
    try:
        _ = oauth_instance.google
    except (AttributeError, KeyError):
        oauth_instance.register(
            name="google",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={
                "scope": "openid email profile"
            }
        )
    
    try:
        # ✅ authorize_access_token will verify the state from the session
        token = await oauth_instance.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        
        if not user_info:
            # Fetch user info if not in token
            access_token = token.get("access_token")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                user_info = resp.json()
        
        email = user_info.get("email")
        provider_id = user_info.get("sub") or str(user_info.get("id", ""))
        name = user_info.get("name")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        # Get or create user
        user = get_or_create_oauth_user(
            db=db,
            email=email,
            provider="google",
            provider_id=provider_id,
            name=name
        )
        
        # Create JWT token
        token = create_access_token({"sub": str(user.id)})
        
        # Create redirect response
        redirect_url = f"{settings.FRONTEND_URL}/dashboard"
        response = RedirectResponse(url=redirect_url, status_code=302)
        
        # Set cookie
        set_auth_cookie(response, token)
        
        return response
        
    except OAuthError as e:
        raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


# ============================================================
# 🐙 GitHub OAuth
# ============================================================

# Register GitHub OAuth dynamically in routes


@router.get("/github/login")
async def github_login(request: Request):
    """Initiate GitHub OAuth login."""
    try:
        oauth_instance = get_oauth()
        
        if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
            raise HTTPException(
                status_code=500, 
                detail="GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables."
            )
        
        # ✅ CRITICAL: In production, GITHUB_REDIRECT_URI MUST be explicitly set
        # and MUST exactly match what's registered in GitHub OAuth App settings
        if settings.ENV.lower() == "production":
            if not settings.GITHUB_REDIRECT_URI:
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "GITHUB_REDIRECT_URI must be explicitly set in production. "
                        "Set it to your exact Railway backend URL: https://your-backend.up.railway.app/auth/github/callback"
                    )
                )
            redirect_uri = settings.GITHUB_REDIRECT_URI.rstrip('/')
        else:
            # Local development: construct from request or use explicit setting
            if settings.GITHUB_REDIRECT_URI:
                redirect_uri = settings.GITHUB_REDIRECT_URI.rstrip('/')
            else:
                backend_url_str = str(request.base_url).rstrip('/')
                redirect_uri = f"{backend_url_str}/auth/github/callback"
        
        # Log the redirect URI being used (for debugging)
        print(f"🔐 GitHub OAuth redirect URI: {redirect_uri}")
        print(f"🔐 Environment: {settings.ENV}")
        
        # Register GitHub OAuth if not already registered
        try:
            _ = oauth_instance.github
        except (AttributeError, KeyError):
            oauth_instance.register(
                name="github",
                client_id=settings.GITHUB_CLIENT_ID,
                client_secret=settings.GITHUB_CLIENT_SECRET,
                access_token_url="https://github.com/login/oauth/access_token",
                authorize_url="https://github.com/login/oauth/authorize",
                api_base_url="https://api.github.com/",
                client_kwargs={
                    "scope": "user:email"
                }
            )
        
        return await oauth_instance.github.authorize_redirect(request, redirect_uri)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"OAuth error: {str(e)}\n{traceback.format_exc()}"
        print(f"❌ GitHub OAuth login error: {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)


@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback."""
    oauth_instance = get_oauth()
    
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=500, 
            detail="GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables."
        )
    
    # ✅ Ensure redirect URI matches what was used in /github/login
    if settings.ENV.lower() == "production":
        if not settings.GITHUB_REDIRECT_URI:
            raise HTTPException(
                status_code=500,
                detail=(
                    "GITHUB_REDIRECT_URI must be explicitly set in production. "
                    "Set it to your exact Railway backend URL: https://your-backend.up.railway.app/auth/github/callback"
                )
            )
        redirect_uri = settings.GITHUB_REDIRECT_URI.rstrip('/')
    else:
        if settings.GITHUB_REDIRECT_URI:
            redirect_uri = settings.GITHUB_REDIRECT_URI.rstrip('/')
        else:
            backend_url_str = str(request.base_url).rstrip('/')
            redirect_uri = f"{backend_url_str}/auth/github/callback"
    
    print(f"🔐 GitHub OAuth callback - redirect URI: {redirect_uri}")
    
    # Ensure GitHub OAuth is registered
    try:
        _ = oauth_instance.github
    except (AttributeError, KeyError):
        oauth_instance.register(
            name="github",
            client_id=settings.GITHUB_CLIENT_ID,
            client_secret=settings.GITHUB_CLIENT_SECRET,
            access_token_url="https://github.com/login/oauth/access_token",
            authorize_url="https://github.com/login/oauth/authorize",
            api_base_url="https://api.github.com/",
            client_kwargs={
                "scope": "user:email"
            }
        )
    
    try:
        token = await oauth_instance.github.authorize_access_token(request)
        access_token = token.get("access_token")
        
        # Fetch user info from GitHub API
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            user_info = resp.json()
            
            # Get email (may need to fetch from emails endpoint)
            email = user_info.get("email")
            if not email:
                # Try to get primary email from emails endpoint
                emails_resp = await client.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                emails = emails_resp.json()
                primary_email = next((e.get("email") for e in emails if e.get("primary")), None)
                email = primary_email or (emails[0].get("email") if emails else None)
        
        provider_id = str(user_info.get("id", ""))
        name = user_info.get("name") or user_info.get("login")
        username = user_info.get("login")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by GitHub")
        
        # Get or create user
        user = get_or_create_oauth_user(
            db=db,
            email=email,
            provider="github",
            provider_id=provider_id,
            name=name,
            username=username
        )
        
        # Create JWT token
        token = create_access_token({"sub": str(user.id)})
        
        # Create redirect response
        redirect_url = f"{settings.FRONTEND_URL}/dashboard"
        response = RedirectResponse(url=redirect_url, status_code=302)
        
        # Set cookie
        set_auth_cookie(response, token)
        
        return response
        
    except OAuthError as e:
        raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")




