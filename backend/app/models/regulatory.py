from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class RegulatorySource(Base):
    """Authoritative legal and regulatory reference source."""

    __tablename__ = "regulatory_sources"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    jurisdiction = Column(String(100), nullable=False)
    publisher = Column(String(255), nullable=False)
    official_url = Column(String(512), nullable=False)
    effective_date = Column(String(64), nullable=False)
    last_verified_at = Column(String(64), nullable=False)

    # Relationships
    rules = relationship("RegulatoryRule", back_populates="source", cascade="all, delete-orphan")


class RegulatoryRule(Base):
    """Specific statutory check or standard clause requirement."""

    __tablename__ = "regulatory_rules"

    id = Column(String(64), primary_key=True, index=True)
    source_id = Column(String(64), ForeignKey("regulatory_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_code = Column(String(64), nullable=False)
    category = Column(String(64), nullable=False)
    rule_text = Column(Text, nullable=False)
    applicability_notes = Column(Text, nullable=False)
    binding_type = Column(String(64), nullable=False, default="binding_law")
    version = Column(String(32), nullable=False, default="2024.1")
    status = Column(String(32), nullable=False, default="active")

    # Relationships
    source = relationship("RegulatorySource", back_populates="rules")
