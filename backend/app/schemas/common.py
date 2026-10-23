from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class RiskSummary(BaseModel):
    """Aggregate risk counts for contracts and analyses."""

    high: int = 0
    medium: int = 0
    low: int = 0
    total: int = 0

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = "ok"
    version: str = "1.0.0"
    database: str = "connected"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(from_attributes=True)


class SuccessResponse(BaseModel):
    """Generic status and confirmation response."""

    success: bool = True
    id: Optional[str] = None
    message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
