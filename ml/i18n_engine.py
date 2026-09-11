"""Small deterministic localization engine with safe fallbacks."""

from __future__ import annotations


TRANSLATIONS = {
    "en": {
        "advisory.no_recommendation": "No recommendation available",
        "advisory.healthy.low": "Continue regular monitoring of the crop.",
        "advisory.disease.moderate": "Inspect the affected area and apply the recommended treatment.",
        "advisory.disease.high": "Take action soon and consult an agricultural expert.",
        "advisory.disease.critical": "Take immediate action and contact an agricultural expert.",
        "escalation.high_severity": "High or critical severity",
        "escalation.gemini_disagreement": "Gemini disagrees with the primary model",
    },
    "hi": {
        "advisory.no_recommendation": "सलाह उपलब्ध नहीं है",
        "advisory.healthy.low": "फसल की नियमित निगरानी जारी रखें।",
        "advisory.disease.moderate": "प्रभावित क्षेत्र की जांच करें और अनुशंसित उपचार लागू करें।",
        "advisory.disease.high": "जल्द कार्रवाई करें और कृषि विशेषज्ञ से सलाह लें।",
        "advisory.disease.critical": "तुरंत कार्रवाई करें और कृषि विशेषज्ञ से संपर्क करें।",
        "escalation.high_severity": "गंभीरता अधिक या अत्यंत गंभीर है",
        "escalation.gemini_disagreement": "Gemini प्राथमिक मॉडल से असहमत है",
    },
}


def translate(key: object, language: object = "en") -> str:
    """
    Translate a key.

    Fallback order:
    1. Requested language
    2. English
    3. The key itself
    """
    if key is None:
        return ""

    key_text = str(key)
    language_text = str(language or "en").lower().replace("_", "-")
    language_text = language_text.split("-")[0]

    requested = TRANSLATIONS.get(language_text, {})
    if key_text in requested:
        return requested[key_text]

    english = TRANSLATIONS.get("en", {})
    return english.get(key_text, key_text)
