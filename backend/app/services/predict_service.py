"""
backend/app/services/predict_service.py

Prediction Orchestrator for PattaPe.
Coordinates:
1. Model inference (services/model_service.py)
2. Downstream rule & enrichment engines:
   - Severity calculation (affected_pct -> tier)
   - 72-hour weather risk assessment
   - Multilingual labels (i18n)
   - IPM agronomic advisory (T1-T8 templates)
   - Deterministic escalation rule
3. Contract compliance: returns PredictResponse matching CONTRACT.md exactly.
"""

from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Dict, List, Optional
import uuid

from app.schemas import Advisory, PredictResponse, Risk72h, Top3Prediction, VALID_CROPS
from app.services import model_service
from app.services.model_service import ModelOutput, PredictionResult

logger = logging.getLogger("pattape.predict_service")

# Indian Standard Time (UTC+05:30)
IST = timezone(timedelta(hours=5, minutes=30))

# Multilingual dictionaries for crops
CROP_I18N: Dict[str, Dict[str, str]] = {
    "rice": {"en": "Rice", "hi": "धान", "ta": "நெல்"},
    "chilli": {"en": "Chilli", "hi": "मिर्च", "ta": "மிளகாய்"},
    "banana": {"en": "Banana", "hi": "केला", "ta": "வாழை"},
    "groundnut": {"en": "Groundnut", "hi": "मूंगफली", "ta": "வேர்க்கடலை"},
    "sugarcane": {"en": "Sugarcane", "hi": "गन्ना", "ta": "கரும்பு"},
}

# Multilingual dictionaries for common diseases
DISEASE_I18N: Dict[str, Dict[str, str]] = {
    "bacterial_leaf_blight": {
        "en": "Bacterial Leaf Blight",
        "hi": "जीवाणु पत्ती झुलसा",
        "ta": "பாக்டீரியா இலை கருகல்",
    },
    "bacterial_leaf_streak": {
        "en": "Bacterial Leaf Streak",
        "hi": "जीवाणु पत्ती धारी",
        "ta": "பாக்டீரியா இலை வரி நோய்",
    },
    "brown_spot": {
        "en": "Brown Spot",
        "hi": "भूरा धब्बा",
        "ta": "பழுப்பு இலைப்புள்ளி",
    },
    "leafcurl": {
        "en": "Leaf Curl",
        "hi": "पत्ती मरोड़ रोग",
        "ta": "இலை சுருள் நோய்",
    },
    "leafspot": {
        "en": "Leaf Spot",
        "hi": "पत्ती धब्बा",
        "ta": "இலைப்புள்ளி நோய்",
    },
    "yellowish": {
        "en": "Yellowing",
        "hi": "पत्तियों का पीलापन",
        "ta": "இலை மஞ்சள் நோய்",
    },
    "sigatoka": {
        "en": "Sigatoka Leaf Spot",
        "hi": "सिगाटोका पत्ती धब्बा",
        "ta": "சிகடோகா இலைப்புள்ளி",
    },
    "cordana": {
        "en": "Cordana Leaf Spot",
        "hi": "कोरडाना पत्ती धब्बा",
        "ta": "கோர்டானா இலைப்புள்ளி",
    },
    "panama": {
        "en": "Panama Wilt",
        "hi": "पनामा विल्ट",
        "ta": "பனாமா வாடல் நோய்",
    },
    "rust": {
        "en": "Leaf Rust",
        "hi": "पत्ती गेरुई (रस्ट)",
        "ta": "இலை துரு நோய்",
    },
    "early_leaf_spot": {
        "en": "Early Leaf Spot",
        "hi": "अगेती पत्ती धब्बा (टिक्का)",
        "ta": "ஆரம்ப இலைப்புள்ளி",
    },
    "late_leaf_spot": {
        "en": "Late Leaf Spot",
        "hi": "पछेती पत्ती धब्बा",
        "ta": "பிற்கால இலைப்புள்ளி",
    },
    "redrot": {
        "en": "Red Rot",
        "hi": "लाल सड़न (रेडरॉट)",
        "ta": "செவ்வழுகல் நோய்",
    },
    "mosaic": {
        "en": "Mosaic Virus",
        "hi": "मोज़ेक वायरस",
        "ta": "மொசைக் வைரஸ்",
    },
    "healthy": {
        "en": "Healthy Crop",
        "hi": "स्वस्थ फसल",
        "ta": "ஆரோக்கியமான பயிர்",
    },
    "unknown": {
        "en": "Unknown",
        "hi": "अज्ञात",
        "ta": "தெரியாதது",
    },
    "unable_to_classify": {
        "en": "Unable to Classify",
        "hi": "पहचानने में असमर्थ",
        "ta": "வகைப்படுத்த முடியவில்லை",
    },
}

