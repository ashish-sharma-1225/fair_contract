from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.regulatory import RegulatoryRule
from app.schemas.regulatory import RegulatoryRuleResponse

router = APIRouter(prefix="/regulatory-rules", tags=["Regulatory Rules"])


@router.get("", response_model=List[RegulatoryRuleResponse], summary="List statutory and regulatory rules")
def list_regulatory_rules(db: Session = Depends(get_db)) -> List[RegulatoryRuleResponse]:
    """List authoritative regulatory and standard contract rules."""
    rules = db.query(RegulatoryRule).filter(RegulatoryRule.status == "active").all()
    return [RegulatoryRuleResponse.model_validate(r) for r in rules]
