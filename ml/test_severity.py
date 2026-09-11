from .severity_engine import calculate_severity


def test_low_severity():
    assert calculate_severity("healthy", 0.2, 5) == "low"


def test_moderate_severity():
    assert calculate_severity("rust", 0.5, 25) == "moderate"


def test_high_severity():
    assert calculate_severity("rust", 0.75, 50) == "high"


def test_critical_severity():
    assert calculate_severity("rust", 0.9, 75) == "critical"


def test_percentage_confidence_is_supported():
    assert calculate_severity("rust", 90, 0) == "critical"


def test_malformed_values_do_not_crash():
    assert calculate_severity(None, "invalid", None) == "low"