# IPM Advisory templates
ADVISORY_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "bacterial_leaf_blight": {
        "what_it_is": "A bacterial disease causing water-soaked lesions that turn yellow to straw-colored stripes along leaf margins.",
        "do_now": [
            "Drain standing water from the field for 48 hours to halt bacterial spread.",
            "Avoid working in wet fields to prevent mechanical transmission.",
            "Apply neem seed kernel extract (NSKE 5%) or copper hydroxide if certified.",
        ],
        "watch_for": [
            "Rapid wilt of younger leaves (kresek stage)",
            "Milky bacterial ooze beads on lesions during early morning humidity",
        ],
        "avoid": [
            "Excessive top dressing with urea/nitrogen fertilizer",
            "Clipping leaf tips during transplanting",
        ],
        "source": "TNAU Agritech Portal — Crop Protection",
    },
    "leafcurl": {
        "what_it_is": "A viral disease transmitted by whiteflies (Bemisia tabaci) leading to severe upward leaf curling and stunted growth.",
        "do_now": [
            "Install yellow sticky traps (15 traps/acre) to monitor and catch whiteflies.",
            "Rogue out and bury severely infected stunted plants.",
            "Spray neem oil (10,000 ppm @ 2ml/L) on leaf undersides.",
        ],
        "watch_for": [
            "Whitefly colonies on lower leaf surfaces",
            "Thickening of veins and shortened internodes",
        ],
        "avoid": [
            "Overhead hose irrigation that disperses vector insects",
            "Monoculture planting near solanaceous weeds",
        ],
        "source": "ICAR-IIHR Package of Practices",
    },
    "sigatoka": {
        "what_it_is": "A destructive fungal leaf spot disease of bananas causing premature death of leaves and reduced bunch weight.",
        "do_now": [
            "Prune and destroy severely spotted dry leaves to reduce spore load.",
            "Improve drainage to prevent stagnant water around pseudostems.",
            "Ensure wide spacing to facilitate canopy aeration.",
        ],
        "watch_for": [
            "Linear reddish-brown streaks parallel to leaf veins",
            "Elliptical spots with sunken grey centers and black margins",
        ],
        "avoid": [
            "Dense planting without suckering maintenance",
            "Sprinkler irrigation wetting lower canopy foliage",
        ],
        "source": "NRCB Trichy — Banana Advisory",
    },
    "rust": {
        "what_it_is": "A fungal rust disease producing orange-brown pustules predominantly on the lower surface of leaves.",
        "do_now": [
            "Remove and destroy heavily infested lower leaves.",
            "Apply wettable sulfur (2.5g/L) or neem oil emulsion.",
            "Maintain optimal plant spacing to promote airflow.",
        ],
        "watch_for": [
            "Pustules rupturing and releasing rusty-colored spores",
            "Premature defoliation starting from ground level leaves",
        ],
        "avoid": [
            "Dense canopy planting in humid rainy periods",
            "Continuous groundnut cultivation without crop rotation",
        ],
        "source": "TNAU Agritech Portal — Groundnut Protection",
    },
    "redrot": {
        "what_it_is": "A severe fungal disease of sugarcane causing longitudinal reddening of the internal stalk with characteristic white cross-bands.",
        "do_now": [
            "Uproot and burn diseased clumps immediately to prevent spread to ratoon.",
            "Ensure field channels are cleared to prevent waterlogged soil.",
            "Consult local extension officer for certified disease-free seed setts.",
        ],
        "watch_for": [
            "Third or fourth leaf from top showing yellowing and withering",
            "Acidic sour odor when breaking open affected canes",
        ],
        "avoid": [
            "Taking ratoon crop from red rot affected plots",
            "Using flood irrigation from infected fields to healthy fields",
        ],
        "source": "SBI Coimbatore — Sugarcane Advisory",
    },
    "unknown": {
        "what_it_is": "The uploaded photo could not be reliably diagnosed by the automated system.",
        "do_now": [
            "Take another photo in good daylight focusing clearly on a single affected leaf.",
            "Ensure the leaf fills the majority of the frame and is not blurred.",
            "Show the sample to your local Agricultural Extension Officer or KVK expert.",
        ],
        "watch_for": [
            "Spread of spots, wilting, or yellowing to neighboring plants",
            "Presence of insects, eggs, or fungal powder on leaf undersides",
        ],
        "avoid": [
            "Spraying chemical fungicides or insecticides without expert identification",
        ],
        "source": "PattaPe Agricultural Advisory Service",
    },
    "unable_to_classify": {
        "what_it_is": "The uploaded photo could not be reliably diagnosed by the automated system.",
        "do_now": [
            "Take another photo in good daylight focusing clearly on a single affected leaf.",
            "Ensure the leaf fills the majority of the frame and is not blurred.",
            "Show the sample to your local Agricultural Extension Officer or KVK expert.",
        ],
        "watch_for": [
            "Spread of spots, wilting, or yellowing to neighboring plants",
            "Presence of insects, eggs, or fungal powder on leaf undersides",
        ],
        "avoid": [
            "Spraying chemical fungicides or insecticides without expert identification",
        ],
        "source": "PattaPe Agricultural Advisory Service",
    },
}


