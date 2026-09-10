"""
ml/severity.py - Shared deterministic severity calculation for PattaPe / SIH26131.

Calculates categorical disease severity from AI-estimated affected leaf area
(affected_pct from Grad-CAM analysis).
"""

import math
from typing import Any, Dict, Union


def get_severity(affected_pct: Union[float, int]) -> str:
    """
    Calculate deterministic severity level from affected leaf area percentage.

    Thresholds:
      affected_pct <= 5   -> "trace"
      affected_pct <= 15  -> "mild"
      affected_pct <= 35  -> "moderate"
      otherwise (<= 100)  -> "severe"

    Parameters:
        affected_pct: float from 0 to 100 representing the affected leaf percentage.

    Returns:
        Lowercase machine-readable severity label: 'trace', 'mild', 'moderate', or 'severe'.

    Raises:
        ValueError: If affected_pct is NaN, infinite, less than 0, or greater than 100.
    """
    try:
        val = float(affected_pct)
    except (TypeError, ValueError) as e:
        raise ValueError(
            f"Invalid affected_pct: {affected_pct}. Must be a numeric value between 0 and 100."
        ) from e

    if math.isnan(val) or math.isinf(val):
        raise ValueError(f"Invalid affected_pct: {val}. Value must be a finite number.")

    if val < 0.0:
        raise ValueError(f"Invalid affected_pct: {val}. Value cannot be less than 0%.")

    if val > 100.0:
        raise ValueError(f"Invalid affected_pct: {val}. Value cannot be greater than 100%.")

    if val <= 5.0:
        return "trace"
    elif val <= 15.0:
        return "mild"
    elif val <= 35.0:
        return "moderate"
    else:
        return "severe"


def get_severity_details(affected_pct: Union[float, int]) -> Dict[str, Any]:
    """
    Get detailed severity information including severity tier and percentage.

    Example:
        {
            "severity": "moderate",
            "affected_pct": 34.84
        }

    Parameters:
        affected_pct: float from 0 to 100.

    Returns:
        Dictionary containing 'severity' and 'affected_pct'.
    """
    severity = get_severity(affected_pct)
    return {
        "severity": severity,
        "affected_pct": float(affected_pct),
    }


if __name__ == "__main__":
    print("=" * 60)
    print("PattaPe / SIH26131 - Severity Calculation Tests")
    print("=" * 60)

    test_cases = [
        (0.0, "trace"),
        (5.0, "trace"),
        (5.01, "mild"),
        (15.0, "mild"),
        (15.01, "moderate"),
        (35.0, "moderate"),
        (35.01, "severe"),
        (100.0, "severe"),
    ]

    all_passed = True

    print("\n--- Boundary Test Cases ---")
    for val, expected in test_cases:
        result = get_severity(val)
        details = get_severity_details(val)
        status = "PASS" if result == expected else "FAIL"
        if status == "FAIL":
            all_passed = False
        print(f"[{status}] affected_pct: {val:>6} -> result: {result:<8} (expected: {expected:<8}) | details: {details}")
        assert result == expected, f"Expected {expected}, got {result} for {val}"
        assert details["severity"] == expected
        assert details["affected_pct"] == float(val)

    print("\n--- Validation Error Tests ---")
    invalid_cases = [
        (-0.01, "negative value"),
        (-10.0, "negative value"),
        (100.01, "exceeds 100%"),
        (150.0, "exceeds 100%"),
        (float("nan"), "NaN value"),
        (float("inf"), "Positive infinity"),
        (float("-inf"), "Negative infinity"),
    ]

    for val, desc in invalid_cases:
        try:
            get_severity(val)
            print(f"[FAIL] Expected ValueError for {desc} ({val}) but none was raised.")
            all_passed = False
        except ValueError as err:
            print(f"[PASS] Correctly rejected {desc} ({val}): {err}")

    print("\n" + "=" * 60)
    if all_passed:
        print("ALL BOUNDARY AND VALIDATION TESTS PASSED SUCCESSFULLY!")
    else:
        print("SOME TESTS FAILED!")
    print("=" * 60)
