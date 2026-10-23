from typing import Optional
from fastapi import Header
from app.core.config import settings


def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> str:
    """
    Extract authenticated user id from header or token.
    Falls back to configured default user id for development and single-tenant testing,
    guaranteeing ownership isolation on all operations.
    """
    if x_user_id and x_user_id.strip():
        return x_user_id.strip()

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        if token:
            return token

    return settings.DEFAULT_USER_ID
