"""
backend/app/services/i18n_engine.py

Adapter for i18n lookups used by predict_service.py.

predict_service.py imports:
    from app.services.i18n_engine import get_crop_labels, get_disease_labels

Returns dicts with 'en', 'hi', 'ta' keys matching CONTRACT.md schema.
"""

from __future__ import annotations
from typing import Dict

# Crop i18n — all five CONTRACT-valid crops
CROP_LABELS: Dict[str, Dict[str, str]] = {
    "rice":      {"en": "Rice",       "hi": "धान",       "ta": "நெல்"},
    "chilli":    {"en": "Chilli",     "hi": "मिर्च",     "ta": "மிளகாய்"},
    "banana":    {"en": "Banana",     "hi": "केला",      "ta": "வாழை"},
    "groundnut": {"en": "Groundnut",  "hi": "मूंगफली",   "ta": "வேர்க்கடலை"},
    "sugarcane": {"en": "Sugarcane",  "hi": "गन्ना",     "ta": "கரும்பு"},
}

# Disease i18n — all 36 classes from classes.json
DISEASE_LABELS: Dict[str, Dict[str, str]] = {
    # Rice (10)
    "rice__bacterial_leaf_blight":    {"en": "Bacterial Leaf Blight",   "hi": "जीवाणु पत्ती झुलसा",     "ta": "பாக்டீரியா இலை கருகல்"},
    "rice__bacterial_leaf_streak":    {"en": "Bacterial Leaf Streak",   "hi": "जीवाणु पत्ती धारी",      "ta": "பாக்டீரியா இலை வரி நோய்"},
    "rice__bacterial_panicle_blight": {"en": "Bacterial Panicle Blight","hi": "जीवाणु मंजरी झुलसा",     "ta": "பாக்டீரியா கதிர் கருகல்"},
    "rice__blast":                    {"en": "Blast",                   "hi": "ब्लास्ट (झोंका)",         "ta": "பிளாஸ்ட் நோய்"},
    "rice__brown_spot":               {"en": "Brown Spot",              "hi": "भूरा धब्बा",              "ta": "பழுப்பு இலைப்புள்ளி"},
    "rice__dead_heart":               {"en": "Dead Heart",              "hi": "डेड हार्ट",               "ta": "செத்த மையம்"},
    "rice__downy_mildew":             {"en": "Downy Mildew",            "hi": "मृदुरोमिल आसिता",         "ta": "பஞ்சு தூள் நோய்"},
    "rice__hispa":                    {"en": "Hispa",                   "hi": "हिस्पा",                  "ta": "ஹிஸ்பா"},
    "rice__normal":                   {"en": "Healthy",                 "hi": "स्वस्थ",                  "ta": "ஆரோக்கியமான"},
    "rice__tungro":                   {"en": "Tungro",                  "hi": "टुंग्रो वायरस",           "ta": "துங்க்ரோ நோய்"},

    # Chilli (6)
    "chilli__anthracnose":  {"en": "Anthracnose",  "hi": "एन्थ्राक्नोज",    "ta": "அன்த்ராக்னோஸ்"},
    "chilli__healthy":      {"en": "Healthy",      "hi": "स्वस्थ",          "ta": "ஆரோக்கியமான"},
    "chilli__leafcurl":     {"en": "Leaf Curl",    "hi": "पत्ती मरोड़",     "ta": "இலை சுருள்"},
    "chilli__leafspot":     {"en": "Leaf Spot",    "hi": "पत्ती धब्बा",     "ta": "இலைப்புள்ளி"},
    "chilli__whitefly":     {"en": "Whitefly",     "hi": "सफेद मक्खी",      "ta": "வெள்ளை ஈ"},
    "chilli__yellowish":    {"en": "Yellowing",    "hi": "पीलापन",          "ta": "மஞ்சள் நோய்"},

    # Banana (9)
    "banana__bract_mosaic_virus": {"en": "Bract Mosaic Virus",  "hi": "मोज़ेक वायरस",      "ta": "மொசைக் வைரஸ்"},
    "banana__cordana":            {"en": "Cordana Leaf Spot",   "hi": "कोर्डाना धब्बा",   "ta": "கோர்டானா புள்ளி"},
    "banana__healthy":            {"en": "Healthy",             "hi": "स्वस्थ",            "ta": "ஆரோக்கியமான"},
    "banana__insectpest":         {"en": "Insect Pest",         "hi": "कीट नाशक",         "ta": "பூச்சி தொல்லை"},
    "banana__moko":               {"en": "Moko Disease",        "hi": "मोको रोग",          "ta": "மோகோ நோய்"},
    "banana__panama":             {"en": "Panama Wilt",         "hi": "पनामा विल्ट",       "ta": "பனாமா வாடல்"},
    "banana__pestalotiopsis":     {"en": "Pestalotiopsis",      "hi": "पेस्टलोटियोप्सिस", "ta": "பெஸ்டலோட்டியோப்சிஸ்"},
    "banana__sigatoka":           {"en": "Sigatoka Leaf Spot",  "hi": "सिगाटोका धब्बा",   "ta": "சிகடோகா புள்ளி"},
    "banana__yb_sigatoka":        {"en": "Yellow Sigatoka",     "hi": "पीला सिगाटोका",    "ta": "மஞ்சள் சிகடோகா"},

    # Groundnut (6)
    "groundnut__early_leaf_spot":      {"en": "Early Leaf Spot",       "hi": "अगेती टिक्का",    "ta": "ஆரம்ப இலைப்புள்ளி"},
    "groundnut__early_rust":           {"en": "Early Rust",            "hi": "अगेती गेरुई",     "ta": "ஆரம்ப துரு"},
    "groundnut__healthy":              {"en": "Healthy",               "hi": "स्वस्थ",          "ta": "ஆரோக்கியமான"},
    "groundnut__late_leaf_spot":       {"en": "Late Leaf Spot",        "hi": "पछेती टिक्का",    "ta": "பிற்கால இலைப்புள்ளி"},
    "groundnut__nutrition_deficiency": {"en": "Nutrition Deficiency",  "hi": "पोषण की कमी",    "ta": "ஊட்டச்சத்து குறைபாடு"},
    "groundnut__rust":                 {"en": "Rust",                  "hi": "गेरुई",           "ta": "துரு நோய்"},

    # Sugarcane (5)
    "sugarcane__healthy": {"en": "Healthy",       "hi": "स्वस्थ",     "ta": "ஆரோக்கியமான"},
    "sugarcane__mosaic":  {"en": "Mosaic",         "hi": "मोज़ेक",     "ta": "மொசைக் நோய்"},
    "sugarcane__redrot":  {"en": "Red Rot",        "hi": "लाल सड़न",    "ta": "சிவப்பு அழுகல்"},
    "sugarcane__rust":    {"en": "Rust",           "hi": "गेरुई",      "ta": "துரு நோய்"},
    "sugarcane__yellow":  {"en": "Yellow Disease", "hi": "पीला रोग",   "ta": "மஞ்சள் நோய்"},
}

_DEFAULT_DISEASE = {"en": "Unknown Disease", "hi": "अज्ञात रोग", "ta": "தெரியாத நோய்"}
_DEFAULT_CROP = {"en": "Unknown Crop", "hi": "अज्ञात फसल", "ta": "தெரியாத பயிர்"}


def get_crop_labels(crop: str) -> Dict[str, str]:
    """
    Return i18n dict for a crop key.
    Falls back to English-only if crop not found.
    """
    key = str(crop).strip().lower()
    return CROP_LABELS.get(key, dict(_DEFAULT_CROP))


def get_disease_labels(disease: str) -> Dict[str, str]:
    """
    Return i18n dict for a disease class key (full key like 'rice__blast' or short key).
    Tries both the exact key and a prefix-stripped version.
    Falls back to English-only if disease not found.
    """
    key = str(disease).strip().lower()

    # Direct lookup (e.g. 'rice__blast')
    if key in DISEASE_LABELS:
        return DISEASE_LABELS[key]

    # Try to match by partial suffix (e.g. 'blast' in 'rice__blast')
    for full_key, labels in DISEASE_LABELS.items():
        if full_key.endswith(f"__{key}"):
            return labels

    return dict(_DEFAULT_DISEASE)
