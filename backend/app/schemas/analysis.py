from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.common import RiskSummary

ReviewStatus = Literal["needs_review", "reviewed", "dismissed"]


class FindingResponse(BaseModel):
    id: str
    analysis_id: str
    policy_id: Optional[str] = None
    regulatory_rule_id: Optional[str] = None
    trigger_type: str
    trigger_name: str
    category: str
    severity: str
    source_quote: str
    page_number: int = 1
    section_reference: Optional[str] = None
    reason: str
    remediation_advice: str
    evidence_verified: bool = True
    review_status: str = "needs_review"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FindingReviewUpdate(BaseModel):
    review_status: ReviewStatus


class AnalysisStartRequest(BaseModel):
    policy_ids: List[str] = Field(default_factory=list)
    regulatory_rule_ids: List[str] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    id: str
    contract_id: str
    contract_name: str
    owner_id: str
    status: str
    model_provider: str
    model_name: str
    summary: str
    overall_risk_level: str
    findings_count: RiskSummary
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_code: Optional[str] = None
    policy_snapshot: Optional[List[Dict[str, Any]]] = None
    regulatory_rules_snapshot: Optional[List[Dict[str, Any]]] = None
    findings: Optional[List[FindingResponse]] = None

    model_config = ConfigDict(from_attributes=True)
