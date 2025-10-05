from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.core.security import hash_password, create_jwt_token, verify_password
from app.api.deps import get_current_user_from_cookie

router = APIRouter()

@router.post("/register")
def register(user: dict, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user["email"]).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user["password"])
    new_user = models.User(email=user["email"], password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: dict, response: Response, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user["email"]).first()
    if not db_user or not verify_password(user["password"], db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_jwt_token({"sub": str(db_user.id)})
    # HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24,  # 1 day
        samesite="lax"
    )
    return {"message": "Login successful"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


@router.get("/me")
def read_users_me(current_user: models.User = Depends(get_current_user_from_cookie)):
    return {"id": current_user.id, "email": current_user.email}
