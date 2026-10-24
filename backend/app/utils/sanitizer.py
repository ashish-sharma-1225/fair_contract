"""
Contract text sanitiser.

Responsibilities:
  - Truncate oversized input to MAX_CONTRACT_CHARS silently.
  - Detect common prompt-injection patterns and emit a warning that
    contains NO matched content and NO document text.

Public API
----------
    sanitize_contract_text(text: str) -> str
"""

from __future__ import annotations

import re
import warnings

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_CONTRACT_CHARS: int = 20_000

# Patterns are matched case-insensitively against the raw input.
# IMPORTANT: the patterns themselves are never included in any log output.
_INJECTION_PATTERNS: list[re.Pattern[str]] = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"ignore\s+previous\s+instructions",
        r"disregard\s+system\s+prompt",
        r"reveal\s+api\s+key",
        r"print\s+system\s+prompt",
        r"forget\s+your\s+instructions",
        r"new\s+instructions\s*:",
        r"override\s+previous",
        r"system\s*:\s*you\s+are",
        r"act\s+as\s+if\s+you",
        r"bypass\s+your",
    ]
]


# ---------------------------------------------------------------------------
# Public function
# ---------------------------------------------------------------------------


def sanitize_contract_text(text: str) -> str:
    """Sanitise contract text before sending to the AI service.

    Steps:
    1. Truncate to MAX_CONTRACT_CHARS (silent — no log).
    2. Scan for prompt-injection patterns; if found, emit one warning line
       per category (no matched text, no document text is ever emitted).

    Returns the sanitised (possibly truncated) text.
    """
    # Step 1: truncate
    sanitised = text[:MAX_CONTRACT_CHARS]

    # Step 2: injection detection
    for pattern in _INJECTION_PATTERNS:
        if pattern.search(sanitised):
            # WARNING: do NOT include matched text, contract text, or
            # the pattern string in the warning message.
            warnings.warn(
                "Potential prompt-injection pattern detected in contract input. "
                "The content will be treated as data only.",
                stacklevel=2,
            )
            # One warning is sufficient; break after the first match.
            break

    return sanitised
