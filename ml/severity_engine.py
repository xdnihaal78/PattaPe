"""Deterministic disease severity calculation."""

from __future__ import annotations

from numbers import Real


SEVERITIES = ("low", "moderate", "high", "critical")


def _safe_number(value: object, default: float = 0.0) -> float:
    """Convert a value to a finite non-negative float."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default

    if number != number or number in (float("inf"), float("-inf")):
        return default

    return max(0.0, number)


def calculate_severity(
    disease: object = None,
    confidence: object = None,
    affected_pct: object = None,
) -> str:
    """
    Calculate severity from disease, model confidence, and affected percentage.

    Rules:
    - Invalid or missing values use safe defaults.
    - Critical: affected percentage >= 75 or confidence >= 0.90
    - High: affected percentage >= 50 or confidence >= 0.75
    - Moderate: affected percentage >= 25 or confidence >= 0.50
    - Otherwise: low

    Confidence may be supplied as either 0.85 or 85.
    Disease is accepted for interface compatibility and future disease-specific
    rules. Unknown or missing disease values do not cause an exception.
    """
    del disease

    confidence_value = _safe_number(confidence)
    affected_value = _safe_number(affected_pct)

    if confidence_value > 1:
        confidence_value /= 100.0

    confidence_value = min(confidence_value, 1.0)
    affected_value = min(affected_value, 100.0)

    if affected_value >= 75 or confidence_value >= 0.90:
        return "critical"

    if affected_value >= 50 or confidence_value >= 0.75:
        return "high"

    if affected_value >= 25 or confidence_value >= 0.50:
        return "moderate"

    return "low"
