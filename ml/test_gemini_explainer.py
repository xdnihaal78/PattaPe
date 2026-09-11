from .gemini_explainer import build_gemini_explanation


def test_none_returns_none():
    assert build_gemini_explanation(None) is None


def test_valid_response_is_normalized():
    raw = {
        "agreement": True,
        "explanation": "The diagnosis appears consistent.",
        "alternative_diagnosis": "Leaf spot",
        "unexpected_field": "remove me",
    }

    result = build_gemini_explanation(raw)

    assert result == {
        "agreement": True,
        "explanation": "The diagnosis appears consistent.",
        "alternative_diagnosis": "Leaf spot",
    }


def test_malformed_response_is_safe():
    result = build_gemini_explanation("invalid")

    assert result == {
        "agreement": False,
        "explanation": "",
        "alternative_diagnosis": None,
    }
