"""
Schema for AI contract analysis models.

Pydantic v2 models representing the contract analysis domain.
See ai-contract.md Section C for the full specification.

TODO(confirm):
- snake_case field names: verified, using snake_case throughout
- enums exactly as listed in Section C: ClauseType, Severity, PolicyFindingStatus
- nullable evidence/clause_reference: all Optional[str] = None
- 20,000 char limit handled in service (Phase 2), not models
- model name default: gemini-2.5-flash (service-level concern, not in models)
- errors: service raises RuntimeError; caller maps HTTP status (service-level concern)
"""

from __future__ import annotations

from typing import Optional

from enum import Enum

from pydantic import BaseModel, Field, model_validator


class ClauseType(str, Enum):
    """Types of contract clauses."""

    PAYMENT = "payment"
    TERMINATION = "termination"
    RENEWAL = "renewal"
    LIABILITY = "liability"
    CONFIDENTIALITY = "confidentiality"
    JURISDICTION = "jurisdiction"
    OTHER = "other"


class Severity(str, Enum):
    """Severity levels for risks and findings."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class KeyTerm(BaseModel):
    """A key term extracted from a contract."""

    name: str = Field(description="The name of the key term")
    value: str = Field(description="The value or description of the key term")
    clause_type: ClauseType = Field(
        default=ClauseType.OTHER,
        description="The type of clause this term belongs to",
    )
    description: Optional[str] = Field(
        default=None,
        description="Optional additional description",
    )

    model_config = {"populate_by_name": True}


class Risk(BaseModel):
    """A risk identified in the contract."""

    description: str = Field(description="Description of the risk")
    severity: Severity = Field(
        default=Severity.MEDIUM,
        description="Severity level of the risk",
    )
    affected_clauses: Optional[str] = Field(
        default=None,
        description="References to affected clauses",
    )
    mitigation: Optional[str] = Field(
        default=None,
        description="Proposed mitigation measures",
    )
    evidence: Optional[str] = Field(
        default=None,
        description="Evidence supporting the risk claim",
    )

    model_config = {"populate_by_name": True}


class Recommendation(BaseModel):
    """A recommendation for contract improvement or action."""

    title: str = Field(description="Title of the recommendation")
    description: str = Field(description="Detailed description")
    severity: Severity = Field(
        default=Severity.MEDIUM,
        description="Severity level",
    )
    action_required: Optional[str] = Field(
        default=None,
        description="Specific action required",
    )
    estimated_impact: Optional[str] = Field(
        default=None,
        description="Estimated impact of implementing",
    )

    model_config = {"populate_by_name": True}


class PolicyFindingStatus(str, Enum):
    """Compliance status for policy findings."""

    MATCH = "match"
    CONFLICT = "conflict"
    MISSING = "missing"


class PolicyFinding(BaseModel):
    """A finding regarding a policy or regulatory compliance."""

    policy_name: str = Field(description="Name of the policy or regulation")
    rule: str = Field(
        description="The exact policy rule text supplied by the caller that "
                    "this finding corresponds to. Must match one of the "
                    "supplied rules for the named policy."
    )
    status: PolicyFindingStatus = Field(
        description="Whether the contract matches, conflicts with, or "
                    "lacks the requirement."
    )
    finding: str = Field(description="Description of the finding")
    evidence: Optional[str] = Field(
        default=None,
        description="Evidence supporting the finding",
    )
    clause_reference: Optional[str] = Field(
        default=None,
        description="Reference to the relevant contract clause",
    )
    severity: Severity = Field(
        default=Severity.MEDIUM,
        description="Severity of the finding",
    )

    @model_validator(mode="after")
    def _missing_has_no_evidence(self) -> "PolicyFinding":
        if self.status == PolicyFindingStatus.MISSING and self.evidence is not None:
            raise ValueError("evidence must be None when status is 'missing'")
        return self

    model_config = {"populate_by_name": True}


class ContractAnalysis(BaseModel):
    """Root model for contract analysis results."""

    summary: str = Field(
        description="Overall summary of the contract analysis",
    )
    key_terms: list[KeyTerm] = Field(
        default_factory=list,
        description="Extracted key terms from the contract",
    )
    risks: list[Risk] = Field(
        default_factory=list,
        description="Identified risks in the contract",
    )
    policy_findings: list[PolicyFinding] = Field(
        default_factory=list,
        description="Policy/regulatory compliance findings",
    )
    recommendations: list[Recommendation] = Field(
        default_factory=list,
        description="Generated recommendations",
    )

    model_config = {"populate_by_name": True}
