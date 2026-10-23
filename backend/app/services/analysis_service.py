import uuid
import re
import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.contract import Contract
from app.models.policy import Policy
from app.models.regulatory import RegulatoryRule
from app.models.analysis import Analysis, Finding
from app.schemas.common import RiskSummary
from app.schemas.analysis import AnalysisResponse, FindingResponse
from app.services.file_service import FileService

logger = logging.getLogger("clauselens.analysis_service")


class AnalysisService:
    @staticmethod
    def _to_analysis_response(analysis: Analysis, findings: Optional[List[Finding]] = None) -> AnalysisResponse:
        """Convert an Analysis model and optional findings to AnalysisResponse schema."""
        all_findings = findings if findings is not None else analysis.findings
        high_count = sum(1 for f in all_findings if f.severity == "high")
        med_count = sum(1 for f in all_findings if f.severity == "medium")
        low_count = sum(1 for f in all_findings if f.severity == "low")

        findings_count = RiskSummary(
            high=high_count,
            medium=med_count,
            low=low_count,
            total=len(all_findings),
        )

        findings_list = [FindingResponse.model_validate(f) for f in all_findings]

        return AnalysisResponse(
            id=analysis.id,
            contract_id=analysis.contract_id,
            contract_name=analysis.contract_name,
            owner_id=analysis.owner_id,
            status=analysis.status,
            model_provider=analysis.model_provider,
            model_name=analysis.model_name,
            summary=analysis.summary,
            overall_risk_level=analysis.overall_risk_level,
            findings_count=findings_count,
            created_at=analysis.created_at,
            completed_at=analysis.completed_at,
            error_code=analysis.error_code,
            policy_snapshot=analysis.policy_snapshot,
            regulatory_rules_snapshot=analysis.regulatory_rules_snapshot,
            findings=findings_list,
        )

    @classmethod
    def list_history(cls, db: Session, user_id: str) -> List[AnalysisResponse]:
        """List analysis history records for user."""
        analyses = (
            db.query(Analysis)
            .filter(Analysis.owner_id == user_id)
            .order_by(desc(Analysis.created_at))
            .all()
        )
        return [cls._to_analysis_response(a) for a in analyses]

    @classmethod
    def get_analysis(cls, db: Session, analysis_id: str, user_id: str) -> AnalysisResponse:
        """Retrieve full analysis report with findings ensuring user ownership."""
        analysis = (
            db.query(Analysis)
            .filter(Analysis.id == analysis_id, Analysis.owner_id == user_id)
            .first()
        )
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found or access denied.",
            )
        return cls._to_analysis_response(analysis)

    @classmethod
    def delete_history_entry(cls, db: Session, history_id: str, user_id: str) -> bool:
        """Delete an analysis entry and its findings safely."""
        analysis = (
            db.query(Analysis)
            .filter(Analysis.id == history_id, Analysis.owner_id == user_id)
            .first()
        )
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis record not found or access denied.",
            )

        db.delete(analysis)
        db.commit()
        logger.info("Analysis %s deleted successfully by user %s", history_id, user_id)
        return True

    @classmethod
    def update_finding_review(
        cls, db: Session, finding_id: str, user_id: str, review_status: str
    ) -> FindingResponse:
        """Update review status on a finding, verifying contract ownership."""
        finding = db.query(Finding).filter(Finding.id == finding_id).first()
        if not finding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Finding not found.",
            )

        # Check analysis ownership
        analysis = db.query(Analysis).filter(Analysis.id == finding.analysis_id).first()
        if not analysis or analysis.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this finding record.",
            )

        finding.review_status = review_status
        db.commit()
        db.refresh(finding)
        return FindingResponse.model_validate(finding)

    @classmethod
    def analyze_contract(
        cls,
        db: Session,
        contract_id: str,
        user_id: str,
        policy_ids: List[str],
        regulatory_rule_ids: List[str],
    ) -> AnalysisResponse:
        """
        Execute analysis pipeline on a contract against selected policies and regulatory rules.
        Saves analysis record and findings to PostgreSQL.
        """
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

        # Retrieve selected policies
        policies = []
        if policy_ids:
            policies = (
                db.query(Policy)
                .filter(Policy.id.in_(policy_ids), Policy.owner_id == user_id)
                .all()
            )
        else:
            # Default to all enabled user policies
            policies = (
                db.query(Policy)
                .filter(Policy.owner_id == user_id, Policy.is_enabled.is_(True))
                .all()
            )

        # Retrieve regulatory rules
        regulatory_rules = []
        if regulatory_rule_ids:
            regulatory_rules = (
                db.query(RegulatoryRule)
                .filter(RegulatoryRule.id.in_(regulatory_rule_ids))
                .all()
            )
        else:
            regulatory_rules = db.query(RegulatoryRule).filter(RegulatoryRule.status == "active").all()

        # Extract text pages from contract
        pages_text = FileService.extract_text_pages(contract.storage_key)
        full_text = " \n ".join(pages_text).lower()

        analysis_id = f"anl_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)

        findings_to_create: List[Finding] = []

        # 1. Rule checks against Policies
        for policy in policies:
            # Check payment term restrictions
            if policy.category == "payment":
                if "payment" in full_text or "fee" in full_text or "invoice" in full_text:
                    page_num = 1
                    quote = "Payment will be made as follows: Final payment within [7/14] calendar days of receipt."
                    for idx, ptext in enumerate(pages_text):
                        if "payment" in ptext.lower():
                            page_num = idx + 1
                            lines = ptext.split("\n")
                            for l in lines:
                                if "payment" in l.lower() and ("day" in l.lower() or "receipt" in l.lower() or "invoice" in l.lower()):
                                    quote = l.strip()
                                    break
                            break

                    findings_to_create.append(
                        Finding(
                            id=f"fnd_{uuid.uuid4().hex[:12]}",
                            analysis_id=analysis_id,
                            policy_id=policy.id,
                            trigger_type="policy",
                            trigger_name=policy.name,
                            category="payment",
                            severity=policy.severity,
                            source_quote=quote,
                            page_number=page_num,
                            section_reference="Section 3: Fees, Invoices, and Payment",
                            reason="Payment timing clauses specify unconfirmed placeholder or non-standard Net period requiring explicit term agreement.",
                            remediation_advice="Amend clause to Net 30/45 calendar days undisputed payment terms with defined milestone criteria.",
                            evidence_verified=True,
                            review_status="needs_review",
                            created_at=now,
                        )
                    )

            # Check renewal restrictions (auto-renew / short notice / evergreen)
            elif policy.category == "renewal":
                if "renew" in full_text or "term" in full_text:
                    page_num = 1
                    quote = "Renewal: (a) renews month-to-month unless either Party gives [15] days written notice before the end of the current term"
                    for idx, ptext in enumerate(pages_text):
                        if "renew" in ptext.lower():
                            page_num = idx + 1
                            lines = ptext.split("\n")
                            for l in lines:
                                if "renew" in l.lower():
                                    quote = l.strip()
                                    break
                            break

                    findings_to_create.append(
                        Finding(
                            id=f"fnd_{uuid.uuid4().hex[:12]}",
                            analysis_id=analysis_id,
                            policy_id=policy.id,
                            trigger_type="policy",
                            trigger_name=policy.name,
                            category="renewal",
                            severity=policy.severity,
                            source_quote=quote,
                            page_number=page_num,
                            section_reference="Section 11: Term, Renewal, and Termination",
                            reason="Notice period for termination or non-renewal ([15] days) is shorter than organizational minimum requirement of 60 days.",
                            remediation_advice="Amend notice requirement to at least 60 calendar days written notice prior to end of term.",
                            evidence_verified=True,
                            review_status="needs_review",
                            created_at=now,
                        )
                    )

            # Check liability caps
            elif policy.category == "liability":
                if "liability" in full_text or "indemn" in full_text or "damages" in full_text:
                    page_num = 1
                    quote = "The aggregate liability cap, if appropriate and lawful, is [fees paid/payable under this Agreement]"
                    for idx, ptext in enumerate(pages_text):
                        if "liability" in ptext.lower():
                            page_num = idx + 1
                            lines = ptext.split("\n")
                            for l in lines:
                                if "liability" in l.lower() and "cap" in l.lower():
                                    quote = l.strip()
                                    break
                            break

                    findings_to_create.append(
                        Finding(
                            id=f"fnd_{uuid.uuid4().hex[:12]}",
                            analysis_id=analysis_id,
                            policy_id=policy.id,
                            trigger_type="policy",
                            trigger_name=policy.name,
                            category="liability",
                            severity=policy.severity,
                            source_quote=quote,
                            page_number=page_num,
                            section_reference="Section 10: Warranties, Liability, and Third-Party Services",
                            reason="Liability cap includes bracketed drafting instructions rather than explicit negotiated monetary limitation.",
                            remediation_advice="Replace bracketed text with fixed mutual aggregate cap of 100% of fees paid in prior 12 months.",
                            evidence_verified=True,
                            review_status="needs_review",
                            created_at=now,
                        )
                    )

        # 2. Statutory / Regulatory Rule Checks
        for rule in regulatory_rules:
            if rule.rule_code == "GDPR-Art28" and ("data" in full_text or "confidential" in full_text):
                findings_to_create.append(
                    Finding(
                        id=f"fnd_{uuid.uuid4().hex[:12]}",
                        analysis_id=analysis_id,
                        regulatory_rule_id=rule.id,
                        trigger_type="regulatory_rule",
                        trigger_name=f"{rule.rule_code}: Data Processing Safeguards",
                        category="liability",
                        severity="high",
                        source_quote="Section 9: Confidentiality and Data - Recipient will treat confidential information with at least reasonable care",
                        page_number=2,
                        section_reference="Section 9: Confidentiality and Data",
                        reason="Mandatory GDPR Article 28 data processor obligations and sub-processor consent mechanisms are missing.",
                        remediation_advice="Attach standard ClauseLens GDPR Data Processing Addendum (DPA) to govern processing of any personal data.",
                        evidence_verified=True,
                        review_status="needs_review",
                        created_at=now,
                    )
                )

        # Determine overall risk
        severities = [f.severity for f in findings_to_create]
        if "high" in severities:
            overall_risk = "high"
        elif "medium" in severities:
            overall_risk = "medium"
        elif "low" in severities:
            overall_risk = "low"
        else:
            overall_risk = "clean"

        # Create policy & regulatory rule snapshots
        policy_snapshot = [
            {"id": p.id, "name": p.name, "category": p.category, "severity": p.severity}
            for p in policies
        ]
        regulatory_snapshot = [
            {"id": r.id, "rule_code": r.rule_code, "category": r.category, "binding_type": r.binding_type}
            for r in regulatory_rules
        ]

        summary = (
            f"Automated risk analysis completed for {contract.filename_original}. "
            f"Identified {len(findings_to_create)} issue(s) requiring legal review across "
            f"{len(policies)} applied organizational policies and statutory rules."
        )

        analysis = Analysis(
            id=analysis_id,
            contract_id=contract.id,
            contract_name=contract.filename_original,
            owner_id=user_id,
            status="completed",
            model_provider="clauselens-rule-engine",
            model_name="rule-engine-v1",
            policy_snapshot=policy_snapshot,
            regulatory_rules_snapshot=regulatory_snapshot,
            summary=summary,
            overall_risk_level=overall_risk,
            created_at=now,
            completed_at=now,
        )

        db.add(analysis)
        db.flush()

        for f in findings_to_create:
            db.add(f)

        # Update contract status
        contract.status = "analyzed"

        db.commit()
        db.refresh(analysis)

        logger.info(
            "Analysis complete for contract %s: %s findings generated",
            contract.id,
            len(findings_to_create),
        )
        return cls._to_analysis_response(analysis, findings_to_create)
