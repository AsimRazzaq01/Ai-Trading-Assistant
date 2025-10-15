# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api import auth_router, trades_router, users

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
app.include_router(auth_router.router)
app.include_router(trades_router.router)
app.include_router(users.router)

# ✅ Health check
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok"}
