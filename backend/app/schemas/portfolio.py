from pydantic import BaseModel
from datetime import datetime

class PortfolioBase(BaseModel):
    ticker: str
    quantity: int

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True