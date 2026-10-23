import logging
from datetime import datetime, timezone
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.regulatory import RegulatorySource, RegulatoryRule
from app.models.policy import Policy

logger = logging.getLogger("clauselens.init_db")


def init_database():
    """Create all tables and seed required initial reference data."""
    logger.info("Creating database tables if not present...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Ensure default enterprise user exists
        user = db.query(User).filter(User.id == "usr_enterprise_01").first()
        if not user:
            logger.info("Seeding default enterprise user (usr_enterprise_01)...")
            user = User(
                id="usr_enterprise_01",
                email="counsel@acmecorp.com",
                name="Alexandra Vance",
                organization="Acme Corporation Legal",
                role="Senior Legal Counsel",
                created_at=datetime.now(timezone.utc),
            )
            db.add(user)
            db.commit()

        # 2. Ensure regulatory sources and rules exist
        reg_source = db.query(RegulatorySource).filter(RegulatorySource.id == "source_gdpr_eu").first()
        if not reg_source:
            logger.info("Seeding initial regulatory sources and rules...")
            reg_source = RegulatorySource(
                id="source_gdpr_eu",
                title="EU General Data Protection Regulation (GDPR)",
                jurisdiction="European Union",
                publisher="European Parliament and Council",
                official_url="https://eur-lex.europa.eu/eli/reg/2016/679/oj",
                effective_date="2018-05-25",
                last_verified_at="2026-01-15",
            )
            db.add(reg_source)
            db.flush()

            rules = [
                RegulatoryRule(
                    id="rule_gdpr_art28",
                    source_id=reg_source.id,
                    rule_code="GDPR-Art28",
                    category="liability",
                    rule_text="Processor contracts must require processor to process data only on documented instructions and ensure confidentiality.",
                    applicability_notes="Mandatory for any data processing addenda or contractor agreements handling EU personal data.",
                    binding_type="binding_law",
                    version="2024.1",
                    status="active",
                ),
                RegulatoryRule(
                    id="rule_late_payment_uk",
                    source_id=reg_source.id,
                    rule_code="LATE-PAY-ACT",
                    category="payment",
                    rule_text="Commercial payment terms exceeding 60 days must be expressly agreed and not grossly unfair to the creditor.",
                    applicability_notes="Commercial contracts governed by UK/EU late payment statutory interest guidelines.",
                    binding_type="binding_law",
                    version="2024.1",
                    status="active",
                ),
            ]
            db.add_all(rules)
            db.commit()

        # 3. Ensure sample enterprise policies exist if user has none
        user_policies = db.query(Policy).filter(Policy.owner_id == "usr_enterprise_01").count()
        if user_policies == 0:
            logger.info("Seeding standard corporate policies for usr_enterprise_01...")
            sample_policies = [
                Policy(
                    id="pol_pay_45",
                    owner_id="usr_enterprise_01",
                    name="Maximum Payment Terms (45 Days)",
                    category="payment",
                    rule_text="Payment terms must not exceed Net 45 days from receipt of a valid and undisputed invoice.",
                    rule_config={"max_payment_days": 45},
                    severity="high",
                    is_enabled=True,
                ),
                Policy(
                    id="pol_auto_renew",
                    owner_id="usr_enterprise_01",
                    name="Prohibit Automatic Annual Renewal",
                    category="renewal",
                    rule_text="Evergreen renewal clauses without at least 60 days explicit written cancellation notice are prohibited.",
                    rule_config={"min_cancellation_notice_days": 60},
                    severity="medium",
                    is_enabled=True,
                ),
                Policy(
                    id="pol_liab_cap",
                    owner_id="usr_enterprise_01",
                    name="Aggregate Liability Cap",
                    category="liability",
                    rule_text="Total aggregate liability under the agreement must not exceed 100% of fees paid in the prior 12-month period.",
                    rule_config={"liability_cap_percent": 100},
                    severity="high",
                    is_enabled=True,
                ),
            ]
            db.add_all(sample_policies)
            db.commit()

        logger.info("Database initialization completed successfully.")
    except Exception as e:
        logger.error("Error during database initialization: %s", e)
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
