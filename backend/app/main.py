# backend/app/main.py

print("🚀 Booting FastAPI container...")

# ============================================================
# 🧩 Imports
# ============================================================
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from starlette.middleware.proxy_headers import ProxyHeadersMiddleware
    from app.api.auth_router import router as auth_router
    from app.api.debug_router import router as debug_router
    from app.db.database import Base, engine
    from app.core.config import settings
    print("✅ Imports succeeded.")
except Exception as e:
    print(f"❌ Import failed during startup: {e}")

# ============================================================
# 🚀 FastAPI Initialization
# ============================================================

app = FastAPI(title="AI Trading Assistant")

# ============================================================
# 🌐 CORS Configuration
# ============================================================

origins = [o.strip().rstrip("/") for o in settings.ALLOWED_ORIGINS.split(",")]
print("🌍 Allowed origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 🔒 Proxy Headers for Railway HTTPS
# ============================================================

try:
    # ✅ Ensures FastAPI respects Railway’s X-Forwarded-Proto header
    app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])
    print("✅ ProxyHeadersMiddleware added successfully.")
except Exception as e:
    print(f"⚠️ Could not add ProxyHeadersMiddleware: {e}")

# ============================================================
# 🗄️ Database Setup
# ============================================================

@app.on_event("startup")
def on_startup():
    try:
        print("🔧 Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables are ready.")
    except Exception as e:
        print(f"❌ Database init failed: {e}")

# ============================================================
# 🧩 Routers
# ============================================================

# Authentication routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# Debug routes for diagnostics
app.include_router(debug_router)

# ============================================================
# ❤️ Health Check
# ============================================================

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok"}

@app.get("/healthz", tags=["Health"])
def healthz():
    """Used by Railway health checks."""
    return {"message": "alive"}





















#
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.api.auth_router import router as auth_router
# from app.db.database import Base, engine
# from app.core.config import settings
#
# app = FastAPI(title="AI Trading Assistant")
#
# # ✅ Unified CORS setup
# origins = [o.strip().rstrip("/") for o in settings.ALLOWED_ORIGINS.split(",")]
#
# print("🚀 Allowed origins:", origins)  # check Railway logs after deploy
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
# @app.on_event("startup")
# def on_startup():
#     print("🔧 Initializing database tables...")
#     Base.metadata.create_all(bind=engine)
#     print("✅ Database tables are ready.")
#
# app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
#
# @app.get("/", tags=["Health"])
# def root():
#     return {"status": "ok"}
















# # backend/app/main.py
#
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.api.auth_router import router as auth_router
# from app.db.database import Base, engine
# from app.core.config import settings
#
# # ✅ Initialize FastAPI app
# app = FastAPI(title="AI Trading Assistant")
#
# # ✅ Unified CORS setup (reads from .env)
# origins = [o.strip().rstrip("/") for o in settings.ALLOWED_ORIGINS.split(",")]
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
#
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         # add your deployed frontend origins (https!)
#         "https://ai-trading-assistant-steel.vercel.app/",
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
#
# # ✅ Initialize DB
# @app.on_event("startup")
# def on_startup():
#     print("🔧 Initializing database tables...")
#     Base.metadata.create_all(bind=engine)
#     print("✅ Database tables are ready.")
#
# # ✅ Routers
# app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
#
# # ✅ Health check
# @app.get("/", tags=["Health"])
# def root():
#     return {"status": "ok"}








# # ✅ CORS Configuration
# origins = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,     # 🔥 Needed for cookies / auth
#     allow_methods=["*"],        # Allow POST, GET, OPTIONS, etc.
#     allow_headers=["*"],
# )
