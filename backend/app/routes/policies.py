from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.policy import PolicyCreate, PolicyUpdate, PolicyResponse
from app.schemas.common import SuccessResponse
from app.services.policy_service import PolicyService

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get("", response_model=List[PolicyResponse], summary="List custom policies")
def list_policies(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> List[PolicyResponse]:
    """List all custom policies defined by or assigned to the current user."""
    return PolicyService.list_policies(db, user_id)


@router.post("", response_model=PolicyResponse, status_code=201, summary="Create a policy")
def create_policy(
    policy_in: PolicyCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> PolicyResponse:
    """Create a new contract review policy."""
    return PolicyService.create_policy(db, user_id, policy_in)


@router.get("/{id}", response_model=PolicyResponse, summary="Retrieve a policy")
def get_policy(
    id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> PolicyResponse:
    """Retrieve policy details by ID enforcing user ownership."""
    return PolicyService.get_policy(db, id, user_id)


@router.put("/{id}", response_model=PolicyResponse, summary="Update a policy (PUT)")
def update_policy_put(
    id: str,
    policy_in: PolicyUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> PolicyResponse:
    """Update a custom contract policy."""
    return PolicyService.update_policy(db, id, user_id, policy_in)


@router.patch("/{id}", response_model=PolicyResponse, summary="Partial update a policy (PATCH)")
def update_policy_patch(
    id: str,
    policy_in: PolicyUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> PolicyResponse:
    """Partial update a custom contract policy (supports frontend client toggle)."""
    return PolicyService.update_policy(db, id, user_id, policy_in)


@router.delete("/{id}", response_model=SuccessResponse, summary="Delete a policy")
def delete_policy(
    id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> SuccessResponse:
    """Delete a custom contract policy."""
    PolicyService.delete_policy(db, id, user_id)
    return SuccessResponse(success=True, id=id, message="Policy deleted successfully")