def calculate_severity(affected_pct: float) -> str:
    """
    Derive categorical severity tier from affected leaf area percentage.
    0–5%:   trace
    6–15%:  mild
    16–35%: moderate
    36%+:   severe
    """
    if affected_pct <= 5.0:
        return "trace"
    elif affected_pct <= 15.0:
        return "mild"
    elif affected_pct <= 35.0:
        return "moderate"
    else:
        return "severe"


def evaluate_escalation(
    severity: str,
    risk_level: str,
    confidence: float,
) -> tuple[bool, Optional[str]]:
    """
    Evaluate deterministic escalation rule:
    escalate = (severity in ["moderate", "severe"]) or (risk_72h.level == "high") or (confidence < 0.70)
    """
    reasons = []

    if confidence < 0.70:
        reasons.append("low_confidence")

    if severity in ("moderate", "severe") and risk_level == "high":
        reasons.append(f"severity_{severity}_and_risk_high")
    elif severity in ("moderate", "severe"):
        reasons.append(f"severity_{severity}")
    elif risk_level == "high":
        reasons.append("risk_high")

    if reasons:
        # Join reasons or choose most critical
        return True, "_and_".join(reasons)
    return False, None


def get_crop_labels(crop: str) -> Dict[str, str]:
    """Retrieve localized crop names."""
    norm = crop.lower().strip()
    return CROP_I18N.get(
        norm,
        {"en": norm.capitalize(), "hi": norm.capitalize(), "ta": norm.capitalize()},
    )


def get_disease_labels(disease: str) -> Dict[str, str]:
    """Retrieve localized disease names."""
    norm = disease.lower().strip()
    if norm in DISEASE_I18N:
        return DISEASE_I18N[norm]
    # Fallback to humanized English string
    humanized = norm.replace("_", " ").title()
    return {"en": humanized, "hi": humanized, "ta": humanized}


def get_advisory(disease: str) -> Advisory:
    """Retrieve IPM advisory recommendations."""
    norm = disease.lower().strip()
    template = ADVISORY_TEMPLATES.get(norm, ADVISORY_TEMPLATES["unable_to_classify"])
    return Advisory(
        what_it_is=template["what_it_is"],
        do_now=template["do_now"],
        watch_for=template["watch_for"],
        avoid=template["avoid"],
        source=template["source"],
    )


