from dotenv import load_dotenv
load_dotenv()

from app.services.gemini_service import analyse_contract
from app.models.contract_analysis import ContractAnalysis, PolicyFindingStatus

SAMPLE = """SERVICES AGREEMENT
1. Payment. Client pays Provider $5,000/month, due net 30.
2. Termination. Either party may terminate on 60 days' written notice.
3. Confidentiality. Provider keeps Client data confidential.
4. Liability. Provider's liability capped at fees paid in prior 12 months.
"""
POLICIES = [
    {"name": "Payment Policy", "rules": [
        "Invoices must be paid within 30 days.",
        "Late payments incur a 2% monthly interest charge.",
    ]},
    {"name": "Data Protection Policy", "rules": [
        "Client data must be encrypted at rest.",
        "Provider must notify Client of any breach within 72 hours.",
    ]},
]

r = analyse_contract(SAMPLE, policies=POLICIES)
for pf in r.policy_findings:
    print(f"[{pf.status.value}] {pf.policy_name} :: {pf.rule[:50]}")
    if pf.status == PolicyFindingStatus.MISSING:
        assert pf.evidence is None
    else:
        assert pf.evidence
print("SMOKE TEST OK")
