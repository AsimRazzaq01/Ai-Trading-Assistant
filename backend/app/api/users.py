from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.api.auth import get_current_user  # adjust import if your auth util is elsewhere

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/theme")
def get_user_theme(current_user: models.User = Depends(get_current_user)):
    return {"theme": current_user.theme}

@router.put("/theme")
def update_user_theme(
    theme: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if theme not in ["light", "dark"]:
        raise HTTPException(status_code=400, detail="Invalid theme value")
    current_user.theme = theme
    db.commit()
    db.refresh(current_user)
    return {"theme": current_user.theme}
