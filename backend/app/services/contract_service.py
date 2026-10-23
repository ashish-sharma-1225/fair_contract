import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.contract import Contract
from app.models.analysis import Analysis, Finding
from app.schemas.common import RiskSummary
from app.schemas.contract import (
    ContractResponse,
    ContractExtractionPage,
    ContractExtractionResponse,
)
from app.services.file_service import FileService

logger = logging.getLogger("clauselens.contract_service")


class ContractService:
    @staticmethod
    def _enrich_contract(db: Session, contract: Contract) -> ContractResponse:
        """Enrich a contract record with latest analysis info and risk summary."""
        latest_analysis = (
            db.query(Analysis)
            .filter(Analysis.contract_id == contract.id)
            .order_by(desc(Analysis.created_at))
            .first()
        )

        risk_summary = RiskSummary(high=0, medium=0, low=0, total=0)
        latest_analysis_id = None

        if latest_analysis:
            latest_analysis_id = latest_analysis.id
            findings = db.query(Finding).filter(Finding.analysis_id == latest_analysis.id).all()
            high_count = sum(1 for f in findings if f.severity == "high")
            med_count = sum(1 for f in findings if f.severity == "medium")
            low_count = sum(1 for f in findings if f.severity == "low")
            risk_summary = RiskSummary(
                high=high_count,
                medium=med_count,
                low=low_count,
                total=len(findings),
            )

        return ContractResponse(
            id=contract.id,
            owner_id=contract.owner_id,
            filename_original=contract.filename_original,
            storage_key=contract.storage_key,
            sha256=contract.sha256,
            mime_type=contract.mime_type,
            size_bytes=contract.size_bytes,
            page_count=contract.page_count,
            status=contract.status,
            uploaded_at=contract.uploaded_at,
            deleted_at=contract.deleted_at,
            latest_analysis_id=latest_analysis_id,
            risk_summary=risk_summary,
        )

    @classmethod
    def list_contracts(cls, db: Session, user_id: str) -> List[ContractResponse]:
        """List active contracts owned by the current user."""
        contracts = (
            db.query(Contract)
            .filter(Contract.owner_id == user_id, Contract.deleted_at.is_(None))
            .order_by(desc(Contract.uploaded_at))
            .all()
        )
        return [cls._enrich_contract(db, c) for c in contracts]

    @classmethod
    def get_contract(cls, db: Session, contract_id: str, user_id: str) -> ContractResponse:
        """Retrieve a specific contract verifying ownership."""
        contract = (
            db.query(Contract)
            .filter(
                Contract.id == contract_id,
                Contract.owner_id == user_id,
                Contract.deleted_at.is_(None),
            )
            .first()
        )
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found or access denied.",
            )
        return cls._enrich_contract(db, contract)

    @classmethod
    async def upload_contract(cls, db: Session, user_id: str, file: UploadFile) -> ContractResponse:
        """Process, validate, store PDF and create PostgreSQL contract record."""
        content = await file.read()
        storage_key, sha256_hash, size_bytes, page_count = FileService.validate_and_save_pdf(file, content)

        contract_id = f"cnt_{uuid.uuid4().hex[:12]}"
        contract = Contract(
            id=contract_id,
            owner_id=user_id,
            filename_original=file.filename or "uploaded_contract.pdf",
            storage_key=storage_key,
            sha256=sha256_hash,
            mime_type=file.content_type or "application/pdf",
            size_bytes=size_bytes,
            page_count=page_count,
            status="uploaded",
            uploaded_at=datetime.now(timezone.utc),
        )

        db.add(contract)
        db.commit()
        db.refresh(contract)
        logger.info("Contract registered successfully: id=%s by user=%s", contract.id, user_id)
        return cls._enrich_contract(db, contract)

    @classmethod
    def delete_contract(cls, db: Session, contract_id: str, user_id: str) -> bool:
        """Safely delete contract and associated records, verifying ownership."""
        contract = (
            db.query(Contract)
            .filter(
                Contract.id == contract_id,
                Contract.owner_id == user_id,
                Contract.deleted_at.is_(None),
            )
            .first()
        )
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found or access denied.",
            )

        # Remove physical file from storage
        FileService.remove_file(contract.storage_key)

        # Delete contract (cascades to analyses and findings)
        db.delete(contract)
        db.commit()
        logger.info("Contract %s deleted successfully by user %s", contract_id, user_id)
        return True

    @classmethod
    def get_contract_extraction(cls, db: Session, contract_id: str, user_id: str) -> ContractExtractionResponse:
        """Extract text and pages from contract document for UI preview and analysis."""
        contract = (
            db.query(Contract)
            .filter(
                Contract.id == contract_id,
                Contract.owner_id == user_id,
                Contract.deleted_at.is_(None),
            )
            .first()
        )
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found or access denied.",
            )

        pages_text = FileService.extract_text_pages(contract.storage_key)
        pages: List[ContractExtractionPage] = []
        for idx, text in enumerate(pages_text):
            pnum = idx + 1
            paragraphs = [p for p in text.split("\n\n") if p.strip()]
            pages.append(
                ContractExtractionPage(
                    page_number=pnum,
                    text=text,
                    clauses_count=max(1, len(paragraphs)),
                )
            )

        return ContractExtractionResponse(
            contract_id=contract.id,
            page_count=len(pages) or contract.page_count,
            pages=pages,
            extracted_at=datetime.now(timezone.utc).isoformat(),
        )

