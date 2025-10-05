from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str | None = None
email: EmailStr | None = None
username: str | None = Field(None, min_length=3)
password: str | None = Field(None, min_length=6)


class UserPublic(BaseModel):
    id: int
name: str | None = None
email: EmailStr | None = None
username: str | None = None


class Config:
    from_attributes = True