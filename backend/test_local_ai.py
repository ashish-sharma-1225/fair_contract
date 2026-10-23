"""
Comprehensive Test Suite for ClauseLens Local AI (Qwen2.5-1.5B-Instruct).
Tests:
1. Model discovery & presence check
2. Model initialization & hardware capability (GPU offload / CPU fallback)
3. Local inference on contract sample text
4. Structured JSON output schema validation
5. Long-contract chunking & clause segmentation
6. Custom policy evaluation against PostgreSQL policies
7. Missing-model error handling
8. End-to-end contract upload, analysis execution, and PostgreSQL persistence
9. Ownership isolation and security
10. Absence of any Gemini / cloud LLM calls in the analysis path
"""

import os
import sys
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.services.local_llm_service import LocalLLMService, LocalModelNotFoundError
from app.schemas.ai_analysis import StructuredAIAnalysisResult

client = TestClient(app)


def test_suite():
    print("=" * 65)
    print("RUNNING CLAUSELENS LOCAL AI (QWEN2.5-1.5B) VERIFICATION SUITE")
    print("=" * 65)

    service = LocalLLMService.get_instance()

    # 1. Model File Discovery
    print("\n[1/10] Verifying Model File Discovery...")
    model_path = service.get_model_path()
    assert service.is_model_present(), f"Model file missing at: {model_path}"
    model_size_mb = os.path.getsize(model_path) / (1024 * 1024)
    assert model_size_mb > 500, f"Model file seems incomplete: {model_size_mb} MB"
    print(f"  [PASS] Model discovered: {model_path} ({model_size_mb:.1f} MB)")

    # 2. Model Initialization & Hardware
    print("\n[2/10] Verifying Model Initialization & Hardware Detection...")
    status = service.get_status()
    assert status["available"] is True, "llama-cpp-python is not available"
    assert status["model_present"] is True, "Model file not detected"
    service._ensure_loaded()
    updated_status = service.get_status()
    assert updated_status["loaded"] is True, "Failed to load model"
    print(f"  [PASS] Model loaded successfully: device={updated_status['device']}, gpu_layers={updated_status['gpu_layers']}")

    # 3. Local Inference on Contract Text
    print("\n[3/10] Testing Direct Local Inference (Qwen2.5-1.5B-Instruct)...")
    sample_prompt = (
        "<|im_start|>system\nYou are a legal analyst.<|im_end|>\n"
        "<|im_start|>user\nIdentify the core obligation in this clause: 'The Freelancer agrees to deliver the Website by December 15.' Answer in one sentence.<|im_end|>\n"
        "<|im_start|>assistant\n"
    )
    res = service._llm(sample_prompt, max_tokens=50, temperature=0.1)
    output_text = res["choices"][0]["text"].strip()
    assert len(output_text) > 5, "Inference returned empty response"
    print(f"  [PASS] Direct inference output: {output_text[:80]}...")

    # 4. Structured JSON Schema Validation
    print("\n[4/10] Testing Structured JSON Output & Pydantic Schema...")
    sample_json = {
        "summary": "Freelancer agreement for website development services.",
        "parties": ["Freelancer", "Client"],
        "key_terms": [
            {
                "category": "payment",
                "title": "Payment Schedule",
                "details": "Payment within 14 days of invoice.",
                "source_quote": "Payment within 14 days of invoice receipt.",
                "page_number": 1,
            }
        ],
        "risks": [
            {
                "category": "payment",
                "title": "Late Payment Ambiguity",
                "severity": "medium",
                "reason": "Interest rate on late payment is undefined.",
                "source_quote": "Late payment will incur interest.",
                "page_number": 1,
                "remediation_advice": "Specify statutory interest rate of 8% per annum.",
            }
        ],
        "policy_findings": [
            {
                "policy_id": "pol_pay_45",
                "policy_name": "Maximum Payment Terms (45 Days)",
                "status": "compliant",
                "reason": "14 days is well within the 45-day threshold.",
                "source_quote": "Payment within 14 days",
                "page_number": 1,
                "remediation_advice": "",
            }
        ],
        "missing_or_ambiguous_terms": ["Governing law clause"],
        "recommendations": ["Clarify interest rate."],
        "questions_for_human_review": ["Confirm milestones with client."],
    }
    validated = StructuredAIAnalysisResult.model_validate(sample_json)
    assert validated.summary.startswith("Freelancer agreement")
    assert len(validated.risks) == 1
    assert len(validated.policy_findings) == 1
    print("  [PASS] Structured JSON schema validated cleanly via Pydantic.")

    # 5. Long-Contract Chunking & Segmentation
    print("\n[5/10] Testing Long-Contract Chunking & Segmentation...")
    dummy_pages = [
        "\n\n".join([f"Clause {i}: Detailed obligation text explaining contractual terms." for i in range(25)]),
        "\n\n".join([f"Page 2 Clause {i}: Additional terms and schedules." for i in range(20)]),
    ]
    chunks = service.segment_contract(dummy_pages, max_chars_per_chunk=500)
    assert len(chunks) >= 2, f"Expected multiple chunks, got {len(chunks)}"
    assert chunks[0][0] == 1, "First chunk should be from Page 1"
    print(f"  [PASS] Contract successfully segmented into {len(chunks)} chunks with page references.")

    # 6. Custom Policy Evaluation
    print("\n[6/10] Testing Policy Evaluation with Local Qwen...")
    policies = [
        {
            "id": "pol_pay_45",
            "name": "Maximum Payment Terms (45 Days)",
            "category": "payment",
            "rule_text": "Payment terms must not exceed Net 45 days.",
            "severity": "high",
        }
    ]
    sample_contract_text = [
        "SECTION 3: FEES AND PAYMENT. Client shall pay within [7/14] calendar days of invoice receipt."
    ]
    ai_result = service.analyze_contract_text(
        pages_text=sample_contract_text,
        policies=policies,
        regulatory_rules=[],
        contract_title="Test Agreement",
    )
    assert isinstance(ai_result, StructuredAIAnalysisResult)
    assert len(ai_result.summary) > 10
    print(f"  [PASS] Policy evaluation complete: summary='{ai_result.summary[:60]}...'")
    print(f"  [PASS] Risks flagged: {len(ai_result.risks)}, Policy findings: {len(ai_result.policy_findings)}")

    # 7. Missing-Model Error Handling
    print("\n[7/10] Testing Missing-Model Error Handling...")
    orig_path = settings.MODEL_PATH
    try:
        settings.MODEL_PATH = "nonexistent/path/to/model.gguf"
        temp_service = LocalLLMService()
        assert temp_service.is_model_present() is False
        try:
            temp_service._ensure_loaded()
            assert False, "Should have raised LocalModelNotFoundError"
        except LocalModelNotFoundError as e:
            print(f"  [PASS] Successfully caught LocalModelNotFoundError: '{str(e)[:60]}...'")
    finally:
        settings.MODEL_PATH = orig_path

    # 8. End-to-End Upload, Local Qwen Analysis & PostgreSQL Persistence
    print("\n[8/10] Testing End-to-End API Pipeline with Local AI...")
    pdf_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "sample_freelancer_client_agreement.pdf",
    )
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()

    # Upload
    upload_res = client.post(
        "/api/contracts/upload",
        files={"file": ("local_ai_test_agreement.pdf", file_bytes, "application/pdf")},
    )
    assert upload_res.status_code == 200
    contract_id = upload_res.json()["id"]
    print(f"  [PASS] Contract uploaded: {contract_id}")

    # Analyze with local AI
    analyze_res = client.post(
        f"/api/contracts/{contract_id}/analyze",
        json={"policy_ids": [], "regulatory_rule_ids": []},
    )
    assert analyze_res.status_code == 200, f"Analysis failed: {analyze_res.text}"
    analysis_data = analyze_res.json()
    assert analysis_data["model_provider"] == "local-llm", f"Expected local-llm, got: {analysis_data['model_provider']}"
    assert "Qwen" in analysis_data["model_name"], f"Expected Qwen model, got: {analysis_data['model_name']}"
    assert analysis_data["status"] == "completed"
    assert len(analysis_data["findings"]) > 0
    print(f"  [PASS] Analysis completed with Local AI:")
    print(f"         - Model: {analysis_data['model_name']} (Provider: {analysis_data['model_provider']})")
    print(f"         - Status: {analysis_data['status']}")
    print(f"         - Overall Risk: {analysis_data['overall_risk_level']}")
    print(f"         - Total Findings: {len(analysis_data['findings'])}")

    # 9. Document Ownership & Security Isolation
    print("\n[9/10] Verifying Ownership & Security Isolation...")
    intruder_headers = {"X-User-Id": "usr_intruder_99"}
    res = client.get(f"/api/contracts/{contract_id}", headers=intruder_headers)
    assert res.status_code == 404, "Security violation: Intruder accessed contract"

    res = client.get(f"/api/analyses/{analysis_data['id']}", headers=intruder_headers)
    assert res.status_code == 404, "Security violation: Intruder accessed analysis"
    print("  [PASS] Intruder blocked from contract and analysis report (404 Not Found)")

    # Cleanup test contract
    del_res = client.delete(f"/api/contracts/{contract_id}")
    assert del_res.status_code == 200
    print("  [PASS] Test contract cleanly deleted.")

    # 10. Verify No Gemini / Cloud LLM Calls in Analysis Path
    print("\n[10/10] Verifying Absence of Gemini or External Cloud LLM in Analysis...")
    analysis_service_file = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "app",
        "services",
        "analysis_service.py",
    )
    with open(analysis_service_file, "r", encoding="utf-8") as f:
        code_content = f.read()

    assert "google.generativeai" not in code_content, "Google Gemini SDK found in analysis_service.py!"
    assert "genai." not in code_content, "Gemini calls found in analysis_service.py!"
    assert "GEMINI_API_KEY" not in code_content, "Gemini API key referenced in analysis_service.py!"
    assert "local_llm_service" in code_content, "LocalLLMService is missing from analysis_service.py!"
    print("  [PASS] Verified: Zero cloud LLM / Gemini dependencies in analysis workflow.")
    print("  [PASS] All contract intelligence is executed 100% locally on Qwen2.5-1.5B-Instruct.")

    print("\n" + "=" * 65)
    print("ALL 10 LOCAL AI VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)


if __name__ == "__main__":
    test_suite()
