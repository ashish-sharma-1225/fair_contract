from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.common import RiskSummary


class ContractBase(BaseModel):
    filename_original: str
    mime_type: str = "application/pdf"
    size_bytes: int
    page_count: int = 1
    status: str = "uploaded"


class ContractResponse(ContractBase):
    id: str
    owner_id: str
    storage_key: str
    sha256: str
    uploaded_at: datetime
    deleted_at: Optional[datetime] = None
    latest_analysis_id: Optional[str] = None
    risk_summary: Optional[RiskSummary] = None

    model_config = ConfigDict(from_attributes=True)
