# backend/app/api/watchlist_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user_from_cookie
from app.db.database import get_db
from app.db import models
from app.schemas import watchlist

router = APIRouter()


@router.get("/watchlist", response_model=watchlist.WatchlistResponse)
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    """Get all watchlist items for the current user."""
    items = db.query(models.WatchlistItem).filter(
        models.WatchlistItem.user_id == current_user.id
    ).all()
    
    return watchlist.WatchlistResponse(items=items)


@router.post("/watchlist", response_model=watchlist.WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    item: watchlist.WatchlistItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    """Add a symbol to the user's watchlist."""
    symbol = item.symbol.strip().upper()
    
    if not symbol:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symbol cannot be empty"
        )
    
    # Check if already exists
    existing = db.query(models.WatchlistItem).filter(
        models.WatchlistItem.user_id == current_user.id,
        models.WatchlistItem.symbol == symbol
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symbol already in watchlist"
        )
    
    # Create new watchlist item
    watchlist_item = models.WatchlistItem(
        user_id=current_user.id,
        symbol=symbol
    )
    
    db.add(watchlist_item)
    db.commit()
    db.refresh(watchlist_item)
    
    return watchlist_item


@router.delete("/watchlist/{symbol}")
def remove_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    """Remove a symbol from the user's watchlist."""
    symbol = symbol.strip().upper()
    
    watchlist_item = db.query(models.WatchlistItem).filter(
        models.WatchlistItem.user_id == current_user.id,
        models.WatchlistItem.symbol == symbol
    ).first()
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symbol not found in watchlist"
        )
    
    db.delete(watchlist_item)
    db.commit()
    
    return {"message": f"Removed {symbol} from watchlist"}


@router.delete("/watchlist")
def clear_watchlist(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    """Clear all items from the user's watchlist."""
    deleted = db.query(models.WatchlistItem).filter(
        models.WatchlistItem.user_id == current_user.id
    ).delete()
    
    db.commit()
    
    return {"message": f"Cleared {deleted} items from watchlist"}

