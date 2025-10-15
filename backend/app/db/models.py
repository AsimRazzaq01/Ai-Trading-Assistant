# backend/app/db/models.py

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, DateTime, func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str | None] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str | None] = mapped_column(String(64), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    provider: Mapped[str] = mapped_column(String(32), default="local")  # local | google | github
    provider_id: Mapped[str | None] = mapped_column(String(255))  # sub/id from OAuth provider
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    theme: Mapped[str] = mapped_column(String(16), default="light")
