from .advisory_engine import get_advisory


def test_advisory_is_a_string():
    result = get_advisory("rust", "high", "tomato", "en")

    assert isinstance(result, str)
    assert result


def test_advisory_contains_crop():
    result = get_advisory("rust", "high", "tomato", "en")

    assert "tomato" in result


def test_unknown_values_are_safe():
    result = get_advisory(None, None, None, None)

    assert isinstance(result, str)
    assert result
