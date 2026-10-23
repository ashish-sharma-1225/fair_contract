from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Contract(Base):
    """Contract metadata and storage tracking entity."""

    __tablename__ = "contracts"

    id = Column(String(64), primary_key=True, index=True)
    owner_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename_original = Column(String(255), nullable=False)
    storage_key = Column(String(512), nullable=False)
    sha256 = Column(String(64), nullable=False, index=True)
    mime_type = Column(String(100), nullable=False, default="application/pdf")
    size_bytes = Column(Integer, nullable=False, default=0)
    page_count = Column(Integer, nullable=False, default=1)
    status = Column(String(32), nullable=False, default="uploaded")
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="contracts")
    analyses = relationship("Analysis", back_populates="contract", cascade="all, delete-orphan", passive_deletes=True)
