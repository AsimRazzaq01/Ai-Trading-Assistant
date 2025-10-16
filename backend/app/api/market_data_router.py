from fastapi import APIRouter, Depends, HTTPException
import httpx
from app.core.config import settings
from app.api.deps import get_current_user_from_cookie
from app.db.models import User

router = APIRouter()

FMP_API_BASE_URL = "https://financialmodelingprep.com/api/v3"

@router.get("/price/{ticker}")
async def get_stock_price(ticker: str, current_user: User = Depends(get_current_user_from_cookie)):
    if not settings.FMP_API_KEY or settings.FMP_API_KEY == "YOUR_FMP_API_KEY_HERE":
        raise HTTPException(status_code=400, detail="FMP API key not configured")

    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(
                f"{FMP_API_BASE_URL}/quote-short/{ticker}?apikey={settings.FMP_API_KEY}"
            )
            res.raise_for_status()
            data = res.json()
            if not data:
                raise HTTPException(status_code=404, detail="Stock ticker not found")
            return {"ticker": data[0]['symbol'], "price": data[0]['price']}
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Failed to fetch data from FMP")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")