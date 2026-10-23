from datetime import datetime, timezone
from fastapi import APIRouter
from app.database import test_connection
from app.schemas.common import HealthResponse
from app.services.local_llm_service import local_llm_service

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse, summary="Check backend, database, and local AI health")
def check_health() -> HealthResponse:
    """Returns application status, PostgreSQL database connectivity, and Local LLM status."""
    db_ok = test_connection()
    ai_status = local_llm_service.get_status()
    return HealthResponse(
        status="ok" if db_ok else "degraded",
        version="1.0.0",
        database="connected" if db_ok else "disconnected",
        local_ai=ai_status,
        timestamp=datetime.now(timezone.utc),
    )
