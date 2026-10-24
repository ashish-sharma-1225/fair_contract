"""
Pytest tests for backend/app/models/contract_analysis.py.

Covers the Pydantic schema and model_validator rules.
All tests are local — no API key, no network.
"""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.models.contract_analysis import (
    ClauseType,
    ContractAnalysis,
    KeyTerm,
    PolicyFinding,
    PolicyFindingStatus,
    Recommendation,
    Risk,
    Severity,
)

# ---------------------------------------------------------------------------
# Fixtures / shared data
# ---------------------------------------------------------------------------

_FULL_VALID_SAMPLE: dict = {
    "summary": "Test contract with standard terms.",
    "key_terms": [
        {
            "name": "Effective Date",
            "value": "2024-01-01",
            "clause_type": "payment",
        }
    ],
    "risks": [
        {
            "description": "Unlimited liability clause",
            "severity": "high",
        }
    ],
    "policy_findings": [
        {
            "policy_name": "GDPR",
            "rule": "Personal data must be processed lawfully.",
            "status": "match",
            "finding": "Data processing is within scope.",
        }
    ],
    "recommendations": [
        {
            "title": "Review liability limits",
            "description": "Consider capping liability amounts.",
        }
    ],
}


# ---------------------------------------------------------------------------
# Test 1 — Full valid sample validates
# ---------------------------------------------------------------------------


def test_valid_full_sample_passes() -> None:
    """ContractAnalysis.model_validate succeeds on a full valid sample."""
    result = ContractAnalysis.model_validate(_FULL_VALID_SAMPLE)

    assert result.summary == "Test contract with standard terms."
    assert len(result.key_terms) == 1
    assert len(result.risks) == 1
    assert len(result.policy_findings) == 1
    assert len(result.recommendations) == 1


# ---------------------------------------------------------------------------
# Test 2 — KeyTerm with clause_type="payment" validates
# ---------------------------------------------------------------------------


def test_keyterm_clause_type_payment_validates() -> None:
    """KeyTerm with clause_type='payment' validates without error."""
    term = KeyTerm.model_validate(
        {"name": "Payment Term", "value": "Net 30", "clause_type": "payment"}
    )
    assert term.clause_type == ClauseType.PAYMENT


# ---------------------------------------------------------------------------
# Test 3 — Invalid Severity value is rejected
# ---------------------------------------------------------------------------


def test_invalid_severity_rejected() -> None:
    """Risk with an invalid severity value raises ValidationError."""
    with pytest.raises(ValidationError):
        Risk.model_validate(
            {"description": "Test risk", "severity": "invalid_severity"}
        )


# ---------------------------------------------------------------------------
# Test 4 — PolicyFinding: status=missing + evidence set → rejected
# ---------------------------------------------------------------------------


def test_policy_finding_missing_with_evidence_rejected() -> None:
    """PolicyFinding(status='missing', evidence=<str>) raises ValueError."""
    with pytest.raises((ValueError, ValidationError)):
        PolicyFinding.model_validate(
            {
                "policy_name": "Test Policy",
                "rule": "Test rule.",
                "status": "missing",
                "finding": "Contract does not address this rule.",
                "evidence": "some quoted text",
            }
        )


# ---------------------------------------------------------------------------
# Test 5 — PolicyFinding: status=missing + evidence=None → accepted
# ---------------------------------------------------------------------------


def test_policy_finding_missing_without_evidence_accepted() -> None:
    """PolicyFinding(status='missing', evidence=None) validates cleanly."""
    pf = PolicyFinding.model_validate(
        {
            "policy_name": "Test Policy",
            "rule": "Test rule.",
            "status": "missing",
            "finding": "Contract does not address this rule.",
            "evidence": None,
        }
    )
    assert pf.status == PolicyFindingStatus.MISSING
    assert pf.rule == "Test rule."
    assert pf.evidence is None


# ---------------------------------------------------------------------------
# Test 6 — PolicyFinding: status=conflict + evidence set → accepted
# ---------------------------------------------------------------------------


def test_policy_finding_conflict_with_evidence_accepted() -> None:
    """PolicyFinding(status='conflict', evidence=<str>) validates cleanly."""
    pf = PolicyFinding.model_validate(
        {
            "policy_name": "Data Retention Policy",
            "rule": "Data must not be retained for more than 1 year.",
            "status": "conflict",
            "finding": "Contract retains data for 5 years, policy requires 1.",
            "evidence": "data shall be retained for a period of five years",
        }
    )
    assert pf.status == PolicyFindingStatus.CONFLICT
    assert pf.rule == "Data must not be retained for more than 1 year."
    assert pf.evidence is not None


# ---------------------------------------------------------------------------
# Phase 3d — New model tests for `rule` field on PolicyFinding
# ---------------------------------------------------------------------------


def test_policy_finding_requires_rule() -> None:
    """PolicyFinding raises ValidationError if rule is omitted."""
    with pytest.raises(ValidationError):
        PolicyFinding.model_validate(
            {
                "policy_name": "Test Policy",
                "status": "match",
                "finding": "Test finding without rule.",
            }
        )


def test_policy_finding_missing_with_rule_and_none_evidence() -> None:
    """PolicyFinding with status='missing' and evidence=None validates with rule set."""
    pf = PolicyFinding.model_validate(
        {
            "policy_name": "Security Policy",
            "rule": "Data must be encrypted at rest.",
            "status": "missing",
            "finding": "No mention of encryption at rest.",
            "evidence": None,
        }
    )
    assert pf.status == PolicyFindingStatus.MISSING
    assert pf.rule == "Data must be encrypted at rest."
    assert pf.evidence is None


# ---------------------------------------------------------------------------
# Phase 3e — Model tests for required `status` field on PolicyFinding
# ---------------------------------------------------------------------------


def test_policy_finding_requires_status() -> None:
    """PolicyFinding raises ValidationError if status is omitted."""
    with pytest.raises(ValidationError):
        PolicyFinding.model_validate(
            {
                "policy_name": "Test Policy",
                "rule": "Test rule.",
                "finding": "Test finding without status.",
            }
        )


def test_policy_finding_missing_status_is_rejected_even_with_evidence() -> None:
    """PolicyFinding without status raises ValidationError even when evidence is set."""
    with pytest.raises(ValidationError):
        PolicyFinding.model_validate(
            {
                "policy_name": "Test Policy",
                "rule": "Test rule.",
                "finding": "Test finding without status.",
                "evidence": "some evidence",
            }
        )


def test_policy_finding_valid_minimal() -> None:
    """Minimal required fields validate cleanly and optional fields use defaults."""
    pf = PolicyFinding.model_validate(
        {
            "policy_name": "Payment Policy",
            "rule": "Invoices must be paid within 30 days.",
            "status": "match",
            "finding": "Clause 1 specifies payment within 30 days.",
        }
    )
    assert pf.policy_name == "Payment Policy"
    assert pf.rule == "Invoices must be paid within 30 days."
    assert pf.status == PolicyFindingStatus.MATCH
    assert pf.finding == "Clause 1 specifies payment within 30 days."
    assert pf.evidence is None
    assert pf.clause_reference is None
    assert pf.severity == Severity.MEDIUM


def test_contract_analysis_has_no_top_level_evidence() -> None:
    """ContractAnalysis must not expose evidence or clause_reference at the top level."""
    fields = set(ContractAnalysis.model_fields.keys())
    assert "evidence" not in fields
    assert "clause_reference" not in fields
    assert fields == {
        "summary",
        "key_terms",
        "risks",
        "policy_findings",
        "recommendations",
    }
