# backend/app/main.py

print("🚀 Booting FastAPI container...")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware  # type: ignore
from app.api.auth_router import router as auth_router
from app.api.trades_router import router as trades_router
from app.api.debug_router import router as debug_router
from app.api.watchlist_router import router as watchlist_router
from app.api.chat_router import router as chat_router
from app.api.pattern_trends_router import router as pattern_trends_router
from app.api.risk_management_router import router as risk_management_router
from app.api.oauth_debug import router as oauth_debug_router
from app.db.database import Base, engine
from app.core.config import settings

print("🍪 COOKIE_DOMAIN loaded as:", settings.COOKIE_DOMAIN)

# ============================================================
# 🔒 Proxy / Trusted Host Middleware (Flexible Import)
# ============================================================

proxy_available = False
try:
    # ✅ Modern Starlette (v0.38+)
    # pyright: ignore
    from starlette.middleware.proxy_headers import ProxyHeadersMiddleware  # type: ignore
    proxy_available = True
    print("✅ ProxyHeadersMiddleware import successful (modern Starlette).")
except ModuleNotFoundError:
    try:
        from starlette.middleware import ProxyHeadersMiddleware  # type: ignore
        proxy_available = True
        print("✅ ProxyHeadersMiddleware import successful (legacy path).")
    except Exception as e:
        print(f"⚠️ ProxyHeadersMiddleware not available: {e}")
        proxy_available = False


# ============================================================
# ⚙️ Initialize FastAPI
# ============================================================

app = FastAPI(title="Profit Path — AI Trading Assistant")


# ============================================================
# 🔐 Session Middleware (Required for OAuth)
# ============================================================

# Session secret key - use JWT secret or generate a new one for sessions
# Sessions are used by Authlib to store OAuth state
session_secret = settings.JWT_SECRET_KEY if settings.JWT_SECRET_KEY != "change_me" else "session-secret-key-change-in-production"

# Determine session cookie settings based on environment
is_production = settings.ENV.lower() == "production"

app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret,
    max_age=60 * 60 * 24,  # 24 hours
    same_site="none" if is_production else "lax",
    https_only=is_production,
)

print("✅ SessionMiddleware configured for OAuth.")


# ============================================================
# 🌐 CORS Configuration (Works for Local + Vercel)
# ============================================================

# Allowed origins — split string into list safely
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
print("🌍 Allowed origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # ✅ Required for cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Set-Cookie"],
)

print("✅ CORS middleware configured with credentials support.")


# ============================================================
# 🔒 Enable Proxy Middleware (for Railway/Vercel)
# ============================================================

if proxy_available:
    app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])
    print("✅ ProxyHeadersMiddleware enabled (trusting Railway proxy).")
else:
    print("⚠️ Skipping ProxyHeadersMiddleware (not available).")


# ============================================================
# 🗄️ Database Initialization
# ============================================================

@app.on_event("startup")
def on_startup():
    from sqlalchemy.exc import OperationalError
    from sqlalchemy import text
    import time

    max_attempts = 10
    for attempt in range(1, max_attempts + 1):
        try:
            print(f"🔧 Initializing database tables... (attempt {attempt}/{max_attempts})")
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables are ready.")
            
            # Migrate: Make email column nullable if it's not already
            try:
                with engine.begin() as conn:
                    # Check if email column is nullable
                    result = conn.execute(text("""
                        SELECT is_nullable 
                        FROM information_schema.columns 
                        WHERE table_name = 'users' AND column_name = 'email'
                    """))
                    row = result.fetchone()
                    
                    if row and row[0] == 'NO':
                        print("🔧 Migrating: Making email column nullable...")
                        conn.execute(text("ALTER TABLE users ALTER COLUMN email DROP NOT NULL"))
                        print("✅ Migration complete: email column is now nullable")
                    elif row and row[0] == 'YES':
                        print("✅ Email column is already nullable")
                    else:
                        print("⚠️ Could not check email column status (table may not exist yet)")
            except Exception as migration_error:
                # Migration failed, but don't crash the app
                print(f"⚠️ Migration check failed (non-critical): {migration_error}")
            
            break
        except OperationalError as e:
            print(f"⏳ Database not ready yet (attempt {attempt}): {e}")
            time.sleep(2)
        except Exception as e:
            print(f"❌ Database init failed: {e}")
            break


# ============================================================
# 🧩 Routers
# ============================================================

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(trades_router, prefix="/trades", tags=["Trades"])
app.include_router(watchlist_router, tags=["Watchlist"])
app.include_router(chat_router, tags=["Chat"])
app.include_router(pattern_trends_router, tags=["Pattern Trends"])
app.include_router(risk_management_router, tags=["Risk Management"])
app.include_router(debug_router)
app.include_router(oauth_debug_router, tags=["OAuth Debug"])


# ============================================================
# 🪵 Log incoming requests (for debugging)
# ============================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"📥 {request.method} {request.url.path} from Origin: {request.headers.get('origin')}")
    response = await call_next(request)
    response.headers["X-Backend-Processed"] = "true"
    return response


# ============================================================
# ❤️ Health Endpoints
# ============================================================

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "environment": settings.ENV}


@app.get("/healthz", tags=["Health"])
def healthz():
    return {"message": "alive", "cookie_domain": settings.COOKIE_DOMAIN}







