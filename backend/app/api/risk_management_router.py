# backend/app/api/risk_management_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user_from_cookie
from app.db.database import get_db
from app.db import models
from app.schemas import risk_management

router = APIRouter()


@router.get("/risk-management/settings", response_model=risk_management.RiskSettingsResponse)
def get_risk_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    """Get risk management settings for the current user."""
    settings = db.query(models.RiskSettings).filter(
        models.RiskSettings.user_id == current_user.id
    ).first()
    
    # If no settings exist, create default ones
    if not settings:
        settings = models.RiskSettings(
            user_id=current_user.id,
            max_position_size=10.0,
            stop_loss=5.0,
            take_profit=15.0
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("/risk-management/settings", response_model=risk_management.RiskSettingsResponse)
def update_risk_settings(
    settings_data: risk_management.RiskSettingsCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie)
):
    """Update risk management settings for the current user."""
    settings = db.query(models.RiskSettings).filter(
        models.RiskSettings.user_id == current_user.id
    ).first()
    
    if settings:
        # Update existing settings
        settings.max_position_size = settings_data.max_position_size
        settings.stop_loss = settings_data.stop_loss
        settings.take_profit = settings_data.take_profit
    else:
        # Create new settings
        settings = models.RiskSettings(
            user_id=current_user.id,
            max_position_size=settings_data.max_position_size,
            stop_loss=settings_data.stop_loss,
            take_profit=settings_data.take_profit
        )
        db.add(settings)
    
    db.commit()
    db.refresh(settings)
    
    return settings

