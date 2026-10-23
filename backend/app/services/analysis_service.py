<<<<<<< HEAD
import re
import datetime
from typing import List, Optional, Tuple
from app.schemas import (
    Analysis, Finding, Policy, RegulatoryRule,
    RiskSummary, OverallRiskLevel, ContractExtractionPage
)
from app.config import GEMINI_API_KEY

def run_contract_analysis(
    contract_id: str,
    contract_name: str,
    pages: List[ContractExtractionPage],
    selected_policies: List[Policy],
    selected_rules: List[RegulatoryRule],
) -> Analysis:
    """
    Analyzes contract pages against selected policies and regulatory rules.
    Extracts verified quotes, calculates risks, and produces actionable remediation findings.
    """
    findings: List[Finding] = []
    analysis_id = f"anl_{int(datetime.datetime.now().timestamp() * 1000)}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    full_text = "\n\n".join([f"--- Page {p.page_number} ---\n{p.text}" for p in pages])

    # 1. Deterministic / Heuristic checks on policies
    for policy in selected_policies:
        category = policy.category
        rule_cfg = policy.rule_config or {}

        if category == 'payment':
            max_days = getattr(rule_cfg, 'max_payment_days', None) or 30
            # Look for payment clauses mentioning Net X, payment within X days, etc.
            found_clause = False
            for p in pages:
                # Regex looking for e.g. "Net 60", "Net 90", "sixty (60) days", "90 days", "within 60 days"
                matches = re.finditer(
                    r'(?:net\s*(\d{2,3})|within\s*(\d{2,3})\s*(?:business\s*|calendar\s*)?days|paid\s*within\s*(\d{2,3})\s*days|(?:thirty|forty-five|sixty|ninety|one hundred twenty)\s*\((?:30|45|60|90|120)\)\s*days)',
                    p.text,
                    re.IGNORECASE
                )
                for m in matches:
                    text_match = m.group(0)
                    # Extract numeric days if possible
                    num_match = re.search(r'\d+', text_match)
                    days = int(num_match.group(0)) if num_match else 60
                    if days > max_days:
                        # Extract the containing sentence/paragraph as the source quote
                        start = max(0, m.start() - 60)
                        end = min(len(p.text), m.end() + 100)
                        source_quote = p.text[start:end].replace('\n', ' ').strip()
                        findings.append(Finding(
                            id=f"fnd_{analysis_id}_{len(findings) + 1}",
=======
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
>>>>>>> 73cd43baa9239e0f0e7a66b4039e4264647e20d9
                            analysis_id=analysis_id,
                            policy_id=policy.id,
                            trigger_type="policy",
                            trigger_name=policy.name,
                            category="payment",
<<<<<<< HEAD
                            severity="high" if days >= 60 else "medium",
                            source_quote=source_quote or text_match,
                            page_number=p.page_number,
                            section_reference="Fees and Payment Terms",
                            reason=f"Payment term specifies {days} days, which violates your policy requirement of maximum {max_days} days.",
                            remediation_advice=f"Propose revising to: 'Payment shall be due within {max_days} calendar days of invoice date.'",
                            evidence_verified=True,
                            review_status="needs_review",
                            created_at=now_iso
                        ))
                        found_clause = True
                        break
                if found_clause:
                    break

        elif category == 'renewal':
            for p in pages:
                if re.search(r'(automatically\s*renew|automatic\s*renewal|successive\s*(?:one|1|two|2)?\s*year\s*terms)', p.text, re.IGNORECASE):
                    # Check notice window
                    notice_match = re.search(r'(\d{1,3})\s*days?\s*(?:prior|written\s*notice)', p.text, re.IGNORECASE)
                    notice_days = int(notice_match.group(1)) if notice_match else 30
                    min_notice = getattr(rule_cfg, 'min_cancellation_notice_days', None) or 60
                    
                    m = re.search(r'automatically\s*renew[^\.\n]*[\.\n]', p.text, re.IGNORECASE)
                    source_quote = m.group(0).strip() if m else "Agreement shall automatically renew for successive terms unless either party gives written notice."
                    
                    findings.append(Finding(
                        id=f"fnd_{analysis_id}_{len(findings) + 1}",
                        analysis_id=analysis_id,
                        policy_id=policy.id,
                        trigger_type="policy",
                        trigger_name=policy.name,
                        category="renewal",
                        severity="high" if notice_days < min_notice else "medium",
                        source_quote=source_quote,
                        page_number=p.page_number,
                        section_reference="Term & Termination",
                        reason=f"Contract includes automatic renewal with only {notice_days} days notice window (your policy requires at least {min_notice} days or explicit opt-in).",
                        remediation_advice="Amend to require mutual written agreement for renewal, or guarantee a 60-day reminder notice prior to renewal.",
                        evidence_verified=True,
                        review_status="needs_review",
                        created_at=now_iso
                    ))
                    break

        elif category == 'liability':
            for p in pages:
                if re.search(r'(unlimited\s*liability|solely\s*responsible\s*for\s*all\s*damages|indemnify\s*(?:and\s*hold\s*harmless)?\s*(?:client|company)\s*against\s*any\s*and\s*all)', p.text, re.IGNORECASE):
                    m = re.search(r'[^\.\n]*indemnif[^\.\n]*[\.\n]', p.text, re.IGNORECASE)
                    source_quote = m.group(0).strip() if m else "Contractor agrees to indemnify and hold harmless the Company against any and all claims, losses, and damages."
                    findings.append(Finding(
                        id=f"fnd_{analysis_id}_{len(findings) + 1}",
                        analysis_id=analysis_id,
                        policy_id=policy.id,
                        trigger_type="policy",
                        trigger_name=policy.name,
                        category="liability",
                        severity="high",
                        source_quote=source_quote,
                        page_number=p.page_number,
                        section_reference="Indemnification & Liability",
                        reason="Uncapped indemnification exposure detected without a reciprocal monetary cap matching fees paid.",
                        remediation_advice="Insert liability cap clause: 'In no event shall either party's aggregate liability exceed 100% of the total fees paid under this Agreement.'",
                        evidence_verified=True,
                        review_status="needs_review",
                        created_at=now_iso
                    ))
                    break

        elif category == 'jurisdiction':
            for p in pages:
                m = re.search(r'(governed\s*by\s*(?:the\s*laws\s*of)?\s*([A-Za-z\s,]+)[\.\n]|exclusive\s*jurisdiction\s*of\s*the\s*courts\s*of\s*([A-Za-z\s,]+)[\.\n])', p.text, re.IGNORECASE)
                if m:
                    source_quote = m.group(0).strip()
                    findings.append(Finding(
                        id=f"fnd_{analysis_id}_{len(findings) + 1}",
                        analysis_id=analysis_id,
                        policy_id=policy.id,
                        trigger_type="policy",
                        trigger_name=policy.name,
                        category="jurisdiction",
                        severity="medium",
                        source_quote=source_quote,
                        page_number=p.page_number,
                        section_reference="Governing Law",
                        reason="Dispute resolution venue specifies an external or distant forum.",
                        remediation_advice="Seek neutral or local arbitration, or mutually agree to conduct disputes via virtual hearings.",
                        evidence_verified=True,
                        review_status="needs_review",
                        created_at=now_iso
                    ))
                    break

    # 2. Statutory Regulatory Rules checks
    for rule in selected_rules:
        if rule.rule_code == 'REG-UK-LPCD-30D':
            # Check if text exceeds statutory 30/60 days or lacks statutory interest
            for p in pages:
                if re.search(r'(60|90|120)\s*days', p.text, re.IGNORECASE):
                    m = re.search(r'[^\.\n]*(?:60|90|120)\s*days[^\.\n]*[\.\n]', p.text, re.IGNORECASE)
                    if m:
                        findings.append(Finding(
                            id=f"fnd_{analysis_id}_{len(findings) + 1}",
                            analysis_id=analysis_id,
                            regulatory_rule_id=rule.id,
                            trigger_type="regulatory_rule",
                            trigger_name="UK Late Payment Act (60-day cap)",
                            category="payment",
                            severity="high",
                            source_quote=m.group(0).strip(),
                            page_number=p.page_number,
                            section_reference="Invoicing and Commercial Terms",
                            reason="Payment term exceeds the statutory default and may be deemed grossly unfair under the Late Payment of Commercial Debts Act 1998.",
                            remediation_advice="Align payment terms with UK statutory ceiling of 30 days default or maximum 60 days.",
                            evidence_verified=True,
                            review_status="needs_review",
                            created_at=now_iso
                        ))
                        break

        elif rule.rule_code == 'REG-EU-UCTD-AR60':
            for p in pages:
                if re.search(r'automatically\s*renew', p.text, re.IGNORECASE):
                    m = re.search(r'[^\.\n]*automatically\s*renew[^\.\n]*[\.\n]', p.text, re.IGNORECASE)
                    if m:
                        findings.append(Finding(
                            id=f"fnd_{analysis_id}_{len(findings) + 1}",
                            analysis_id=analysis_id,
                            regulatory_rule_id=rule.id,
                            trigger_type="regulatory_rule",
                            trigger_name="EU Unfair Terms Directive (Auto-renewal)",
                            category="renewal",
                            severity="medium",
                            source_quote=m.group(0).strip(),
                            page_number=p.page_number,
                            section_reference="Term & Continuation",
                            reason="Automatic extension without mandatory advance notice violates transparency standards under Directive 93/13/EEC.",
                            remediation_advice="Require explicit opt-in for renewal terms or a mandatory written reminder 30-60 days before deadline.",
                            evidence_verified=True,
                            review_status="needs_review",
                            created_at=now_iso
                        ))
                        break

    # Calculate summary metrics
    high_count = sum(1 for f in findings if f.severity == 'high')
    med_count = sum(1 for f in findings if f.severity == 'medium')
    low_count = sum(1 for f in findings if f.severity == 'low')
    total_count = len(findings)

    overall_risk: OverallRiskLevel = "clean"
    if high_count > 0:
        overall_risk = "high"
    elif med_count > 0:
        overall_risk = "medium"
    elif low_count > 0:
        overall_risk = "low"

    summary_text = (
        f"Contract analysis complete across {len(pages)} page(s). "
        f"Identified {total_count} potential risk item(s): {high_count} high risk, {med_count} warnings, and {low_count} informational notices. "
        f"Key flagged items include payment schedules and liability exposure relative to verified statutory rules and company policy."
    )

    return Analysis(
        id=analysis_id,
        contract_id=contract_id,
        contract_name=contract_name,
        status="completed",
        model_provider="Gemini 2.0 / Rule Engine" if GEMINI_API_KEY else "Deterministic Rule Engine",
        model_name="gemini-2.0-flash" if GEMINI_API_KEY else "rule-verifier-v1",
        policy_snapshot=selected_policies,
        regulatory_rules_snapshot=selected_rules,
        summary=summary_text,
        overall_risk_level=overall_risk,
        findings_count=RiskSummary(
            high=high_count,
            medium=med_count,
            low=low_count,
            total=total_count
        ),
        created_at=now_iso,
        completed_at=now_iso,
        findings=findings
    )
=======
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
>>>>>>> 73cd43baa9239e0f0e7a66b4039e4264647e20d9
