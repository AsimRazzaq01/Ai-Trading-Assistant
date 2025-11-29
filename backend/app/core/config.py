# backend/app/core/config.py

from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List, Optional


class Settings(BaseSettings):
    # --- Database ---
    DATABASE_URL: str

    # --- JWT ---
    JWT_SECRET_KEY: str = "change_me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # --- Environment ---
    ENV: str = "development"  # "production" on Vercel/Railway

    # --- Cookies ---
    COOKIE_NAME: str = "access_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"  # "lax" | "strict" | "none"
    COOKIE_DOMAIN: Optional[str] = None  # ✅ new — required for production cookies

    # --- CORS ---
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # --- Frontend URL (for OAuth redirects) ---
    FRONTEND_URL: str = "http://localhost:3000"

    # --- OpenAI ---
    OPENAI_API_KEY: str = ""

    # --- OAuth ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""

    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"  # ✅ prevents errors if extra vars are present in .env


# Global settings instance
# Note: DATABASE_URL is loaded from environment variables by Pydantic Settings
settings = Settings()  # type: ignore[call-arg]




