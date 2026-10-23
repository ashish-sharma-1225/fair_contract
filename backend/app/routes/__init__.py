from app.routes.health import router as health_router
from app.routes.contracts import router as contracts_router
from app.routes.policies import router as policies_router
from app.routes.history import router as history_router
from app.routes.regulatory import router as regulatory_router

__all__ = [
    "health_router",
    "contracts_router",
    "policies_router",
    "history_router",
    "regulatory_router",
]
