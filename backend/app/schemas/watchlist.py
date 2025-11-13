# backend/app/schemas/watchlist.py

from pydantic import BaseModel
from datetime import datetime


class WatchlistItemCreate(BaseModel):
    symbol: str


class WatchlistItemResponse(BaseModel):
    id: int
    symbol: str
    created_at: datetime

    class Config:
        from_attributes = True


class WatchlistResponse(BaseModel):
    items: list[WatchlistItemResponse]

