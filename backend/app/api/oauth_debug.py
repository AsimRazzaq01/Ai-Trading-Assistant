# Debug endpoint for OAuth testing
from fastapi import APIRouter, HTTPException
from app.core.config import settings
from authlib.integrations.starlette_client import OAuth

router = APIRouter()

@router.get("/oauth/debug")
async def oauth_debug():
    """Debug endpoint to check OAuth configuration."""
    try:
        oauth_test = OAuth()
        return {
            "status": "ok",
            "google_client_id": settings.GOOGLE_CLIENT_ID[:20] + "..." if settings.GOOGLE_CLIENT_ID else "EMPTY",
            "google_client_secret": "SET" if settings.GOOGLE_CLIENT_SECRET else "EMPTY",
            "github_client_id": settings.GITHUB_CLIENT_ID[:20] + "..." if settings.GITHUB_CLIENT_ID else "EMPTY",
            "github_client_secret": "SET" if settings.GITHUB_CLIENT_SECRET else "EMPTY",
            "frontend_url": settings.FRONTEND_URL,
            "authlib_available": True
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "authlib_available": False
        }

