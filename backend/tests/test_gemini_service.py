"""
Integration tests for gemini_service.analyse_contract.

These tests call the live Gemini API.  They are SKIPPED (not failed) when
GEMINI_API_KEY is unset — a skip is a PASS for Phase 2 / Phase 3.

Do NOT fabricate a key or work around the skip condition.
"""

from __future__ import annotations

import os

import pytest

# Skip the entire module when the API key is absent.
pytestmark = pytest.mark.skipif(
    not os.getenv("GEMINI_API_KEY"),
    reason="GEMINI_API_KEY is not set — skipping live Gemini tests (counts as PASS for Phase 2)",
)

# ---------------------------------------------------------------------------
# Sample contract — explicit Payment, Termination, Confidentiality, Liability
# sections so the model can reliably tag all four ClauseType values.
# ---------------------------------------------------------------------------

SAMPLE_CONTRACT: str = """
SERVICE AGREEMENT

1. PAYMENT
   The Client shall pay the Service Provider a monthly fee of $5,000,
   due within 30 days of invoice. Late payments accrue interest at 1.5%
   per month.

2. TERMINATION
   Either party may terminate this Agreement by providing 30 days written
   notice. Immediate termination is permitted upon material breach.

3. CONFIDENTIALITY
   Both parties agree to maintain strict confidentiality of all proprietary
   information disclosed during the term of this Agreement and for a period
   of 3 years thereafter. No confidential information may be disclosed to
   third parties without prior written consent.

4. LIABILITY
   The Service Provider's total liability under this Agreement shall not
   exceed $10,000. Neither party shall be liable for indirect, incidental,
   or consequential damages.
""".strip()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_analyse_contract_returns_contract_analysis() -> None:
    """analyse_contract returns a ContractAnalysis instance."""
    # Import here so the module-level key guard only triggers inside the test
    # (the pytestmark skip fires before the import when the key is absent).
    from app.models.contract_analysis import ContractAnalysis
    from app.services.gemini_service import analyse_contract

    result = analyse_contract(SAMPLE_CONTRACT)

    assert isinstance(result, ContractAnalysis), (
        f"Expected ContractAnalysis, got {type(result).__name__}"
    )


def test_analyse_contract_summary_non_empty() -> None:
    """analyse_contract populates a non-empty summary string."""
    from app.services.gemini_service import analyse_contract

    result = analyse_contract(SAMPLE_CONTRACT)

    assert isinstance(result.summary, str) and result.summary.strip(), (
        "summary must be a non-empty string"
    )


def test_analyse_contract_key_terms_cover_required_clause_types() -> None:
    """key_terms must include payment, termination, confidentiality, and liability."""
    from app.models.contract_analysis import ClauseType
    from app.services.gemini_service import analyse_contract

    result = analyse_contract(SAMPLE_CONTRACT)

    found_types = {term.clause_type for term in result.key_terms}
    required_types = {
        ClauseType.PAYMENT,
        ClauseType.TERMINATION,
        ClauseType.CONFIDENTIALITY,
        ClauseType.LIABILITY,
    }

    missing = required_types - found_types
    assert not missing, (
        f"key_terms is missing clause_type values: {[t.value for t in missing]}"
    )


# ---------------------------------------------------------------------------
# Phase 3 — Policy tests (live API, skip-guarded)
# ---------------------------------------------------------------------------

# One policy with two rules: the contract satisfies the first, does not
# address the second — so we expect both "match"/"conflict" and "missing".
SAMPLE_POLICIES: list[dict] = [
    {
        "name": "Payment Policy",
        "rules": [
            "Invoices must be paid within 30 days.",   # contract satisfies this
            "Payments must be made in USD only.",       # contract does not address this
        ],
    }
]


def test_analyse_contract_with_policies_findings_are_from_supplied_set() -> None:
    """Every policy_finding must have policy_name and rule in the supplied set."""
    from app.services.gemini_service import analyse_contract

    result = analyse_contract(SAMPLE_CONTRACT, policies=SAMPLE_POLICIES)

    supplied_names = {p["name"] for p in SAMPLE_POLICIES}
    supplied_rules = {rule for p in SAMPLE_POLICIES for rule in p["rules"]}
    for pf in result.policy_findings:
        assert pf.policy_name in supplied_names, (
            f"Gemini returned finding for unsupplied policy: {pf.policy_name!r}"
        )
        assert pf.rule in supplied_rules, (
            f"Gemini returned finding for unsupplied rule: {pf.rule!r}"
        )


def test_analyse_contract_with_policies_has_match_or_conflict() -> None:
    """At least one finding must have status 'match' or 'conflict'."""
    from app.models.contract_analysis import PolicyFindingStatus
    from app.services.gemini_service import analyse_contract

    result = analyse_contract(SAMPLE_CONTRACT, policies=SAMPLE_POLICIES)

    statuses = {pf.status for pf in result.policy_findings}
    assert statuses & {PolicyFindingStatus.MATCH, PolicyFindingStatus.CONFLICT}, (
        "Expected at least one finding with status 'match' or 'conflict'"
    )


def test_analyse_contract_with_policies_has_missing() -> None:
    """At least one finding must have status 'missing'."""
    from app.models.contract_analysis import PolicyFindingStatus
    from app.services.gemini_service import analyse_contract

    result = analyse_contract(SAMPLE_CONTRACT, policies=SAMPLE_POLICIES)

    missing = [pf for pf in result.policy_findings if pf.status == PolicyFindingStatus.MISSING]
    assert missing, "Expected at least one finding with status 'missing'"


def test_analyse_contract_with_policies_missing_evidence_is_none() -> None:
    """Every finding with status='missing' must have evidence=None."""
    from app.models.contract_analysis import PolicyFindingStatus
    from app.services.gemini_service import analyse_contract

    result = analyse_contract(SAMPLE_CONTRACT, policies=SAMPLE_POLICIES)

    for pf in result.policy_findings:
        if pf.status == PolicyFindingStatus.MISSING:
            assert pf.evidence is None, (
                f"Finding with status='missing' must have evidence=None, "
                f"got: {pf.evidence!r}"
            )
