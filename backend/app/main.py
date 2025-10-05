from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth_router import router as auth_router
from app.api.trades_router import router as trades_router


app = FastAPI(title="AI Trading Assistant API")


origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(trades_router)


@app.get("/")
def root():
    return {"ok": True}