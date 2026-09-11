from .escalation_engine import determine_escalation


def test_low_severity_without_gemini_does_not_escalate():
    result = determine_escalation("low", None)

    assert result == {
        "escalate": False,
        "escalate_reason": "",
    }


def test_high_severity_escalates():
    result = determine_escalation("high", None)

    assert result["escalate"] is True
    assert result["escalate_reason"]


def test_gemini_disagreement_escalates():
    result = determine_escalation("low", {"agreement": False})

    assert result["escalate"] is True
    assert "Gemini" in result["escalate_reason"]


def test_both_reasons_are_combined():
    result = determine_escalation("critical", {"agreement": False})

    assert result["escalate"] is True
    assert ";" in result["escalate_reason"]


def test_missing_gemini_does_not_crash():
    result = determine_escalation("moderate", None)

    assert result["escalate"] is False
