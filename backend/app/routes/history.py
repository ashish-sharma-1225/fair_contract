from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.analysis import AnalysisResponse, FindingResponse, FindingReviewUpdate
from app.schemas.common import SuccessResponse
from app.services.analysis_service import AnalysisService

router = APIRouter(tags=["Analysis History"])


@router.get("/history", response_model=List[AnalysisResponse], summary="Retrieve analysis history")
def list_history(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> List[AnalysisResponse]:
    """Retrieve contract analysis history for the current user."""
    return AnalysisService.list_history(db, user_id)


@router.delete("/history/{id}", response_model=SuccessResponse, summary="Delete an analysis history entry")
def delete_history_entry(
    id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> SuccessResponse:
    """Delete an analysis history entry and associated findings."""
    AnalysisService.delete_history_entry(db, id, user_id)
    return SuccessResponse(success=True, id=id, message="Analysis history entry deleted")


@router.get("/analyses/{id}", response_model=AnalysisResponse, summary="Retrieve analysis report details")
def get_analysis_details(
    id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> AnalysisResponse:
    """Retrieve full analysis details and findings by analysis ID."""
    return AnalysisService.get_analysis(db, id, user_id)


@router.patch("/findings/{id}/review", response_model=FindingResponse, summary="Update finding review status")
def update_finding_review(
    id: str,
    update_in: FindingReviewUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> FindingResponse:
    """Update finding review status (needs_review, reviewed, dismissed)."""
    return AnalysisService.update_finding_review(db, id, user_id, update_in.review_status)
