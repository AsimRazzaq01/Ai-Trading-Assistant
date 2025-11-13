# backend/app/db/models.py

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, DateTime, func, ForeignKey, Float
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
    
    # Relationship to watchlist items
    watchlist_items: Mapped[list["WatchlistItem"]] = relationship(
        "WatchlistItem", back_populates="user", cascade="all, delete-orphan"
    )
    
    # Relationship to chat messages
    chat_messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="user", cascade="all, delete-orphan", order_by="ChatMessage.created_at"
    )
    
    # Relationship to pattern trends items
    pattern_trends_items: Mapped[list["PatternTrendsItem"]] = relationship(
        "PatternTrendsItem", back_populates="user", cascade="all, delete-orphan"
    )
    
    # Relationship to risk settings (one-to-one)
    risk_settings: Mapped["RiskSettings | None"] = relationship(
        "RiskSettings", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    symbol: Mapped[str] = mapped_column(String(10), nullable=False, index=True)  # e.g., "AAPL", "TSLA"
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    
    # Relationship to user
    user: Mapped["User"] = relationship("User", back_populates="watchlist_items")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # "user" or "assistant"
    content: Mapped[str] = mapped_column(String(5000), nullable=False)  # Message content
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    
    # Relationship to user
    user: Mapped["User"] = relationship("User", back_populates="chat_messages")


class PatternTrendsItem(Base):
    __tablename__ = "pattern_trends_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    symbol: Mapped[str] = mapped_column(String(10), nullable=False, index=True)  # e.g., "AAPL", "TSLA"
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    
    # Relationship to user
    user: Mapped["User"] = relationship("User", back_populates="pattern_trends_items")


class RiskSettings(Base):
    __tablename__ = "risk_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    max_position_size: Mapped[float] = mapped_column(Float, default=10.0)  # Percentage
    stop_loss: Mapped[float] = mapped_column(Float, default=5.0)  # Percentage
    take_profit: Mapped[float] = mapped_column(Float, default=15.0)  # Percentage
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationship to user
    user: Mapped["User"] = relationship("User", back_populates="risk_settings")