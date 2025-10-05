from pydantic import BaseModel


class TokenPayload(BaseModel):
    sub: str # internal user id as string