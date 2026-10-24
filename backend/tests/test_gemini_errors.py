"""
Tests for gemini_service._map_api_error error mapping.

These tests are fully local — no API key, no real network calls, never skip.
The Gemini client is mocked so analyse_contract() never reaches the network.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from google.genai.errors import APIError, ClientError, ServerError

# Import the module (not the function) so we can patch module-level state
import app.services.gemini_service as svc


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_client_raising(exc: Exception) -> MagicMock:
    """Return a mock that raises *exc* when models.generate_content() is called."""
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = exc
    return mock_client


# ---------------------------------------------------------------------------
# Error-mapping tests (mock the client, never call real API)
# ---------------------------------------------------------------------------


class TestErrorMapping:
    """Patch _get_client so analyse_contract() sees a fake SDK exception."""

    def test_rate_limit_error_raises_runtime_error(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """ClientError(429) → RuntimeError containing 'rate limit'."""
        exc = ClientError(code=429, response_json={"error": {"message": "rate limited"}})
        monkeypatch.setattr(svc, "_get_client", lambda: _make_client_raising(exc))

        with pytest.raises(RuntimeError, match="rate limit"):
            svc.analyse_contract("Payment is due on the 1st of each month.")

    def test_auth_error_raises_runtime_error(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """ClientError(401) → RuntimeError containing 'Invalid Gemini API key'."""
        exc = ClientError(code=401, response_json={"error": {"message": "invalid key"}})
        monkeypatch.setattr(svc, "_get_client", lambda: _make_client_raising(exc))

        with pytest.raises(RuntimeError, match="Invalid Gemini API key"):
            svc.analyse_contract("Payment is due on the 1st of each month.")

    def test_server_error_raises_runtime_error(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """ServerError(503) → RuntimeError containing 'temporarily unavailable'."""
        exc = ServerError(code=503, response_json={"error": {"message": "service unavailable"}})
        monkeypatch.setattr(svc, "_get_client", lambda: _make_client_raising(exc))

        with pytest.raises(RuntimeError, match="temporarily unavailable"):
            svc.analyse_contract("Payment is due on the 1st of each month.")

    def test_500_error_raises_runtime_error(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """ServerError(500) → RuntimeError containing 'temporarily unavailable'."""
        exc = ServerError(code=500, response_json={"error": {"message": "internal error"}})
        monkeypatch.setattr(svc, "_get_client", lambda: _make_client_raising(exc))

        with pytest.raises(RuntimeError, match="temporarily unavailable"):
            svc.analyse_contract("Payment is due on the 1st of each month.")

    def test_unknown_api_error_raises_runtime_error(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """APIError with an unmapped code → RuntimeError containing 'failed'."""
        exc = APIError(code=418, response_json={"error": {"message": "I'm a teapot"}})
        monkeypatch.setattr(svc, "_get_client", lambda: _make_client_raising(exc))

        with pytest.raises(RuntimeError, match="failed"):
            svc.analyse_contract("Payment is due on the 1st of each month.")

    def test_generic_exception_raises_runtime_error(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Non-SDK exception (e.g. timeout) → RuntimeError containing 'failed'."""
        exc = TimeoutError("connection timed out")
        monkeypatch.setattr(svc, "_get_client", lambda: _make_client_raising(exc))

        with pytest.raises(RuntimeError, match="failed"):
            svc.analyse_contract("Payment is due on the 1st of each month.")


# ---------------------------------------------------------------------------
# Missing-key guard test (call-time, not import-time)
# ---------------------------------------------------------------------------


class TestKeyGuard:
    def test_missing_key_raises_at_call_time(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """RuntimeError is raised by analyse_contract(), not at import time."""
        # Reset the cached client so the guard runs fresh
        monkeypatch.setattr(svc, "_client", None)
        monkeypatch.delenv("GEMINI_API_KEY", raising=False)

        with pytest.raises(RuntimeError, match="GEMINI_API_KEY"):
            svc.analyse_contract("Some contract text.")

    def test_module_is_importable_without_key(self) -> None:
        """The module must already be imported (this test proves it didn't crash)."""
        # If we reach this line, the import at the top of the file succeeded
        # without a key — confirming call-time guard.
        assert hasattr(svc, "analyse_contract")
        assert callable(svc.analyse_contract)


# ---------------------------------------------------------------------------
# Phase 4 — Error-mapping coverage for policy path
# ---------------------------------------------------------------------------

_SAMPLE_POLICIES: list[dict] = [{"name": "Policy A", "rules": ["Rule 1"]}]


class TestPolicyPathErrorMapping:
    def test_policy_path_rate_limit_429_raises(self, monkeypatch: pytest.MonkeyPatch) -> None:
        exc = ClientError(code=429, response_json={"error": {"message": "rate limited"}})
        monkeypatch.setattr(svc, "_get_client", lambda: _make_client_raising(exc))

        with pytest.raises(RuntimeError, match="rate limit"):
            svc.analyse_contract("Sample contract.", policies=_SAMPLE_POLICIES)

    def test_policy_path_401_raises(self, monkeypatch: pytest.MonkeyPatch) -> None:
        exc = ClientError(code=401, response_json={"error": {"message": "invalid api key"}})
        monkeypatch.setattr(svc, "_get_client", lambda: _make_client_raising(exc))

        with pytest.raises(RuntimeError, match="Invalid Gemini API key"):
            svc.analyse_contract("Sample contract.", policies=_SAMPLE_POLICIES)

    def test_policy_path_500_raises(self, monkeypatch: pytest.MonkeyPatch) -> None:
        exc = ServerError(code=500, response_json={"error": {"message": "internal server error"}})
        monkeypatch.setattr(svc, "_get_client", lambda: _make_client_raising(exc))

        with pytest.raises(RuntimeError, match="temporarily unavailable"):
            svc.analyse_contract("Sample contract.", policies=_SAMPLE_POLICIES)

    def test_policy_path_malformed_json_raises(self, monkeypatch: pytest.MonkeyPatch) -> None:
        mock_response = MagicMock()
        mock_response.text = "not json"
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response
        monkeypatch.setattr(svc, "_get_client", lambda: mock_client)

        with pytest.raises(RuntimeError, match="Invalid structured output"):
            svc.analyse_contract("Sample contract.", policies=_SAMPLE_POLICIES)
