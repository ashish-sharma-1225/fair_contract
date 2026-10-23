from typing import Optional
from pydantic import BaseModel, ConfigDict


class RegulatorySourceResponse(BaseModel):
    id: str
    title: str
    jurisdiction: str
    publisher: str
    official_url: str
    effective_date: str
    last_verified_at: str

    model_config = ConfigDict(from_attributes=True)


class RegulatoryRuleResponse(BaseModel):
    id: str
    source_id: str
    source: Optional[RegulatorySourceResponse] = None
    rule_code: str
    category: str
    rule_text: str
    applicability_notes: str
    binding_type: str
    version: str
    status: str
    is_selected: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)
