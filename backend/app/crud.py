from sqlalchemy.orm import Session
from .db import models
from .schemas import portfolio as portfolio_schema

def get_portfolio_items(db: Session, user_id: int):
    return db.query(models.Portfolio).filter(models.Portfolio.owner_id == user_id).all()

def create_portfolio_item(db: Session, item: portfolio_schema.PortfolioCreate, user_id: int):
    db_item = models.Portfolio(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_portfolio_item(db: Session, item_id: int, user_id: int):
    db_item = db.query(models.Portfolio).filter(models.Portfolio.id == item_id, models.Portfolio.owner_id == user_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item