from .i18n_engine import translate


def test_english_translation():
    assert translate("advisory.disease.high", "en")


def test_hindi_translation():
    assert translate("advisory.disease.high", "hi")


def test_unsupported_language_falls_back_to_english():
    assert translate("advisory.disease.high", "fr") == translate(
        "advisory.disease.high", "en"
    )


def test_missing_key_returns_key():
    assert translate("missing.key", "en") == "missing.key"


def test_none_key_is_safe():
    assert translate(None, "en") == ""
