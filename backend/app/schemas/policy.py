from datetime import datetime
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field


ClauseCategory = Literal["payment", "renewal", "liability", "jurisdiction", "other"]
RiskSeverity = Literal["high", "medium", "low"]


class PolicyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    category: ClauseCategory = "other"
    rule_text: str = Field(..., min_length=3)
    rule_config: Optional[Dict[str, Any]] = None
    severity: RiskSeverity = "medium"
    is_enabled: bool = True


class PolicyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    category: Optional[ClauseCategory] = None
    rule_text: Optional[str] = Field(None, min_length=3)
    rule_config: Optional[Dict[str, Any]] = None
    severity: Optional[RiskSeverity] = None
    is_enabled: Optional[bool] = None


class PolicyResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    category: str
    rule_text: str
    rule_config: Optional[Dict[str, Any]] = None
    severity: str
    is_enabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
