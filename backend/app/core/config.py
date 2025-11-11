# backend/app/core/config.py

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # --- Database ---
    DATABASE_URL: str

    # --- JWT ---
    JWT_SECRET_KEY: str = "change_me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # --- Environment ---
    ENV: str = "development"

    # --- Cookies ---
    COOKIE_NAME: str = "access_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"  # "none" for production
    COOKIE_DOMAIN: Optional[str] = None

    # --- CORS ---
    ALLOWED_ORIGINS: str = "http://localhost:3000,https://ai-trading-assistant-steel.vercel.app"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
print("🍪 COOKIE_DOMAIN loaded as:", settings.COOKIE_DOMAIN)

















# from pydantic_settings import BaseSettings
# from pydantic import AnyHttpUrl
# from typing import List
#
#
# class Settings(BaseSettings):
#     # --- Database ---
#     DATABASE_URL: str
#
#     # --- JWT ---
#     JWT_SECRET_KEY: str = "change_me"
#     JWT_ALGORITHM: str = "HS256"
#     JWT_EXPIRE_MINUTES: int = 60
#
#     ENV: str = "development"  # "production" on Render
#
#     # --- Cookies ---
#     COOKIE_NAME: str = "access_token"
#     COOKIE_SECURE: bool = False
#     COOKIE_SAMESITE: str = "lax"  # "lax" | "strict" | "none"
#
#     # --- CORS ---
#     ALLOWED_ORIGINS: str = "http://localhost:3000"
#
#     # --- OAuth ---
#     GOOGLE_CLIENT_ID: str = ""
#     GOOGLE_CLIENT_SECRET: str = ""
#     GOOGLE_REDIRECT_URI: str = ""
#
#     GITHUB_CLIENT_ID: str = ""
#     GITHUB_CLIENT_SECRET: str = ""
#     GITHUB_REDIRECT_URI: str = ""
#
#     class Config:
#         env_file = ".env"
#
#
# # Global settings instance
# settings = Settings()
