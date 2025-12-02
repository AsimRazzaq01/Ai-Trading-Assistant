# ============================================================
# 📁 backend/app/api/trades_router.py
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_user_from_cookie
from app.db.database import get_db
from app.db import models

router = APIRouter(prefix="/trades", tags=["Trades"])


@router.get("/")
def get_trades(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user_from_cookie)
):
    """
    Secure trades endpoint.
    Only accessible to authenticated users (via cookie or Bearer token).
    """

    # Example query (you’ll replace this with real data later)
    sample_trades = [
        {"symbol": "AAPL", "type": "buy", "quantity": 10, "price": 182.33},
        {"symbol": "TSLA", "type": "sell", "quantity": 5, "price": 214.77},
    ]

    # Use name, username, or email as fallback for greeting
    user_display = current_user.name or current_user.username or current_user.email or "User"
    return {
        "message": f"Welcome back, {user_display}!",
        "trades": sample_trades,
    }









# backend/app/api/trades_router.py

# from fastapi import APIRouter
#
# router = APIRouter()
#
# @router.get("/")
# def get_trades():
#     return {"message": "Trades endpoint working (PLEASE COMPLETE LATER)"}








# from fastapi import APIRouter
#
# router = APIRouter(
#     prefix="/trades",
#     tags=["Trades"]
# )
#
# @router.get("/")
# def get_trades():
#     return {"message": "Trades endpoint working (PLEASE COMPLETE LATER)"}
