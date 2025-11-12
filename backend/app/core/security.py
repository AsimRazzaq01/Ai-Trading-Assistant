from datetime import datetime, timedelta, timezone
from jose import jwt  # type: ignore
from passlib.context import CryptContext  # type: ignore
from .config import settings

# Initialize the password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain password using bcrypt.
    bcrypt only supports up to 72 bytes, so truncate longer ones safely.
    """
    if password is None:
        raise ValueError("Password cannot be None")

    # Truncate if password length exceeds bcrypt's 72-byte limit
    if len(password) > 72:
        password = password[:72]

    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify a plain password against its hashed version.
    Ensures both values are valid and truncates plain text if needed.
    """
    if plain is None or hashed is None:
        return False

    if len(plain) > 72:
        plain = plain[:72]

    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    """
    Create a JWT access token with expiration.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt
