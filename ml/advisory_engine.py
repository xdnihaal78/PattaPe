"""Deterministic localized advisory generation."""

from __future__ import annotations

from .i18n_engine import translate


def get_advisory(
    disease: object = None,
    severity: object = None,
    crop: object = None,
    language: object = "en",
) -> str:
    """
    Return a localized recommendation.

    The returned value is always a string. Unknown or malformed inputs use a
    safe default recommendation.
    """
    disease_text = str(disease or "").strip().lower()
    severity_text = str(severity or "low").strip().lower()
    crop_text = str(crop or "").strip()

    if not disease_text or disease_text in {"healthy", "none", "unknown"}:
        message = translate("advisory.healthy.low", language)
    elif severity_text == "critical":
        message = translate("advisory.disease.critical", language)
    elif severity_text == "high":
        message = translate("advisory.disease.high", language)
    elif severity_text == "moderate":
        message = translate("advisory.disease.moderate", language)
    else:
        message = translate("advisory.healthy.low", language)

    if not message:
        message = translate("advisory.no_recommendation", language)

    if crop_text:
        if str(language or "en").lower().startswith("hi"):
            return f"{crop_text}: {message}"
        return f"{crop_text}: {message}"

    return message
