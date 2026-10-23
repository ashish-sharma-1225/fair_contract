import os
import json
from typing import Dict, List, Optional
from pathlib import Path
from app.config import DATA_STORAGE_DIR
from app.schemas import (
    Contract, Policy, RegulatoryRule, RegulatorySource,
    Analysis, Finding, ContractExtraction, ReviewStatus
)

STORE_FILE = Path(DATA_STORAGE_DIR) / "store.json"

class MemoryDatabase:
    def __init__(self):
        self.contracts: Dict[str, Contract] = {}
        self.extractions: Dict[str, ContractExtraction] = {}
        self.policies: Dict[str, Policy] = {}
        self.regulatory_rules: Dict[str, RegulatoryRule] = {}
        self.analyses: Dict[str, Analysis] = {}
        self._load()

    def _load(self):
        if STORE_FILE.exists():
            try:
                with open(STORE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.contracts = {k: Contract(**v) for k, v in data.get("contracts", {}).items()}
                    self.extractions = {k: ContractExtraction(**v) for k, v in data.get("extractions", {}).items()}
                    self.policies = {k: Policy(**v) for k, v in data.get("policies", {}).items()}
                    self.regulatory_rules = {k: RegulatoryRule(**v) for k, v in data.get("regulatory_rules", {}).items()}
                    self.analyses = {k: Analysis(**v) for k, v in data.get("analyses", {}).items()}
                    return
            except Exception as e:
                print(f"Error loading store.json: {e}")

        # Seed initial default data
        self._seed_defaults()
        self.save()

    def _seed_defaults(self):
        # Default Regulatory Sources
        src_uk = RegulatorySource(
            id="src_uk_latepay",
            title="Late Payment of Commercial Debts (Interest) Act 1998",
            jurisdiction="United Kingdom (England & Wales)",
            publisher="UK Department for Business and Trade",
            official_url="https://www.legislation.gov.uk/ukpga/1998/20/contents",
            effective_date="1998-11-01",
            last_verified_at="2026-01-15",
        )
        src_eu = RegulatorySource(
            id="src_eu_uctd",
            title="Directive 93/13/EEC on Unfair Terms in Consumer and Commercial Contracts",
            jurisdiction="European Union",
            publisher="Official Journal of the European Communities",
            official_url="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A31993L0013",
            effective_date="1993-04-05",
            last_verified_at="2026-02-10",
        )
        src_us = RegulatorySource(
            id="src_us_ucc_2302",
            title="Uniform Commercial Code (UCC) § 2-302: Unconscionable Contract or Clause",
            jurisdiction="United States (Model Act)",
            publisher="Uniform Law Commission / American Law Institute",
            official_url="https://www.law.cornell.edu/ucc/2/2-302",
            effective_date="2003-01-01",
            last_verified_at="2026-01-20",
        )

        # Default Regulatory Rules
        r1 = RegulatoryRule(
            id="reg_uk_30day_payment",
            source_id=src_uk.id,
            source=src_uk,
            rule_code="REG-UK-LPCD-30D",
            category="payment",
            rule_text="Payment terms between commercial entities must not exceed 60 days unless expressly agreed and not grossly unfair; default statutory entitlement requires payment within 30 days of invoice receipt.",
            applicability_notes="Statutory baseline for B2B supplier transactions in UK jurisdiction.",
            binding_type="binding_law",
            version="2024.1",
            status="active",
            is_selected=True,
        )
        r2 = RegulatoryRule(
            id="reg_eu_autorenewal_notice",
            source_id=src_eu.id,
            source=src_eu,
            rule_code="REG-EU-UCTD-AR60",
            category="renewal",
            rule_text="Clauses providing for automatic contract extension where the customer is not given adequate advance notification or reasonable termination window are deemed potentially unfair and unenforceable.",
            applicability_notes="Applies to recurring service agreements and rolling retainer commitments.",
            binding_type="binding_law",
            version="2023.2",
            status="active",
            is_selected=True,
        )
        r3 = RegulatoryRule(
            id="reg_us_ucc_unconscionable_indemnity",
            source_id=src_us.id,
            source=src_us,
            rule_code="REG-US-UCC-INDEMNITY",
            category="liability",
            rule_text="Unilateral indemnity clauses requiring a vendor or freelancer to indemnify the enterprise for the enterprise's own negligence or unlimited third-party damages are subject to unconscionability challenge.",
            applicability_notes="Persuasive standard across state commercial law governing contractor risk allocation.",
            binding_type="official_guidance",
            version="2022.4",
            status="active",
            is_selected=False,
        )
        self.regulatory_rules = {r1.id: r1, r2.id: r2, r3.id: r3}

        # Default Policies
        p1 = Policy(
            id="pol_net_30",
            name="Maximum Net-30 Payment Window",
            category="payment",
            rule_text="Flag any clause that requires payment terms exceeding 30 calendar days from invoice submission, or conditions payment upon third-party customer approval.",
            rule_config={"max_payment_days": 30},
            severity="high",
            is_enabled=True,
            created_at="2026-01-10T10:00:00Z",
            updated_at="2026-02-01T14:30:00Z"
        )
        p2 = Policy(
            id="pol_auto_renewal_60d",
            name="60-Day Notice for Automatic Renewal",
            category="renewal",
            rule_text="Flag any automatic renewal clause that binds the vendor for an additional term unless cancellation notice is required more than 60 days in advance.",
            rule_config={"min_cancellation_notice_days": 60},
            severity="high",
            is_enabled=True,
            created_at="2026-01-12T11:20:00Z",
            updated_at="2026-01-12T11:20:00Z"
        )
        p3 = Policy(
            id="pol_liability_cap",
            name="Liability Cap at 100% of Fees Paid",
            category="liability",
            rule_text="Flag contracts with unlimited contractor liability or liability caps that exceed 100% of total fees paid to the contractor.",
            rule_config={"liability_cap_percent": 100},
            severity="high",
            is_enabled=True,
            created_at="2026-01-15T09:15:00Z",
            updated_at="2026-01-20T16:00:00Z"
        )
        p4 = Policy(
            id="pol_local_jurisdiction",
            name="Preferred Domestic Jurisdiction",
            category="jurisdiction",
            rule_text="Flag governing law or dispute resolution clauses specifying offshore, foreign, or distant arbitral venues that impose disproportionate legal expense.",
            rule_config={"preferred_jurisdiction": "New York, USA or London, UK"},
            severity="medium",
            is_enabled=True,
            created_at="2026-01-18T13:45:00Z",
            updated_at="2026-01-18T13:45:00Z"
        )
        self.policies = {p1.id: p1, p2.id: p2, p3.id: p3, p4.id: p4}

    def save(self):
        try:
            with open(STORE_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "contracts": {k: v.model_dump() for k, v in self.contracts.items()},
                    "extractions": {k: v.model_dump() for k, v in self.extractions.items()},
                    "policies": {k: v.model_dump() for k, v in self.policies.items()},
                    "regulatory_rules": {k: v.model_dump() for k, v in self.regulatory_rules.items()},
                    "analyses": {k: v.model_dump() for k, v in self.analyses.items()},
                }, f, indent=2)
        except Exception as e:
            print(f"Error saving store.json: {e}")

db = MemoryDatabase()
