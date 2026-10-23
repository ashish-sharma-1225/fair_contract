from datetime import datetime, timezone
from fastapi import APIRouter
from app.database import test_connection
from app.schemas.common import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse, summary="Check backend and database health")
def check_health() -> HealthResponse:
    """Returns application status and verifies active PostgreSQL database connectivity."""
    db_ok = test_connection()
    return HealthResponse(
        status="ok" if db_ok else "degraded",
        version="1.0.0",
        database="connected" if db_ok else "disconnected",
        timestamp=datetime.now(timezone.utc),
    )
