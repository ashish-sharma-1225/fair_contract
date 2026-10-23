<<<<<<< HEAD
import os
import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_ORIGIN, FILE_STORAGE_DIR, MAX_UPLOAD_MB
from app.schemas import (
    Contract, Policy, PolicyCreate, PolicyUpdate,
    RegulatoryRule, Analysis, Finding, ContractExtraction,
    AnalysisCreateRequest, FindingReviewRequest
)
from app.db import db
from app.services.pdf_service import calculate_sha256, is_valid_pdf, extract_pdf_text_and_pages
from app.services.analysis_service import run_contract_analysis

app = FastAPI(
    title="ClauseLens Contract Analysis API",
    description="Backend API for AI-assisted contract review and risk flagging",
    version="1.0.0"
)

# CORS Middleware
origins = [
    FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
>>>>>>> 73cd43baa9239e0f0e7a66b4039e4264647e20d9
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# ----------------- Health -----------------
@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.0", "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()}

# ----------------- Contracts -----------------
@app.get("/api/contracts", response_model=List[Contract])
def get_contracts():
    contracts_list = list(db.contracts.values())
    contracts_list.sort(key=lambda c: c.uploaded_at, reverse=True)
    return contracts_list

@app.get("/api/contracts/{contract_id}", response_model=Contract)
def get_contract(contract_id: str):
    if contract_id not in db.contracts:
        raise HTTPException(status_code=404, detail="Contract not found")
    return db.contracts[contract_id]

@app.post("/api/contracts", response_model=Contract)
async def upload_contract(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")

    contents = await file.read()
    size_bytes = len(contents)

    if size_bytes > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_MB} MB."
        )

    # Validate PDF signature
    if not is_valid_pdf(contents) and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only valid PDF documents are supported."
        )

    sha256_hash = calculate_sha256(contents)
    contract_id = f"ctr_{int(datetime.datetime.now().timestamp() * 1000)}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    # Save file to private storage
    file_path = Path(FILE_STORAGE_DIR) / f"{contract_id}.pdf"
    with open(file_path, "wb") as f:
        f.write(contents)

    # Extract text and page structures
    page_count, pages = extract_pdf_text_and_pages(contents)

    extraction = ContractExtraction(
        contract_id=contract_id,
        page_count=page_count,
        pages=pages,
        extracted_at=now_iso
    )
    db.extractions[contract_id] = extraction

    contract = Contract(
        id=contract_id,
        owner_id="usr_demo_8829",
        filename_original=file.filename,
        storage_key=f"private_uploads/{contract_id}.pdf",
        sha256=sha256_hash,
        mime_type="application/pdf",
        size_bytes=size_bytes,
        page_count=page_count,
        status="extracted",
        uploaded_at=now_iso
    )
    db.contracts[contract_id] = contract
    db.save()

    return contract

@app.get("/api/contracts/{contract_id}/extract", response_model=ContractExtraction)
def get_contract_extraction(contract_id: str):
    if contract_id not in db.contracts:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract_id in db.extractions:
        return db.extractions[contract_id]
    
    # Try reading file if extraction not cached
    file_path = Path(FILE_STORAGE_DIR) / f"{contract_id}.pdf"
    if file_path.exists():
        with open(file_path, "rb") as f:
            bytes_data = f.read()
        page_count, pages = extract_pdf_text_and_pages(bytes_data)
        extraction = ContractExtraction(
            contract_id=contract_id,
            page_count=page_count,
            pages=pages,
            extracted_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
        )
        db.extractions[contract_id] = extraction
        db.save()
        return extraction

    raise HTTPException(status_code=404, detail="Contract extraction not found")

@app.delete("/api/contracts/{contract_id}")
def delete_contract(contract_id: str):
    if contract_id not in db.contracts:
        raise HTTPException(status_code=404, detail="Contract not found")

    del db.contracts[contract_id]
    if contract_id in db.extractions:
        del db.extractions[contract_id]

    # Delete associated file
    file_path = Path(FILE_STORAGE_DIR) / f"{contract_id}.pdf"
    if file_path.exists():
        try:
            os.remove(file_path)
        except Exception:
            pass

    # Remove analyses pointing to this contract
    analyses_to_del = [aid for aid, a in db.analyses.items() if a.contract_id == contract_id]
    for aid in analyses_to_del:
        del db.analyses[aid]

    db.save()
    return {"success": True, "id": contract_id}

