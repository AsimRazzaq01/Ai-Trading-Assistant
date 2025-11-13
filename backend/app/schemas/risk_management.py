# backend/app/schemas/risk_management.py

from pydantic import BaseModel
from datetime import datetime


class RiskSettingsCreate(BaseModel):
    max_position_size: float = 10.0
    stop_loss: float = 5.0
    take_profit: float = 15.0


class RiskSettingsResponse(BaseModel):
    id: int
    user_id: int
    max_position_size: float
    stop_loss: float
    take_profit: float
    updated_at: datetime

    class Config:
        from_attributes = True

