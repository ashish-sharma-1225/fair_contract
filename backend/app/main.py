import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.init_db import init_database
from app.routes import (
    health_router,
    contracts_router,
    policies_router,
    history_router,
    regulatory_router,
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("clauselens.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("ClauseLens API starting up on environment: %s", settings.ENVIRONMENT)
    try:
        init_database()
        logger.info("PostgreSQL database verified and initialized.")
    except Exception as e:
        logger.error("Database initialization encountered an error: %s", e)
    yield
    logger.info("ClauseLens API shutting down.")


app = FastAPI(
    title="ClauseLens Contract Intelligence API",
    description="Backend service and PostgreSQL database for ClauseLens AI Contract Analysis.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [o.strip() for o in origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security: catch unhandled exceptions so secrets or raw stack traces are never leaked in responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error processing %s: %s", request.url.path, exc, exc_info=settings.DEBUG)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact system support."},
    )


# Register API endpoints under /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(contracts_router, prefix="/api")
app.include_router(policies_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(regulatory_router, prefix="/api")


@app.get("/", include_in_schema=False)
def root():
    return {
        "service": "ClauseLens Contract Intelligence API",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
    }
