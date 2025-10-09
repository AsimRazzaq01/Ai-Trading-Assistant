# backend/app/api/trades_router.py

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_trades():
    return {"message": "Trades endpoint working (PLEASE COMPLETE LATER)"}








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
