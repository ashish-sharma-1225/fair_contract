import uuid
import logging
from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.policy import Policy
from app.schemas.policy import PolicyCreate, PolicyUpdate, PolicyResponse

logger = logging.getLogger("clauselens.policy_service")


class PolicyService:
    @classmethod
    def list_policies(cls, db: Session, user_id: str) -> List[PolicyResponse]:
        """List all custom policies for the authenticated user."""
        policies = (
            db.query(Policy)
            .filter(Policy.owner_id == user_id)
            .order_by(desc(Policy.created_at))
            .all()
        )
        return [PolicyResponse.model_validate(p) for p in policies]

    @classmethod
    def get_policy(cls, db: Session, policy_id: str, user_id: str) -> PolicyResponse:
        """Get a single policy ensuring user ownership."""
        policy = (
            db.query(Policy)
            .filter(Policy.id == policy_id, Policy.owner_id == user_id)
            .first()
        )
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Policy not found or access denied.",
            )
        return PolicyResponse.model_validate(policy)

    @classmethod
    def create_policy(cls, db: Session, user_id: str, policy_in: PolicyCreate) -> PolicyResponse:
        """Create a new custom policy record."""
        policy_id = f"pol_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        policy = Policy(
            id=policy_id,
            owner_id=user_id,
            name=policy_in.name,
            category=policy_in.category,
            rule_text=policy_in.rule_text,
            rule_config=policy_in.rule_config,
            severity=policy_in.severity,
            is_enabled=policy_in.is_enabled,
            created_at=now,
            updated_at=now,
        )
        db.add(policy)
        db.commit()
        db.refresh(policy)
        logger.info("Policy created: id=%s by user=%s", policy.id, user_id)
        return PolicyResponse.model_validate(policy)

    @classmethod
    def update_policy(cls, db: Session, policy_id: str, user_id: str, update_in: PolicyUpdate) -> PolicyResponse:
        """Update an existing policy ensuring ownership."""
        policy = (
            db.query(Policy)
            .filter(Policy.id == policy_id, Policy.owner_id == user_id)
            .first()
        )
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Policy not found or access denied.",
            )

        update_data = update_in.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(policy, key, val)

        policy.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(policy)
        logger.info("Policy updated: id=%s by user=%s", policy.id, user_id)
        return PolicyResponse.model_validate(policy)

    @classmethod
    def delete_policy(cls, db: Session, policy_id: str, user_id: str) -> bool:
        """Delete a policy ensuring ownership."""
        policy = (
            db.query(Policy)
            .filter(Policy.id == policy_id, Policy.owner_id == user_id)
            .first()
        )
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Policy not found or access denied.",
            )

        db.delete(policy)
        db.commit()
        logger.info("Policy deleted: id=%s by user=%s", policy_id, user_id)
        return True
