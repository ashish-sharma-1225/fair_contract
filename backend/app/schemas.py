from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

RiskSeverity = Literal['high', 'medium', 'low']
ClauseCategory = Literal['payment', 'renewal', 'liability', 'jurisdiction', 'other']
ReviewStatus = Literal['needs_review', 'reviewed', 'dismissed']
ContractStatus = Literal['uploaded', 'extracted', 'analyzing', 'analyzed', 'failed']
BindingType = Literal['binding_law', 'official_guidance', 'standard']
OverallRiskLevel = Literal['high', 'medium', 'low', 'clean']

class RiskSummary(BaseModel):
    high: int = 0
    medium: int = 0
    low: int = 0
    total: int = 0

class Contract(BaseModel):
    id: str
    owner_id: str = "usr_demo_8829"
    filename_original: str
    storage_key: str
    sha256: str
    mime_type: str = "application/pdf"
    size_bytes: int
    page_count: int = 1
    status: ContractStatus = "uploaded"
    uploaded_at: str
    deleted_at: Optional[str] = None
    latest_analysis_id: Optional[str] = None
    risk_summary: Optional[RiskSummary] = None

class PolicyRuleConfig(BaseModel):
    max_payment_days: Optional[int] = None
    min_cancellation_notice_days: Optional[int] = None
    liability_cap_percent: Optional[int] = None
    preferred_jurisdiction: Optional[str] = None
    extra: Optional[Dict[str, Any]] = None

class Policy(BaseModel):
    id: str
    owner_id: str = "usr_demo_8829"
    name: str
    category: ClauseCategory
    rule_text: str
    rule_config: Optional[PolicyRuleConfig] = None
    severity: RiskSeverity = "medium"
    is_enabled: bool = True
    created_at: str
    updated_at: str

class PolicyCreate(BaseModel):
    name: str
    category: ClauseCategory
    rule_text: str
    rule_config: Optional[PolicyRuleConfig] = None
    severity: RiskSeverity = "medium"
    is_enabled: bool = True

class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[ClauseCategory] = None
    rule_text: Optional[str] = None
    rule_config: Optional[PolicyRuleConfig] = None
    severity: Optional[RiskSeverity] = None
    is_enabled: Optional[bool] = None

class RegulatorySource(BaseModel):
    id: str
    title: str
    jurisdiction: str
    publisher: str
    official_url: str
    effective_date: str
    last_verified_at: str

class RegulatoryRule(BaseModel):
    id: str
    source_id: str
    source: Optional[RegulatorySource] = None
    rule_code: str
    category: ClauseCategory
    rule_text: str
    applicability_notes: str
    binding_type: BindingType = "binding_law"
    version: str = "1.0"
    status: Literal['active', 'deprecated', 'under_review'] = 'active'
    is_selected: Optional[bool] = True

class Finding(BaseModel):
    id: str
    analysis_id: str
    policy_id: Optional[str] = None
    regulatory_rule_id: Optional[str] = None
    trigger_type: Literal['policy', 'regulatory_rule', 'ai_heuristic']
    trigger_name: str
    category: ClauseCategory
    severity: RiskSeverity
    source_quote: str
    page_number: int = 1
    section_reference: Optional[str] = None
    reason: str
    remediation_advice: str
    evidence_verified: bool = True
    review_status: ReviewStatus = "needs_review"
    created_at: str

class Analysis(BaseModel):
    id: str
    contract_id: str
    contract_name: str
    owner_id: str = "usr_demo_8829"
    status: Literal['pending', 'processing', 'completed', 'failed'] = 'completed'
    model_provider: str = "Gemini / Deterministic Rules"
    model_name: str = "gemini-2.0-flash"
    policy_snapshot: Optional[List[Policy]] = None
    regulatory_rules_snapshot: Optional[List[RegulatoryRule]] = None
    summary: str
    overall_risk_level: OverallRiskLevel = "low"
    findings_count: RiskSummary
    created_at: str
    completed_at: Optional[str] = None
    error_code: Optional[str] = None
    findings: Optional[List[Finding]] = None

class AnalysisCreateRequest(BaseModel):
    policy_ids: List[str] = Field(default_factory=list)
    regulatory_rule_ids: List[str] = Field(default_factory=list)

class FindingReviewRequest(BaseModel):
    review_status: ReviewStatus

class ContractExtractionPage(BaseModel):
    page_number: int
    text: str
    clauses_count: int

class ContractExtraction(BaseModel):
    contract_id: str
    page_count: int
    pages: List[ContractExtractionPage]
    extracted_at: str
