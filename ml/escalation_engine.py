"""Deterministic escalation rules."""

from __future__ import annotations

from .i18n_engine import translate


def determine_escalation(
    severity: object = None,
    gemini: object = None,
    language: object = "en",
) -> dict[str, object]:
    """
    Determine whether a case requires escalation.

    Escalation occurs when:
    - severity is high or critical; or
    - Gemini explicitly reports agreement == False.

    A missing Gemini result does not independently trigger escalation.
    """
    severity_text = str(severity or "").strip().lower()
    reasons: list[str] = []

    if severity_text in {"high", "critical"}:
        reasons.append(translate("escalation.high_severity", language))

    if isinstance(gemini, dict) and gemini.get("agreement") is False:
        reasons.append(translate("escalation.gemini_disagreement", language))

    return {
        "escalate": bool(reasons),
        "escalate_reason": "; ".join(reasons),
    }