# ----------------- Analysis -----------------
@app.post("/api/contracts/{contract_id}/analyze", response_model=Analysis)
def analyze_contract(contract_id: str, req: AnalysisCreateRequest):
    if contract_id not in db.contracts:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = db.contracts[contract_id]
    extraction = db.extractions.get(contract_id)
    if not extraction:
        # Load file
        file_path = Path(FILE_STORAGE_DIR) / f"{contract_id}.pdf"
        if file_path.exists():
            with open(file_path, "rb") as f:
                page_count, pages = extract_pdf_text_and_pages(f.read())
            extraction = ContractExtraction(
                contract_id=contract_id,
                page_count=page_count,
                pages=pages,
                extracted_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
            )
            db.extractions[contract_id] = extraction
        else:
            raise HTTPException(status_code=400, detail="Contract text extraction not available")

    # Select policies
    if req.policy_ids:
        policies = [db.policies[pid] for pid in req.policy_ids if pid in db.policies]
    else:
        policies = [p for p in db.policies.values() if p.is_enabled]

    # Select regulatory rules
    if req.regulatory_rule_ids:
        rules = [db.regulatory_rules[rid] for rid in req.regulatory_rule_ids if rid in db.regulatory_rules]
    else:
        rules = [r for r in db.regulatory_rules.values() if r.is_selected]

    # Run analysis
    analysis = run_contract_analysis(
        contract_id=contract.id,
        contract_name=contract.filename_original,
        pages=extraction.pages,
        selected_policies=policies,
        selected_rules=rules
    )

    # Update contract with analysis result
    contract.status = "analyzed"
    contract.latest_analysis_id = analysis.id
    contract.risk_summary = analysis.findings_count
    db.contracts[contract.id] = contract

    # Store analysis
    db.analyses[analysis.id] = analysis
    db.save()

    return analysis

@app.get("/api/analyses", response_model=List[Analysis])
def get_analyses():
    analyses_list = list(db.analyses.values())
    analyses_list.sort(key=lambda a: a.created_at, reverse=True)
    return analyses_list

@app.get("/api/analyses/{analysis_id}", response_model=Analysis)
def get_analysis(analysis_id: str):
    if analysis_id not in db.analyses:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return db.analyses[analysis_id]

@app.delete("/api/analyses/{analysis_id}")
def delete_analysis(analysis_id: str):
    if analysis_id not in db.analyses:
        raise HTTPException(status_code=404, detail="Analysis not found")
    del db.analyses[analysis_id]
    db.save()
    return {"success": True, "id": analysis_id}

@app.patch("/api/findings/{finding_id}/review", response_model=Finding)
def update_finding_review(finding_id: str, req: FindingReviewRequest):
    for analysis in db.analyses.values():
        if analysis.findings:
            for finding in analysis.findings:
                if finding.id == finding_id:
                    finding.review_status = req.review_status
                    db.save()
                    return finding
    raise HTTPException(status_code=404, detail="Finding not found")

# ----------------- Policies -----------------
@app.get("/api/policies", response_model=List[Policy])
def get_policies():
    policies_list = list(db.policies.values())
    policies_list.sort(key=lambda p: p.created_at, reverse=True)
    return policies_list

@app.post("/api/policies", response_model=Policy, status_code=status.HTTP_201_CREATED)
def create_policy(policy_data: PolicyCreate):
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    new_id = f"pol_{int(datetime.datetime.now().timestamp() * 1000)}"
    new_policy = Policy(
        id=new_id,
        owner_id="usr_demo_8829",
        name=policy_data.name,
        category=policy_data.category,
        rule_text=policy_data.rule_text,
        rule_config=policy_data.rule_config,
        severity=policy_data.severity,
        is_enabled=policy_data.is_enabled,
        created_at=now_iso,
        updated_at=now_iso
    )
    db.policies[new_id] = new_policy
    db.save()
    return new_policy

@app.patch("/api/policies/{policy_id}", response_model=Policy)
def update_policy(policy_id: str, updates: PolicyUpdate):
    if policy_id not in db.policies:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    current = db.policies[policy_id]
    data = current.model_dump()
    updates_dict = updates.model_dump(exclude_unset=True)
    
    for k, v in updates_dict.items():
        data[k] = v
    data["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    updated_policy = Policy(**data)
    db.policies[policy_id] = updated_policy
    db.save()
    return updated_policy

@app.delete("/api/policies/{policy_id}")
def delete_policy(policy_id: str):
    if policy_id not in db.policies:
        raise HTTPException(status_code=404, detail="Policy not found")
    del db.policies[policy_id]
    db.save()
    return {"success": True, "id": policy_id}

# ----------------- Regulatory Rules -----------------
@app.get("/api/regulatory-rules", response_model=List[RegulatoryRule])
def get_regulatory_rules():
    return list(db.regulatory_rules.values())
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
>>>>>>> 73cd43baa9239e0f0e7a66b4039e4264647e20d9
