from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Analysis(Base):
    """Analysis execution record for a contract."""

    __tablename__ = "analyses"

    id = Column(String(64), primary_key=True, index=True)
    contract_id = Column(String(64), ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    contract_name = Column(String(255), nullable=False)
    owner_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="completed")
    model_provider = Column(String(64), nullable=False, default="gemini-flash")
    model_name = Column(String(64), nullable=False, default="gemini-2.5-pro")
    policy_snapshot = Column(JSON, nullable=True)
    regulatory_rules_snapshot = Column(JSON, nullable=True)
    summary = Column(Text, nullable=False, default="")
    overall_risk_level = Column(String(32), nullable=False, default="low")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_code = Column(String(64), nullable=True)

    # Relationships
    contract = relationship("Contract", back_populates="analyses")
    owner = relationship("User", back_populates="analyses")
    findings = relationship("Finding", back_populates="analysis", cascade="all, delete-orphan", passive_deletes=True)


class Finding(Base):
    """Specific non-compliant or risky clause discovered during contract analysis."""

    __tablename__ = "findings"

    id = Column(String(64), primary_key=True, index=True)
    analysis_id = Column(String(64), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    policy_id = Column(String(64), nullable=True)
    regulatory_rule_id = Column(String(64), nullable=True)
    trigger_type = Column(String(64), nullable=False, default="policy")
    trigger_name = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False, default="other")
    severity = Column(String(32), nullable=False, default="medium")
    source_quote = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=False, default=1)
    section_reference = Column(String(255), nullable=True)
    reason = Column(Text, nullable=False)
    remediation_advice = Column(Text, nullable=False)
    evidence_verified = Column(Boolean, nullable=False, default=True)
    review_status = Column(String(32), nullable=False, default="needs_review")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    analysis = relationship("Analysis", back_populates="findings")
