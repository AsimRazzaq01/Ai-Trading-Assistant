# backend/app/api/pattern_trends_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user_from_cookie
from app.db.database import get_db
from app.db import models
from app.schemas import pattern_trends

router = APIRouter()


@router.get("/pattern-trends", response_model=pattern_trends.PatternTrendsResponse)
def get_pattern_trends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    """Get all pattern trends items for the current user."""
    items = db.query(models.PatternTrendsItem).filter(
        models.PatternTrendsItem.user_id == current_user.id
    ).all()
    
    return pattern_trends.PatternTrendsResponse(items=items)


@router.post("/pattern-trends", response_model=pattern_trends.PatternTrendsItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_pattern_trends(
    item: pattern_trends.PatternTrendsItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    """Add a symbol to the user's pattern trends."""
    symbol = item.symbol.strip().upper()
    
    if not symbol:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symbol cannot be empty"
        )
    
    # Check if already exists
    existing = db.query(models.PatternTrendsItem).filter(
        models.PatternTrendsItem.user_id == current_user.id,
        models.PatternTrendsItem.symbol == symbol
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symbol already in pattern trends"
        )
    
    # Create new pattern trends item
    pattern_trends_item = models.PatternTrendsItem(
        user_id=current_user.id,
        symbol=symbol
    )
    
    db.add(pattern_trends_item)
    db.commit()
    db.refresh(pattern_trends_item)
    
    return pattern_trends_item


@router.delete("/pattern-trends/{symbol}")
def remove_from_pattern_trends(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    """Remove a symbol from the user's pattern trends."""
    symbol = symbol.strip().upper()
    
    pattern_trends_item = db.query(models.PatternTrendsItem).filter(
        models.PatternTrendsItem.user_id == current_user.id,
        models.PatternTrendsItem.symbol == symbol
    ).first()
    
    if not pattern_trends_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symbol not found in pattern trends"
        )
    
    db.delete(pattern_trends_item)
    db.commit()
    
    return {"message": f"Removed {symbol} from pattern trends"}

