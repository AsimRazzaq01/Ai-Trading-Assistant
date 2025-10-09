# backend/app/schemas/user.py

from pydantic import BaseModel, EmailStr, Field, model_validator

# =========================
# User Creation Schema
# =========================
class UserCreate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    username: str | None = Field(None, min_length=3)
    password: str = Field(..., min_length=6, max_length=72)

    # ✅ Pydantic v2-compatible validator
    @model_validator(mode="after")
    def ensure_identifier(self):
        if not self.email and not self.username:
            raise ValueError("Either email or username must be provided.")
        return self

# =========================
# Public User Schema
# =========================
class UserPublic(BaseModel):
    id: int
    name: str | None = None
    email: EmailStr | None = None
    username: str | None = None

    class Config:
        from_attributes = True
