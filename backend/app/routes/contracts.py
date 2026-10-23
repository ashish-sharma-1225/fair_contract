from typing import List
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.contract import ContractResponse, ContractExtractionResponse
from app.schemas.analysis import AnalysisResponse, AnalysisStartRequest
from app.schemas.common import SuccessResponse
from app.services.contract_service import ContractService
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/contracts", tags=["Contracts"])


@router.get("", response_model=List[ContractResponse], summary="List accessible contracts")
def list_contracts(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> List[ContractResponse]:
    """Retrieve all contracts owned by the current user."""
    return ContractService.list_contracts(db, user_id)


@router.post("/upload", response_model=ContractResponse, summary="Upload and register a contract")
async def upload_contract_explicit(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> ContractResponse:
    """Upload a PDF contract, validate size/format, extract page count, and save record."""
    return await ContractService.upload_contract(db, user_id, file)


@router.post("", response_model=ContractResponse, summary="Upload contract (Frontend alias)")
async def upload_contract_alias(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> ContractResponse:
    """Alias for POST /api/contracts matching frontend apiClient.uploadContract."""
    return await ContractService.upload_contract(db, user_id, file)


@router.get("/{id}", response_model=ContractResponse, summary="Retrieve contract details")
def get_contract(
    id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> ContractResponse:
    """Retrieve contract metadata by ID enforcing user ownership."""
    return ContractService.get_contract(db, id, user_id)


@router.get("/{id}/extract", response_model=ContractExtractionResponse, summary="Retrieve contract text extraction")
def get_contract_extraction(
    id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> ContractExtractionResponse:
    """Retrieve extracted text and pages for preview and clause analysis."""
    return ContractService.get_contract_extraction(db, id, user_id)


@router.delete("/{id}", response_model=SuccessResponse, summary="Delete a contract")
def delete_contract(
    id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> SuccessResponse:
    """Delete a contract and safely cascade all associated records."""
    ContractService.delete_contract(db, id, user_id)
    return SuccessResponse(success=True, id=id, message="Contract deleted successfully")


@router.post("/{id}/analyze", response_model=AnalysisResponse, summary="Start contract analysis")
def analyze_contract(
    id: str,
    params: AnalysisStartRequest = AnalysisStartRequest(),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> AnalysisResponse:
    """Run analysis on uploaded contract against selected policies and statutory rules."""
    return AnalysisService.analyze_contract(
        db=db,
        contract_id=id,
        user_id=user_id,
        policy_ids=params.policy_ids,
        regulatory_rule_ids=params.regulatory_rule_ids,
    )
