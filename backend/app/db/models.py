from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, DateTime, func
from .database import Base


class User(Base):
    __tablename__ = "users"


id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
name: Mapped[str | None] = mapped_column(String(120))
email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)
username: Mapped[str | None] = mapped_column(String(64), unique=True, index=True)
hashed_password: Mapped[str | None] = mapped_column(String(255))


provider: Mapped[str | None] = mapped_column(String(32)) # 'local' | 'google' | 'github'
provider_id: Mapped[str | None] = mapped_column(String(255)) # sub / id from provider


created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())