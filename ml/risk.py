"""
ml/risk.py - Shared deterministic 72-hour disease-risk scoring engine for PattaPe / SIH26131.

Calculates environmental and epidemiological risk for disease progression over 72 hours.
Purely deterministic: no external APIs, no ML dependencies.
"""

import math
from typing import Any, Dict, List, Union

VALID_SEVERITIES = {"trace", "mild", "moderate", "severe"}
SUSCEPTIBLE_PATHOGENS = {"T1", "T2", "T7"}


def _format_num(val: Union[float, int]) -> str:
    """Format numeric values cleanly for machine-readable reason strings."""
    if isinstance(val, int) or (isinstance(val, float) and val.is_integer()):
        return str(int(val))
    return f"{val:g}"


def calculate_risk(
    humidity_avg: float,
    rain_72h_mm: float,
    temp_avg: float,
    severity: str,
    pathogen_type: str,
) -> Dict[str, Any]:
    """
    Calculate 72-hour disease risk score and level deterministically.

    Scoring rules:
      - Humidity:
          > 80% -> +2
          > 65% -> +1
      - Rainfall:
          > 15 mm -> +2
          > 5 mm  -> +1
      - Temperature:
          20 <= temp <= 30 °C -> +1
      - Severity:
          moderate or severe -> +1
      - Pathogen:
          T1, T2, or T7 -> +1

    Risk levels:
      score >= 5 -> "high"
      score >= 3 -> "moderate"
      otherwise  -> "low"

    Parameters:
        humidity_avg: Average relative humidity percentage [0, 100].
        rain_72h_mm: Forecast rainfall in mm over 72 hours [>= 0].
        temp_avg: Average forecast temperature in °C [-20, 60].
        severity: One of 'trace', 'mild', 'moderate', 'severe'.
        pathogen_type: Pathogen classification string (e.g. 'T1', 'T2', 'T7', 'other').

    Returns:
        Dict with keys:
          'level': str ("low", "moderate", "high")
          'score': int (0 to 7)
          'reasons': list of contributing machine-readable reason strings

    Raises:
        ValueError: For any invalid, out-of-range, NaN, or non-finite inputs.
    """
    # Validation: humidity_avg
    try:
        h = float(humidity_avg)
    except (TypeError, ValueError) as e:
        raise ValueError(
            f"Invalid humidity_avg: {humidity_avg}. Must be a numeric value between 0 and 100."
        ) from e
    if math.isnan(h) or math.isinf(h):
        raise ValueError(f"humidity_avg must be a finite number, got {humidity_avg}")
    if not (0.0 <= h <= 100.0):
        raise ValueError(f"humidity_avg must be between 0 and 100, got {humidity_avg}")

    # Validation: rain_72h_mm
    try:
        r = float(rain_72h_mm)
    except (TypeError, ValueError) as e:
        raise ValueError(
            f"Invalid rain_72h_mm: {rain_72h_mm}. Must be a numeric value >= 0."
        ) from e
    if math.isnan(r) or math.isinf(r):
        raise ValueError(f"rain_72h_mm must be a finite number, got {rain_72h_mm}")
    if r < 0.0:
        raise ValueError(f"rain_72h_mm must be >= 0, got {rain_72h_mm}")

    # Validation: temp_avg
    try:
        t = float(temp_avg)
    except (TypeError, ValueError) as e:
        raise ValueError(
            f"Invalid temp_avg: {temp_avg}. Must be a numeric value between -20 and 60."
        ) from e
    if math.isnan(t) or math.isinf(t):
        raise ValueError(f"temp_avg must be a finite number, got {temp_avg}")
    if not (-20.0 <= t <= 60.0):
        raise ValueError(f"temp_avg must be between -20 and 60 °C, got {temp_avg}")

    # Validation: severity
    if not isinstance(severity, str):
        raise ValueError(f"severity must be a string, got {type(severity).__name__}")
    sev = severity.strip().lower()
    if sev not in VALID_SEVERITIES:
        raise ValueError(
            f"Invalid severity: '{severity}'. Must be one of: {', '.join(sorted(VALID_SEVERITIES))}"
        )

    # Validation: pathogen_type
    if not isinstance(pathogen_type, str):
        raise ValueError(
            f"pathogen_type must be a string, got {type(pathogen_type).__name__}"
        )
    pt = pathogen_type.strip()

    # Calculation
    score = 0
    reasons: List[str] = []

    # 1. Humidity
    if h > 80.0:
        score += 2
        reasons.append(f"humidity_{_format_num(h)}pct")
    elif h > 65.0:
        score += 1
        reasons.append("humidity_above_65pct")

    # 2. Rainfall
    if r > 15.0:
        score += 2
        reasons.append(f"rainfall_forecast_{_format_num(r)}mm")
    elif r > 5.0:
        score += 1
        reasons.append("rainfall_forecast_above_5mm")

    # 3. Temperature
    if 20.0 <= t <= 30.0:
        score += 1
        reasons.append(f"temperature_{_format_num(t)}C")

    # 4. Severity
    if sev in ("moderate", "severe"):
        score += 1
        reasons.append(f"severity_{sev}")

    # 5. Pathogen
    if pt in SUSCEPTIBLE_PATHOGENS:
        score += 1
        reasons.append(f"susceptible_pathogen_{pt}")

    # Risk level determination
    if score >= 5:
        level = "high"
    elif score >= 3:
        level = "moderate"
    else:
        level = "low"

    return {
        "level": level,
        "score": score,
        "reasons": reasons,
    }


