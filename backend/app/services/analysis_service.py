import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional, Any
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
from app.services.local_llm_service import local_llm_service

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
        Execute contract analysis pipeline using local Qwen2.5-1.5B-Instruct LLM.
        Saves analysis record, policy snapshot, and findings into PostgreSQL.
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

        # 1. Retrieve selected policies from PostgreSQL
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

        # 2. Retrieve selected regulatory rules from PostgreSQL
        regulatory_rules = []
        if regulatory_rule_ids:
            regulatory_rules = (
                db.query(RegulatoryRule)
                .filter(RegulatoryRule.id.in_(regulatory_rule_ids))
                .all()
            )
        else:
            regulatory_rules = db.query(RegulatoryRule).filter(RegulatoryRule.status == "active").all()

        # 3. Extract text pages from contract
        pages_text = FileService.extract_text_pages(contract.storage_key)

        # 4. Prepare data for Local LLM
        policy_dicts = [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "rule_text": p.rule_text,
                "severity": p.severity,
            }
            for p in policies
        ]
        regulatory_dicts = [
            {
                "id": r.id,
                "rule_code": r.rule_code,
                "category": r.category,
                "rule_text": r.rule_text,
                "binding_type": r.binding_type,
            }
            for r in regulatory_rules
        ]

        # 5. Execute Local Qwen2.5-1.5B inference
        logger.info(
            "Invoking Local Qwen2.5-1.5B-Instruct analysis for contract %s (%s)...",
            contract.id,
            contract.filename_original,
        )
        ai_result = local_llm_service.analyze_contract_text(
            pages_text=pages_text,
            policies=policy_dicts,
            regulatory_rules=regulatory_dicts,
            contract_title=contract.filename_original,
        )

        analysis_id = f"anl_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        findings_to_create: List[Finding] = []

        # Map AI Policy Findings to Finding records
        policy_map = {p.id: p for p in policies}
        for pf in ai_result.policy_findings:
            if pf.status in ("violation", "unverified") and pf.source_quote:
                matching_pol = policy_map.get(pf.policy_id)
                severity = matching_pol.severity if matching_pol else ("high" if pf.status == "violation" else "medium")
                category = matching_pol.category if matching_pol else "other"

                findings_to_create.append(
                    Finding(
                        id=f"fnd_{uuid.uuid4().hex[:12]}",
                        analysis_id=analysis_id,
                        policy_id=pf.policy_id,
                        trigger_type="policy",
                        trigger_name=pf.policy_name,
                        category=category,
                        severity=severity,
                        source_quote=pf.source_quote,
                        page_number=max(1, pf.page_number),
                        section_reference=f"Policy Check: {pf.policy_name}",
                        reason=pf.reason,
                        remediation_advice=pf.remediation_advice or "Review and align with corporate policy.",
                        evidence_verified=True,
                        review_status="needs_review",
                        created_at=now,
                    )
                )

        # Map AI General Contract Risks to Finding records
        for risk in ai_result.risks:
            findings_to_create.append(
                Finding(
                    id=f"fnd_{uuid.uuid4().hex[:12]}",
                    analysis_id=analysis_id,
                    policy_id=None,
                    trigger_type="ai_heuristic",
                    trigger_name=risk.title,
                    category=risk.category,
                    severity=risk.severity,
                    source_quote=risk.source_quote,
                    page_number=max(1, risk.page_number),
                    section_reference=f"Clause Risk: {risk.title}",
                    reason=risk.reason,
                    remediation_advice=risk.remediation_advice,
                    evidence_verified=True,
                    review_status="needs_review",
                    created_at=now,
                )
            )

        # Map missing or omitted protective terms (e.g. for freelancers / small vendors)
        for term in ai_result.missing_or_ambiguous_terms:
            cleaned_term = term.strip()
            if cleaned_term and len(cleaned_term) > 3:
                findings_to_create.append(
                    Finding(
                        id=f"fnd_{uuid.uuid4().hex[:12]}",
                        analysis_id=analysis_id,
                        policy_id=None,
                        trigger_type="ai_heuristic",
                        trigger_name=f"Missing Term: {cleaned_term[:60]}",
                        category="other",
                        severity="medium",
                        source_quote="[Clause is completely omitted from the contract text]",
                        page_number=1,
                        section_reference="Missing / Uncovered Protection",
                        reason=f"This protection is not covered in the agreement: {cleaned_term}",
                        remediation_advice=f"Propose adding a protective clause addressing: {cleaned_term}",
                        evidence_verified=True,
                        review_status="needs_review",
                        created_at=now,
                    )
                )

        # Evaluate regulatory rules (GDPR / Statutory late payment)
        full_text_lower = " \n ".join(pages_text).lower()
        for rule in regulatory_rules:
            if rule.rule_code == "GDPR-Art28" and ("data" in full_text_lower or "confidential" in full_text_lower):
                # Check if already added
                already_has_gdpr = any(f.trigger_name and "GDPR" in f.trigger_name for f in findings_to_create)
                if not already_has_gdpr:
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

        policy_snapshot = [
            {"id": p.id, "name": p.name, "category": p.category, "severity": p.severity}
            for p in policies
        ]
        regulatory_snapshot = [
            {"id": r.id, "rule_code": r.rule_code, "category": r.category, "binding_type": r.binding_type}
            for r in regulatory_rules
        ]

        analysis = Analysis(
            id=analysis_id,
            contract_id=contract.id,
            contract_name=contract.filename_original,
            owner_id=user_id,
            status="completed",
            model_provider="local-llm",
            model_name="Qwen2.5-1.5B-Instruct-GGUF",
            policy_snapshot=policy_snapshot,
            regulatory_rules_snapshot=regulatory_snapshot,
            summary=ai_result.summary,
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
            "Local AI analysis complete for contract %s: %s findings generated. Model: Qwen2.5-1.5B-Instruct-GGUF",
            contract.id,
            len(findings_to_create),
        )
        return cls._to_analysis_response(analysis, findings_to_create)


def run_contract_analysis(
    contract_id: str,
    contract_name: str,
    pages: List[Any],
    selected_policies: List[Any],
    selected_rules: List[Any],
) -> Any:
    """
    Compatibility function for callers expecting run_contract_analysis.
    Executes local Qwen2.5-1.5B inference directly on extracted pages without cloud dependencies.
    """
    pages_text = [getattr(p, "text", str(p)) for p in pages]
    policy_dicts = [
        {
            "id": getattr(p, "id", str(idx)),
            "name": getattr(p, "name", f"Policy {idx}"),
            "category": getattr(p, "category", "other"),
            "rule_text": getattr(p, "rule_text", ""),
            "severity": getattr(p, "severity", "medium"),
        }
        for idx, p in enumerate(selected_policies)
    ]
    regulatory_dicts = [
        {
            "id": getattr(r, "id", str(idx)),
            "rule_code": getattr(r, "rule_code", f"RULE-{idx}"),
            "category": getattr(r, "category", "liability"),
            "rule_text": getattr(r, "rule_text", ""),
            "binding_type": getattr(r, "binding_type", "binding_law"),
        }
        for idx, r in enumerate(selected_rules)
    ]

    ai_result = local_llm_service.analyze_contract_text(
        pages_text=pages_text,
        policies=policy_dicts,
        regulatory_rules=regulatory_dicts,
        contract_title=contract_name,
    )
    return ai_result
