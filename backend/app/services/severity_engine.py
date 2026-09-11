"""
backend/app/services/severity_engine.py

Adapter bridging predict_service.py's expected interface to ml/severity_engine.py.

predict_service.py imports:
    from app.services.severity_engine import get_severity

ml/severity_engine.py exports:
    calculate_severity(disease, confidence, affected_pct) -> str

The CONTRACT.md severity tiers are:
    "trace"    (0–5%)
    "mild"     (6–15%)
    "moderate" (16–35%)
    "severe"   (36%+)

Nimisha's calculate_severity uses different tier names (low/moderate/high/critical)
based on confidence + affected_pct. This adapter maps affected_pct directly to the
CONTRACT-compliant tier names per the specification.
"""

from __future__ import annotations


def get_severity(affected_pct: float) -> str:
    """
    Convert affected leaf area percentage to CONTRACT-compliant severity tier.

    CONTRACT.md tiers (Section 3):
        trace     0 – 5%
        mild      6 – 15%
        moderate  16 – 35%
        severe    36%+

    Args:
        affected_pct: Percentage of leaf area affected (0.0 – 100.0).

    Returns:
        One of: "trace", "mild", "moderate", "severe"
    """
    try:
        pct = float(affected_pct)
    except (TypeError, ValueError):
        pct = 0.0

    pct = max(0.0, min(100.0, pct))

    if pct <= 5.0:
        return "trace"
    elif pct <= 15.0:
        return "mild"
    elif pct <= 35.0:
        return "moderate"
    else:
        return "severe"
