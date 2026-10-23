"""
Comprehensive test script for ClauseLens Backend & PostgreSQL Database.
Tests:
1. Database connectivity
2. Health check endpoint
3. Policy CRUD endpoints
4. Contract upload & retrieval
5. Contract analysis execution
6. History & finding reviews
7. User isolation & ownership enforcement
"""

import os
import sys

# Ensure backend root on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import test_connection

client = TestClient(app)


def run_tests():
    print("=" * 60)
    print("RUNNING CLAUSELENS BACKEND & POSTGRESQL VERIFICATION")
    print("=" * 60)

    # 1. Direct DB Connectivity
    print("\n[1/7] Testing PostgreSQL direct connection...")
    db_ok = test_connection()
    assert db_ok, "Direct PostgreSQL connection failed!"
    print("  [PASS] PostgreSQL connection: OK")

    # 2. Health Endpoint
    print("\n[2/7] Testing GET /api/health...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    health_data = res.json()
    assert health_data["status"] == "ok"
    assert health_data["database"] == "connected"
    print(f"  [PASS] Health check: {health_data}")

    # 3. Policy CRUD
    print("\n[3/7] Testing Policies endpoints...")
    # List policies
    res = client.get("/api/policies")
    assert res.status_code == 200
    initial_policies = res.json()
    print(f"  [PASS] Found {len(initial_policies)} existing policies")

    # Create policy
    new_policy_payload = {
        "name": "Integration Test Policy",
        "category": "payment",
        "rule_text": "Payment terms shall never exceed 30 calendar days.",
        "rule_config": {"max_payment_days": 30},
        "severity": "high",
        "is_enabled": True,
    }
    res = client.post("/api/policies", json=new_policy_payload)
    assert res.status_code == 201, f"Create policy failed: {res.text}"
    created_policy = res.json()
    policy_id = created_policy["id"]
    print(f"  [PASS] Created policy: {policy_id} ({created_policy['name']})")

    # Update policy (PUT)
    update_payload = {
        "name": "Updated Integration Policy",
        "category": "payment",
        "rule_text": "Updated rule text net 30",
        "severity": "medium",
        "is_enabled": False,
    }
    res = client.put(f"/api/policies/{policy_id}", json=update_payload)
    assert res.status_code == 200
    assert res.json()["is_enabled"] is False
    print("  [PASS] Updated policy (PUT): OK")

    # Partial update (PATCH)
    res = client.patch(f"/api/policies/{policy_id}", json={"is_enabled": True})
    assert res.status_code == 200
    assert res.json()["is_enabled"] is True
    print("  [PASS] Updated policy (PATCH): OK")

    # 4. Contract Upload & Retrieval
    print("\n[4/7] Testing Contract Upload & Retrieval...")
    pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_freelancer_client_agreement.pdf")
    assert os.path.exists(pdf_path), f"Sample PDF not found at {pdf_path}"

    with open(pdf_path, "rb") as f:
        file_bytes = f.read()

    # Upload using POST /api/contracts/upload
    res = client.post(
        "/api/contracts/upload",
        files={"file": ("sample_agreement.pdf", file_bytes, "application/pdf")},
    )
    assert res.status_code == 200, f"Upload failed: {res.text}"
    contract_data = res.json()
    contract_id = contract_data["id"]
    print(f"  [PASS] Contract uploaded: {contract_id} (pages: {contract_data['page_count']}, size: {contract_data['size_bytes']} bytes)")

    # Retrieve contract details GET /api/contracts/{id}
    res = client.get(f"/api/contracts/{contract_id}")
    assert res.status_code == 200
    assert res.json()["id"] == contract_id
    print(f"  [PASS] Retrieved contract {contract_id}: OK")

    # List contracts GET /api/contracts
    res = client.get("/api/contracts")
    assert res.status_code == 200
    contracts_list = res.json()
    assert any(c["id"] == contract_id for c in contracts_list)
    print(f"  [PASS] Contract listed among {len(contracts_list)} active contracts")

    # 5. Analysis Execution
    print("\n[5/7] Testing Contract Analysis...")
    res = client.post(
        f"/api/contracts/{contract_id}/analyze",
        json={"policy_ids": [], "regulatory_rule_ids": []},
    )
    assert res.status_code == 200, f"Analysis failed: {res.text}"
    analysis_data = res.json()
    analysis_id = analysis_data["id"]
    print(f"  [PASS] Analysis executed: {analysis_id} (status: {analysis_data['status']}, risk: {analysis_data['overall_risk_level']})")
    print(f"  [PASS] Total findings: {analysis_data['findings_count']['total']}")

    # 6. Analysis History & Finding Reviews
    print("\n[6/7] Testing History and Review Endpoints...")
    res = client.get("/api/history")
    assert res.status_code == 200
    history_items = res.json()
    assert any(h["id"] == analysis_id for h in history_items)
    print(f"  [PASS] Analysis found in history ({len(history_items)} total entries)")

    res = client.get(f"/api/analyses/{analysis_id}")
    assert res.status_code == 200
    analysis_detail = res.json()
    assert len(analysis_detail["findings"]) > 0
    first_finding = analysis_detail["findings"][0]
    print(f"  [PASS] Verified finding detail: {first_finding['id']} - {first_finding['reason'][:50]}...")

    # Update finding review status
    res = client.patch(
        f"/api/findings/{first_finding['id']}/review",
        json={"review_status": "reviewed"},
    )
    assert res.status_code == 200
    assert res.json()["review_status"] == "reviewed"
    print("  [PASS] Finding review status updated to 'reviewed'")

    # 7. Security: User Ownership Isolation & Cleanup
    print("\n[7/7] Testing Security & Ownership Isolation...")
    # Access contract as another user (User B)
    headers_user_b = {"X-User-Id": "usr_intruder_99"}
    res = client.get(f"/api/contracts/{contract_id}", headers=headers_user_b)
    assert res.status_code == 404, f"Security breach: User B accessed User A's contract: {res.text}"
    print("  [PASS] User B prevented from retrieving User A's contract (404 Not Found)")

    res = client.delete(f"/api/contracts/{contract_id}", headers=headers_user_b)
    assert res.status_code == 404, "Security breach: User B deleted User A's contract!"
    print("  [PASS] User B prevented from deleting User A's contract (404 Not Found)")

    # User B cannot access User A's policies
    res = client.get(f"/api/policies/{policy_id}", headers=headers_user_b)
    assert res.status_code == 404, "Security breach: User B accessed User A's policy!"
    print("  [PASS] User B prevented from accessing User A's policy (404 Not Found)")

    # Cleanup: Delete contract as owner
    res = client.delete(f"/api/contracts/{contract_id}")
    assert res.status_code == 200
    print(f"  [PASS] Contract {contract_id} safely deleted by owner")

    # Cleanup: Delete policy as owner
    res = client.delete(f"/api/policies/{policy_id}")
    assert res.status_code == 200
    print(f"  [PASS] Policy {policy_id} safely deleted by owner")

    print("\n" + "=" * 60)
    print("ALL BACKEND & POSTGRESQL VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
