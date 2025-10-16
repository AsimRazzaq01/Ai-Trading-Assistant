from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas import portfolio as portfolio_schema
from app import crud
from app.api.deps import get_current_user_from_cookie as get_current_user
from app.db.models import User

router = APIRouter()

@router.get("/", response_model=List[portfolio_schema.Portfolio])
def read_portfolio_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_portfolio_items(db=db, user_id=current_user.id)

@router.post("/", response_model=portfolio_schema.Portfolio)
def create_portfolio_item(
    item: portfolio_schema.PortfolioCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return crud.create_portfolio_item(db=db, item=item, user_id=current_user.id)

@router.delete("/{item_id}", response_model=portfolio_schema.Portfolio)
def delete_portfolio_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted_item = crud.delete_portfolio_item(db=db, item_id=item_id, user_id=current_user.id)
    if not deleted_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return deleted_item