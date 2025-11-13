# backend/app/schemas/pattern_trends.py

from pydantic import BaseModel
from datetime import datetime


class PatternTrendsItemCreate(BaseModel):
    symbol: str


class PatternTrendsItemResponse(BaseModel):
    id: int
    symbol: str
    created_at: datetime

    class Config:
        from_attributes = True


class PatternTrendsResponse(BaseModel):
    items: list[PatternTrendsItemResponse]

