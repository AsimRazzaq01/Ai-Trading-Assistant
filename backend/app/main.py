# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth_router import router as auth_router
from app.api.portfolio_router import router as portfolio_router
from app.api.market_data_router import router as market_data_router
from app.db.database import Base, engine

# ✅ Initialize FastAPI app
app = FastAPI(title="AI Trading Assistant")

# ✅ CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,     # 🔥 Needed for cookies / auth
    allow_methods=["*"],        # Allow POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

# ✅ Initialize DB
@app.on_event("startup")
def on_startup():
    print("🔧 Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables are ready.")

# ✅ Routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(portfolio_router, prefix="/portfolio", tags=["Portfolio"])
app.include_router(market_data_router, prefix="/market-data", tags=["Market Data"])

# ✅ Health check
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok"}
