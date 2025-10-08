# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth_router import router as auth_router
from app.api.trades_router import router as trades_router

app = FastAPI(
    title="AI Trading Assistant API",
    version="1.0.0",
    description="Backend API for the AI Trading Assistant platform",
)

# --- CORS Configuration ---
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],  # fallback for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(trades_router, prefix="/trades", tags=["Trades"])

# --- Root Endpoint ---
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "AI Trading Assistant API"}
