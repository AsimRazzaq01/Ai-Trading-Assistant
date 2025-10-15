# backend/app/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

# --- Database Engine ---
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # helps prevent "stale connection" errors
)

# --- Session Factory ---
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


# --- Declarative Base ---
class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# --- Dependency for FastAPI routes ---
def get_db():
    """
    Yields a new database session for each request.
    Ensures it is properly closed after the request ends.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



