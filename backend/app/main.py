<<<<<<< HEAD
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

try:
    import pymupdf as fitz
except ImportError:
    import fitz  # fallback for older PyMuPDF versions
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.models.contract_analysis import ContractAnalysis, PolicyFindingStatus
from app.services.gemini_service import analyse_contract

app = FastAPI(title="ClauseLens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
=======
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
    description="Backend service, PostgreSQL database, and Local AI (Qwen2.5-1.5B) for ClauseLens AI Contract Analysis.",
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
>>>>>>> 1d6f5a40150a2a405464c0da4373cfd093162216
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


<<<<<<< HEAD
@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}


def map_to_frontend_analysis(analysis: ContractAnalysis, filename: str) -> dict:
    """Translate backend ContractAnalysis into frontend Analysis schema."""
    analysis_id = f"anl_{uuid4().hex[:8]}"
    contract_id = f"ctr_{uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    findings: list[dict] = []

    # Map Risks into ai_heuristic findings
    for risk in analysis.risks:
        sev_val = risk.severity.value if hasattr(risk.severity, "value") else str(risk.severity)
        section_ref = getattr(risk, "clause_reference", None)
        if not section_ref and getattr(risk, "affected_clauses", None):
            section_ref = ", ".join(risk.affected_clauses)

        reason_text = getattr(risk, "explanation", None) or getattr(risk, "description", "")
        remediation = getattr(risk, "mitigation", None) or "Review this clause."

        findings.append({
            "id": f"fnd_{uuid4().hex[:8]}",
            "analysis_id": analysis_id,
            "trigger_type": "ai_heuristic",
            "trigger_name": "AI Risk Detection",
            "category": "other",
            "severity": sev_val,
            "source_quote": risk.evidence or "",
            "page_number": 1,
            "section_reference": section_ref,
            "reason": reason_text,
            "remediation_advice": remediation,
            "evidence_verified": True,
            "review_status": "needs_review",
            "created_at": now_iso,
        })

    # Map PolicyFindings (conflict or match only)
    for pf in analysis.policy_findings:
        status_val = pf.status.value if hasattr(pf.status, "value") else str(pf.status)
        if status_val not in ("conflict", "match"):
            continue

        sev_val = pf.severity.value if pf.severity and hasattr(pf.severity, "value") else (str(pf.severity) if pf.severity else "medium")

        findings.append({
            "id": f"fnd_{uuid4().hex[:8]}",
            "analysis_id": analysis_id,
            "trigger_type": "policy",
            "trigger_name": pf.policy_name,
            "category": "other",
            "severity": sev_val,
            "source_quote": pf.evidence or "",
            "page_number": 1,
            "section_reference": pf.clause_reference,
            "reason": pf.finding,
            "remediation_advice": "Check policy compliance.",
            "evidence_verified": True,
            "review_status": "needs_review",
            "created_at": now_iso,
        })

    # Calculate findings_count
    high_count = sum(1 for f in findings if f["severity"] == "high")
    med_count = sum(1 for f in findings if f["severity"] == "medium")
    low_count = sum(1 for f in findings if f["severity"] == "low")
    findings_count = {
        "high": high_count,
        "medium": med_count,
        "low": low_count,
        "total": len(findings),
    }

    # Calculate overall_risk_level
    risk_severities = [
        r.severity.value if hasattr(r.severity, "value") else str(r.severity)
        for r in analysis.risks
    ]
    if any(s == "high" for s in risk_severities):
        overall_risk = "high"
    elif any(s == "medium" for s in risk_severities):
        overall_risk = "medium"
    elif analysis.risks:
        overall_risk = "low"
    else:
        overall_risk = "clean"

    return {
        "id": analysis_id,
        "contract_id": contract_id,
        "contract_name": filename,
        "owner_id": "usr_demo_8829",
        "status": "completed",
        "model_provider": "Google Gemini",
        "model_name": "gemini-3.8-flash",
        "summary": analysis.summary,
        "overall_risk_level": overall_risk,
        "findings_count": findings_count,
        "created_at": now_iso,
        "completed_at": now_iso,
        "findings": findings,
    }


@app.post("/api/analyze")
async def analyze_contract_endpoint(
    file: UploadFile = File(...),
    policy_ids: Optional[str] = Form(None),
) -> dict:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        doc = fitz.open(stream=content, filetype="pdf")
        text = "\n".join(page.get_text() for page in doc)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not parse uploaded PDF document: {exc}",
        ) from exc

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No extractable text found in PDF. Scanned or image-only PDFs require OCR.",
        )

    try:
        result: ContractAnalysis = analyse_contract(text)
    except RuntimeError as err:
        err_msg = str(err)
        if "rate limit" in err_msg.lower():
            raise HTTPException(status_code=429, detail=err_msg) from err
        if "unavailable" in err_msg.lower() or "invalid structured output" in err_msg.lower():
            raise HTTPException(status_code=502, detail=err_msg) from err
        raise HTTPException(status_code=500, detail=err_msg) from err

    return map_to_frontend_analysis(result, filename=file.filename or "contract.pdf")
=======
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
>>>>>>> 1d6f5a40150a2a405464c0da4373cfd093162216