if __name__ == "__main__":
    print("=" * 65)
    print("PattaPe / SIH26131 - 72-Hour Disease Risk Engine Tests")
    print("=" * 65)

    all_passed = True

    # -------------------------------------------------------------
    # 1. Required Scenario Test Cases
    # -------------------------------------------------------------
    print("\n--- Required Scenario Test Cases ---")
    scenarios = [
        {
            "name": "1. Low risk baseline",
            "inputs": (50, 0, 18, "trace", "other"),
            "expected_score": 0,
            "expected_level": "low",
        },
        {
            "name": "2. Moderate humidity & rain, cool temp (Expected: low)",
            "inputs": (70, 10, 18, "mild", "other"),
            "expected_score": 2,
            "expected_level": "low",
        },
        {
            "name": "3. Moderate risk (humidity + rain + temp)",
            "inputs": (70, 10, 25, "mild", "other"),
            "expected_score": 3,
            "expected_level": "moderate",
        },
        {
            "name": "4. High risk full breakdown",
            "inputs": (88, 18, 25, "moderate", "T1"),
            "expected_score": 7,
            "expected_level": "high",
        },
        {
            "name": "5. Severe but otherwise dry",
            "inputs": (50, 0, 18, "severe", "other"),
            "expected_score": 1,
            "expected_level": "low",
        },
    ]

    for sc in scenarios:
        res = calculate_risk(*sc["inputs"])
        score_ok = res["score"] == sc["expected_score"]
        level_ok = res["level"] == sc["expected_level"]
        passed = score_ok and level_ok
        if not passed:
            all_passed = False
        status = "PASS" if passed else "FAIL"
        print(
            f"[{status}] {sc['name']}\n"
            f"       Inputs: {sc['inputs']}\n"
            f"       Result: score={res['score']} (exp {sc['expected_score']}), "
            f"level={res['level']} (exp {sc['expected_level']})\n"
            f"       Reasons: {res['reasons']}"
        )
        assert score_ok, f"Score mismatch: {res['score']} != {sc['expected_score']}"
        assert level_ok, f"Level mismatch: {res['level']} != {sc['expected_level']}"

    # Verify reasons in Full Example 4
    ex4_res = calculate_risk(88, 18, 25, "moderate", "T1")
    expected_reasons = [
        "humidity_88pct",
        "rainfall_forecast_18mm",
        "temperature_25C",
        "severity_moderate",
        "susceptible_pathogen_T1",
    ]
    assert ex4_res["reasons"] == expected_reasons, (
        f"Reasons mismatch in Example 4: {ex4_res['reasons']} != {expected_reasons}"
    )

    # -------------------------------------------------------------
    # 2. Exact Threshold Boundary Tests
    # -------------------------------------------------------------
    print("\n--- Exact Threshold Boundary Tests ---")

    # Humidity: 65 -> 0, 65.01 -> +1, 80 -> +1, 80.01 -> +2
    print("\n[Humidity Thresholds (rain=0, temp=10, sev=trace, path=other)]")
    h_tests = [(65.0, 0), (65.01, 1), (80.0, 1), (80.01, 2)]
    for val, exp_pts in h_tests:
        r = calculate_risk(val, 0, 10, "trace", "other")
        passed = r["score"] == exp_pts
        if not passed:
            all_passed = False
        print(f"[{'PASS' if passed else 'FAIL'}] humidity={val} -> points: {r['score']} (expected: {exp_pts})")
        assert passed

    # Rainfall: 5 -> 0, 5.01 -> +1, 15 -> +1, 15.01 -> +2
    print("\n[Rainfall Thresholds (humidity=50, temp=10, sev=trace, path=other)]")
    rain_tests = [(5.0, 0), (5.01, 1), (15.0, 1), (15.01, 2)]
    for val, exp_pts in rain_tests:
        r = calculate_risk(50, val, 10, "trace", "other")
        passed = r["score"] == exp_pts
        if not passed:
            all_passed = False
        print(f"[{'PASS' if passed else 'FAIL'}] rain_72h_mm={val} -> points: {r['score']} (expected: {exp_pts})")
        assert passed

    # Temperature: 19.99 -> 0, 20 -> +1, 30 -> +1, 30.01 -> 0
    print("\n[Temperature Thresholds (humidity=50, rain=0, sev=trace, path=other)]")
    temp_tests = [(19.99, 0), (20.0, 1), (30.0, 1), (30.01, 0)]
    for val, exp_pts in temp_tests:
        r = calculate_risk(50, 0, val, "trace", "other")
        passed = r["score"] == exp_pts
        if not passed:
            all_passed = False
        print(f"[{'PASS' if passed else 'FAIL'}] temp_avg={val} -> points: {r['score']} (expected: {exp_pts})")
        assert passed

    # Severity: trace -> 0, mild -> 0, moderate -> +1, severe -> +1
    print("\n[Severity Thresholds (humidity=50, rain=0, temp=10, path=other)]")
    sev_tests = [("trace", 0), ("mild", 0), ("moderate", 1), ("severe", 1)]
    for val, exp_pts in sev_tests:
        r = calculate_risk(50, 0, 10, val, "other")
        passed = r["score"] == exp_pts
        if not passed:
            all_passed = False
        print(f"[{'PASS' if passed else 'FAIL'}] severity='{val}' -> points: {r['score']} (expected: {exp_pts})")
        assert passed

    # Pathogen: other -> 0, T1 -> +1, T2 -> +1, T7 -> +1
    print("\n[Pathogen Thresholds (humidity=50, rain=0, temp=10, sev=trace)]")
    path_tests = [("other", 0), ("T1", 1), ("T2", 1), ("T7", 1)]
    for val, exp_pts in path_tests:
        r = calculate_risk(50, 0, 10, "trace", val)
        passed = r["score"] == exp_pts
        if not passed:
            all_passed = False
        print(f"[{'PASS' if passed else 'FAIL'}] pathogen_type='{val}' -> points: {r['score']} (expected: {exp_pts})")
        assert passed

    # -------------------------------------------------------------
    # 3. Input Validation Tests
    # -------------------------------------------------------------
    print("\n--- Input Validation Error Tests ---")
    invalid_cases = [
        ((-1, 0, 25, "trace", "other"), "humidity < 0"),
        ((100.1, 0, 25, "trace", "other"), "humidity > 100"),
        ((float("nan"), 0, 25, "trace", "other"), "humidity NaN"),
        ((float("inf"), 0, 25, "trace", "other"), "humidity inf"),
        ((50, -0.1, 25, "trace", "other"), "rain < 0"),
        ((50, float("nan"), 25, "trace", "other"), "rain NaN"),
        ((50, float("inf"), 25, "trace", "other"), "rain inf"),
        ((50, 0, -20.1, "trace", "other"), "temp < -20"),
        ((50, 0, 60.1, "trace", "other"), "temp > 60"),
        ((50, 0, float("nan"), "trace", "other"), "temp NaN"),
        ((50, 0, float("inf"), "trace", "other"), "temp inf"),
        ((50, 0, 25, "invalid_sev", "other"), "unknown severity"),
        ((50, 0, 25, 123, "other"), "non-string severity"),
        ((50, 0, 25, "trace", 456), "non-string pathogen_type"),
    ]

    for args, desc in invalid_cases:
        try:
            calculate_risk(*args)
            print(f"[FAIL] Expected ValueError for {desc}, but none was raised.")
            all_passed = False
        except ValueError as err:
            print(f"[PASS] Correctly rejected {desc}: {err}")

    print("\n" + "=" * 65)
    if all_passed:
        print("ALL SCENARIO, BOUNDARY, AND VALIDATION TESTS PASSED!")
    else:
        print("SOME TESTS FAILED!")
    print("=" * 65)