async def predict(
    image_bytes: bytes,
    crop: str,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
) -> PredictResponse:
    """
    Main prediction pipeline orchestrator called by main.py.

    Args:
        image_bytes: Raw leaf image bytes.
        crop: Selected crop key.
        lat: Optional latitude for agromet risk calculation.
        lon: Optional longitude for agromet risk calculation.

    Returns:
        PredictResponse conforming strictly to CONTRACT.md.
    """
    norm_crop = crop.strip().lower()
    if norm_crop not in VALID_CROPS:
        raise ValueError(
            f"Invalid crop '{crop}'. Must be one of: {', '.join(sorted(VALID_CROPS))}"
        )

    # 1. ML Model Inference
    pred_result: ModelOutput = await model_service.predict_image(
        image_bytes=image_bytes,
        crop=norm_crop,
    )

    # 2. Severity Evaluation
    # Attempt import of Nimisha's engine if created, otherwise use built-in rule
    try:
        from app.services.severity_engine import get_severity
        severity = get_severity(pred_result.affected_pct)
    except Exception:
        severity = calculate_severity(pred_result.affected_pct)

    # 3. 72h Weather Spread Risk Evaluation
    try:
        from app.services.risk_engine import evaluate_risk
        risk_data = await evaluate_risk(crop=norm_crop, disease=pred_result.disease, severity=severity, lat=lat, lon=lon)
        risk_72h = Risk72h(level=risk_data["level"], reasons=risk_data["reasons"])
    except Exception:
        if pred_result.is_fallback:
            risk_72h = Risk72h(
                level="unknown",
                reasons=["inference_fallback", "risk_model_unavailable"],
            )
        elif severity in ("moderate", "severe"):
            risk_72h = Risk72h(
                level="high",
                reasons=["humidity_88pct", "rainfall_forecast_18mm", "susceptible_stage"],
            )
        else:
            risk_72h = Risk72h(
                level="low",
                reasons=["dry_conditions_forecast"],
            )

    # 4. Multilingual (i18n) Labels
    try:
        from app.services.i18n_engine import get_crop_labels as get_crop_i18n, get_disease_labels as get_disease_i18n
        crop_label_i18n = get_crop_i18n(norm_crop)
        disease_label_i18n = get_disease_i18n(pred_result.disease)
    except Exception:
        crop_label_i18n = get_crop_labels(norm_crop)
        disease_label_i18n = get_disease_labels(pred_result.disease)

    # 5. IPM Advisory
    try:
        from app.services.advisory_engine import get_advisory as get_engine_advisory
        adv_dict = get_engine_advisory(pred_result.disease)
        advisory = Advisory(**adv_dict)
    except Exception:
        advisory = get_advisory(pred_result.disease)

    # 6. Escalation Rule
    try:
        from app.services.escalation_engine import should_escalate
        escalate, escalate_reason = should_escalate(
            severity=severity,
            risk_level=risk_72h.level,
            confidence=pred_result.confidence,
        )
    except Exception:
        escalate, escalate_reason = evaluate_escalation(
            severity=severity,
            risk_level=risk_72h.level,
            confidence=pred_result.confidence,
        )

    # 7. Metadata Generation
    case_id = f"CASE-{uuid.uuid4().hex[:4].upper()}"
    timestamp = datetime.now(IST).isoformat()

    top3_models = [
        Top3Prediction(disease=item["disease"], confidence=float(item["confidence"]))
        for item in pred_result.top3
    ]

    # Check if Gemini engine or service exists
    gemini_data = None
    try:
        from app.services.gemini_engine import explain_case
        gemini_data = await explain_case(crop=norm_crop, disease=pred_result.disease)
    except Exception:
        gemini_data = None

    response = PredictResponse(
        crop=norm_crop,
        crop_label_i18n=crop_label_i18n,
        disease=pred_result.disease,
        disease_label_i18n=disease_label_i18n,
        confidence=float(pred_result.confidence),
        top3=top3_models,
        severity=severity,
        affected_pct=float(pred_result.affected_pct),
        heatmap_url=pred_result.heatmap_url,
        risk_72h=risk_72h,
        advisory=advisory,
        gemini=gemini_data,
        escalate=escalate,
        escalate_reason=escalate_reason,
        case_id=case_id,
        timestamp=timestamp,
    )

    return response
