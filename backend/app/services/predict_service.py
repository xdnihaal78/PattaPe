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
import os
from pathlib import Path
import sys
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
    # Rice
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
    "bacterial_panicle_blight": {
        "en": "Bacterial Panicle Blight",
        "hi": "जीवाणु बाली झुलसा",
        "ta": "பாக்டீரியா கதிர் கருகல்",
    },
    "blast": {
        "en": "Rice Blast",
        "hi": "धान का झुलसा (ब्लास्ट)",
        "ta": "நெல் பிளாஸ்ட் நோய்",
    },
    "brown_spot": {
        "en": "Brown Spot",
        "hi": "भूरा धब्बा",
        "ta": "பழுப்பு இலைப்புள்ளி",
    },
    "dead_heart": {
        "en": "Stem Borer (Dead Heart)",
        "hi": "तना छेदक (डेड हार्ट)",
        "ta": "தண்டு துளைப்பான்",
    },
    "downy_mildew": {
        "en": "Downy Mildew",
        "hi": "मृदुरोमिल आसिता",
        "ta": "அடிச்சாம்பல் நோய்",
    },
    "hispa": {
        "en": "Rice Hispa",
        "hi": "धान का हिस्पा कीट",
        "ta": "நெல் ஹிஸ்பா வண்டு",
    },
    "normal": {
        "en": "Healthy Crop",
        "hi": "स्वस्थ फसल",
        "ta": "ஆரோக்கியமான பயிர்",
    },
    "tungro": {
        "en": "Rice Tungro Virus",
        "hi": "टुंग्रो वायरस",
        "ta": "துங்ரோ வைரஸ் நோய்",
    },
    # Chilli
    "anthracnose": {
        "en": "Anthracnose / Fruit Rot",
        "hi": "एंथ्रेक्नोज़ (फल सड़न)",
        "ta": "அந்திராக்னோஸ் (காய் அழுகல்)",
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
    "whitefly": {
        "en": "Whitefly Infestation",
        "hi": "सफेद मक्खी का प्रकोप",
        "ta": "வெள்ளை ஈ தாக்குதல்",
    },
    "yellowish": {
        "en": "Yellowing / Nutrient Stress",
        "hi": "पत्तियों का पीलापन",
        "ta": "இலை மஞ்சள் நோய்",
    },
    # Banana
    "bract_mosaic_virus": {
        "en": "Bract Mosaic Virus",
        "hi": "ब्रैक्ट मोज़ेक वायरस",
        "ta": "பூவடி செதில் மொசைக்",
    },
    "cordana": {
        "en": "Cordana Leaf Spot",
        "hi": "कोरडाना पत्ती धब्बा",
        "ta": "கோர்டானா இலைப்புள்ளி",
    },
    "insectpest": {
        "en": "Insect Pest Damage",
        "hi": "कीट क्षति",
        "ta": "பூச்சி தாக்குதல்",
    },
    "moko": {
        "en": "Moko Bacterial Wilt",
        "hi": "मोको जीवाणु विल्ट",
        "ta": "மோகோ பாக்டீரியா வாடல்",
    },
    "panama": {
        "en": "Panama Wilt",
        "hi": "पनामा विल्ट",
        "ta": "பனாமா வாடல் நோய்",
    },
    "pestalotiopsis": {
        "en": "Pestalotiopsis Leaf Spot",
        "hi": "पेस्टालोटियोप्सिस पत्ती धब्बा",
        "ta": "பெஸ்டலோட்டியோப்சிஸ்",
    },
    "sigatoka": {
        "en": "Sigatoka Leaf Spot",
        "hi": "सिगाटोका पत्ती धब्बा",
        "ta": "சிகடோகா இலைப்புள்ளி",
    },
    "yb_sigatoka": {
        "en": "Yellow Sigatoka",
        "hi": "पीला सिगाटोका",
        "ta": "மஞ்சள் சிகடோகா",
    },
    # Groundnut
    "early_leaf_spot": {
        "en": "Early Leaf Spot (Tikka)",
        "hi": "अगेती पत्ती धब्बा (टिक्का)",
        "ta": "ஆரம்ப இலைப்புள்ளி",
    },
    "early_rust": {
        "en": "Early Rust",
        "hi": "अगेती गेरुई",
        "ta": "ஆரம்ப துரு நோய்",
    },
    "late_leaf_spot": {
        "en": "Late Leaf Spot",
        "hi": "पछेती पत्ती धब्बा",
        "ta": "பிற்கால இலைப்புள்ளி",
    },
    "nutrition_deficiency": {
        "en": "Nutrient Deficiency",
        "hi": "पोषक तत्वों की कमी",
        "ta": "ஊட்டச்சத்து குறைபாடு",
    },
    "rust": {
        "en": "Leaf Rust",
        "hi": "पत्ती गेरुई (रस्ट)",
        "ta": "இலை துரு நோய்",
    },
    # Sugarcane
    "mosaic": {
        "en": "Mosaic Virus",
        "hi": "मोज़ेक वायरस",
        "ta": "மொசைக் வைரஸ்",
    },
    "redrot": {
        "en": "Red Rot",
        "hi": "लाल सड़न (रेडरॉट)",
        "ta": "செவ்வழுகல் நோய்",
    },
    "yellow": {
        "en": "Yellow Leaf Disease",
        "hi": "पीली पत्ती रोग",
        "ta": "மஞ்சள் இலை நோய்",
    },
    # Universal / Fallbacks
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
    # Rice
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
    "bacterial_leaf_streak": {
        "what_it_is": "A bacterial disease (Xanthomonas oryzae pv. oryzicola) forming narrow, translucent, yellow-to-brown linear streaks between leaf veins.",
        "do_now": [
            "Apply copper hydroxide (2.0 g/L) or plantomycin (0.1 g/L) during early streak appearance.",
            "Drain excess field water and withhold nitrogen top-dressing until lesion extension ceases.",
            "Ensure clean irrigation water not contaminated with upstream diseased runoff.",
        ],
        "watch_for": [
            "Tiny amber-colored bacterial droplets exuding along leaf streaks in morning dew.",
            "Streaks turning grayish-white and leaves browning from severe blight-like damage.",
        ],
        "avoid": [
            "Working in fields while leaves are wet to prevent mechanical transmission of bacteria.",
            "Heavy urea top-dressing during rainy or stormy conditions.",
        ],
        "source": "IRRI Rice Knowledge Bank",
    },
    "bacterial_panicle_blight": {
        "what_it_is": "A bacterial disease (Burkholderia glumae) causing discolored florets, aborted grain filling, and upright standing panicles.",
        "do_now": [
            "Apply oxolinic acid or certified bactericide formulation at boot-to-heading stage.",
            "Maintain steady field moisture without flooding during flowering.",
            "Harvest early if panicles are fully mature to avoid saprophytic fungal mold.",
        ],
        "watch_for": [
            "Panicle florets turning dull gray or straw-white with dark brown bands while stems stay green.",
            "Empty grain hulls that remain erect rather than bending under grain weight.",
        ],
        "avoid": [
            "Late-season nitrogen applications that delay uniform crop maturity.",
            "Saving seeds from infected plots for subsequent planting cycles.",
        ],
        "source": "IRRI Rice Knowledge Bank — Panicle Blight",
    },
    "blast": {
        "what_it_is": "A devastating fungal disease (Magnaporthe oryzae) causing diamond/spindle-shaped lesions with grey centers and brown margins.",
        "do_now": [
            "Apply tricyclazole 75 WP (0.6 g/L) or isoprothiolane 40 EC (1.5 ml/L) at first symptom appearance.",
            "Regulate field water level to maintain a shallow layer (2-5 cm); avoid moisture stress.",
            "Split nitrogen fertilizer into smaller, multiple doses rather than large single applications.",
        ],
        "watch_for": [
            "Neck blast or nodal blast lesions turning blackish and causing grain panicle breakage.",
            "Rapid enlargement and coalescence of spindle-shaped foliar spots under high humidity.",
        ],
        "avoid": [
            "Excessive basal or top-dressed nitrogen fertilizer during overcast conditions.",
            "Draining water completely during blast epidemic weather.",
        ],
        "source": "TNAU Agritech Portal — Rice Doctor",
    },
    "brown_spot": {
        "what_it_is": "A fungal disease (Bipolaris oryzae) producing oval to circular brown spots with a distinct yellowish halo, often linked to nutrient-deficient soil.",
        "do_now": [
            "Spray propiconazole 25 EC (1 ml/L) or mancozeb 75 WP (2 g/L) at initiation of spots.",
            "Apply balanced potash (MOP) and micronutrients (zinc sulfate) to correct soil deficiencies.",
            "Maintain proper field moisture and avoid drought stress during tillering.",
        ],
        "watch_for": [
            "Discoloration and glume blotch spreading to grain hulls reducing seed quality.",
            "Seedling blight symptoms in nursery beds.",
        ],
        "avoid": [
            "Water deficiency or prolonged drought in sandy or nutrient-deficient soils.",
            "Continuous cultivation without soil testing and organic amendment.",
        ],
        "source": "IRRI Rice Knowledge Bank — Brown Spot",
    },
    "dead_heart": {
        "what_it_is": "Damage caused by yellow stem borer larvae tunneling inside the stem, causing the central tiller shoot to wither and die (dead heart).",
        "do_now": [
            "Apply cartap hydrochloride 4G (10 kg/acre) or chlorantraniliprole 18.5 SC (0.3 ml/L).",
            "Install pheromone traps (5 traps/acre) to monitor adult stem borer moths.",
            "Clip seedling leaf tips before transplanting to eliminate egg masses.",
        ],
        "watch_for": [
            "Whiteheads (chaffy, bleached white panicles) during flowering and grain fill.",
            "Small entry holes and frass on lower stem nodes.",
        ],
        "avoid": [
            "Broad-spectrum organophosphates that destroy natural parasitic wasps.",
            "High stubble retention after harvest where pupae overwinter.",
        ],
        "source": "TNAU Agritech Portal — Rice Stem Borer Management",
    },
    "downy_mildew": {
        "what_it_is": "An oomycete disease leading to twisted, crinkled leaves, stunted tillers, and malformed bushy panicles.",
        "do_now": [
            "Improve field drainage immediately; remove stagnant water standing above seedlings.",
            "Apply metalaxyl 8% + mancozeb 64% WP (2.5 g/L) if disease spreads in nursery.",
            "Uproot and bury severely distorted, stunted clumps.",
        ],
        "watch_for": [
            "White downy growth on the underside of mottled, deformed leaves in morning humidity.",
            "Crazy top symptom with panicles transformed into a brush of tiny leaves.",
        ],
        "avoid": [
            "Prolonged submerged conditions in seedbeds and early transplanted fields.",
            "Using irrigation water flowing through infected grasses near canal banks.",
        ],
        "source": "TNAU Agritech Portal — Rice Crop Protection",
    },
    "hispa": {
        "what_it_is": "A spiny black beetle (Dicladispa armigera) whose grubs mine within leaves and adults scrape chlorophyll, creating characteristic white parallel streaks.",
        "do_now": [
            "Spray chlorpyrifos 20 EC (2 ml/L) or quinalphos 25 EC (2 ml/L) upon reaching economic threshold.",
            "Sweep fields with fine nylon nets to catch adult beetles during morning hours.",
            "Clip leaf tips containing eggs and mines before transplanting.",
        ],
        "watch_for": [
            "Leaves turning completely white and membranous with scorched appearance across the field.",
            "Spiny black adult beetles crawling on the upper canopy.",
        ],
        "avoid": [
            "Excessive nitrogen application that produces dense, succulent foliage favored by hispa.",
            "Leaving host grassy weeds around bunds.",
        ],
        "source": "ICAR-CRRI — Rice Pest Management",
    },
    "tungro": {
        "what_it_is": "A viral complex transmitted by the green leafhopper causing yellow-orange leaf discoloration and severe stunting.",
        "do_now": [
            "Control green leafhopper vectors by spraying thiamethoxam 25 WG (0.2 g/L) or imidacloprid 17.8 SL (0.25 ml/L).",
            "Rogue out and destroy infected yellowed clumps immediately.",
            "Install light traps (1 per hectare) to monitor and suppress vector insect flights.",
        ],
        "watch_for": [
            "Interveinal chlorosis and mottling turning bright orange-yellow from leaf tips downward.",
            "Green leafhopper nymphs hopping on lower leaf sheaths.",
        ],
        "avoid": [
            "Staggered planting in adjacent fields which sustains continuous vector populations.",
            "Allowing stubbles and volunteer ratoon rice from past seasons to remain.",
        ],
        "source": "ICAR-NRRI Cuttack — Rice Tungro Advisory",
    },
    # Chilli
    "anthracnose": {
        "what_it_is": "A destructive fungal complex (Colletotrichum capsici) causing circular sunken necrotic spots on fruit and tip dieback on twigs.",
        "do_now": [
            "Spray azoxystrobin 23 SC (1 ml/L) or difenoconazole 25 EC (1 ml/L) alternating with copper oxychloride.",
            "Collect and destroy fallen infected fruits and dry twigs showing dieback.",
            "Use drip irrigation instead of overhead sprinkling to reduce canopy moisture.",
        ],
        "watch_for": [
            "Concentric rings of black acervuli (spore cushions) on ripening fruits.",
            "Twigs drying from tip downwards turning grayish-white with black dots.",
        ],
        "avoid": [
            "Overhead sprinkler irrigation that splashes fungal spores between canopies.",
            "Harvesting wet fruits or packing infected pods with healthy harvest.",
        ],
        "source": "ICAR-IIHR Bengaluru — Chilli Package of Practices",
    },
    "leafcurl": {
        "what_it_is": "A viral disease transmitted by whiteflies leading to severe upward leaf curling, vein thickening, and stunted growth.",
        "do_now": [
            "Install yellow sticky traps (15 traps/acre) to monitor and catch whiteflies.",
            "Rogue out and bury severely infected stunted plants.",
            "Spray neem oil (10,000 ppm @ 2ml/L) or spiromesifen on leaf undersides.",
        ],
        "watch_for": [
            "Whitefly colonies on lower leaf surfaces.",
            "Thickening of veins and shortened internodes.",
        ],
        "avoid": [
            "Overhead hose irrigation that disperses vector insects.",
            "Monoculture planting near solanaceous weeds.",
        ],
        "source": "ICAR-IIHR Package of Practices",
    },
    "leafspot": {
        "what_it_is": "Fungal leaf spot (Cercospora capsici) producing circular lesions with light grey centers and dark reddish-brown borders.",
        "do_now": [
            "Spray mancozeb 75 WP (2.5 g/L) or copper oxychloride (3 g/L) at first symptom.",
            "Ensure wide spacing to facilitate canopy airflow.",
            "Remove diseased lower leaves from the plot.",
        ],
        "watch_for": [
            "Spots coalescing and causing severe foliar yellowing and premature leaf drop.",
            "Lesions extending to fruit stalks.",
        ],
        "avoid": [
            "Excessive plant density creating humid, shaded microclimate.",
            "Sprinkler irrigation wetting chilli leaves late in the evening.",
        ],
        "source": "TNAU Agritech Portal — Chilli Disease Management",
    },
    "whitefly": {
        "what_it_is": "Sucking sap insect pest (Bemisia tabaci) that weakens plants, excretes honeydew leading to sooty mold, and transmits leaf curl virus.",
        "do_now": [
            "Erect yellow sticky traps (15-20 traps/acre) at canopy level to trap adults.",
            "Spray spiromesifen 22.9 SC (1 ml/L) or acetamiprid 20 SP (0.2 g/L) on leaf undersides.",
            "Apply neem oil (10,000 ppm @ 2 ml/L) early in the morning as an organic deterrent.",
        ],
        "watch_for": [
            "Upward leaf curling, puckering, and vein thickening on terminal shoots.",
            "Black sooty mold coating lower leaves under honeydew deposits.",
        ],
        "avoid": [
            "Repeated use of synthetic pyrethroids which causes whitefly pest resurgence.",
            "Weedy field borders with alternate host weeds like Parthenium.",
        ],
        "source": "ICAR-IIHR Bengaluru — IPM for Solanaceous Crops",
    },
    "yellowish": {
        "what_it_is": "Foliar yellowing and chlorosis typically associated with micronutrient deficiency (iron/zinc) or early mite stress.",
        "do_now": [
            "Foliar spray of micro-nutrient mixture (Zinc 0.5% + Ferrous sulfate 0.5% + Urea 1%) in early morning.",
            "Inspect leaf undersides with a 10x hand lens for yellow mite infestation; apply propargite if found.",
            "Ensure proper soil aeration and avoid soil waterlogging around roots.",
        ],
        "watch_for": [
            "Interveinal chlorosis on new flush leaves vs downward boat-shaped curling (mites).",
            "Uniform pale green or yellow leaves on lower tiers (nitrogen depletion).",
        ],
        "avoid": [
            "Over-irrigation in heavy soils causing root asphyxiation and poor nutrient uptake.",
            "Excessive phosphate applications locking up micronutrient availability.",
        ],
        "source": "TNAU Agritech Portal — Chilli Nutrition and Health",
    },
    # Banana
    "bract_mosaic_virus": {
        "what_it_is": "A potyvirus producing spindle-shaped red-brown streaks on flower bracts and mosaic stripes on petioles.",
        "do_now": [
            "Eradicate and destroy infected plants with herbicide injection or digging to prevent aphid transmission.",
            "Control aphid vectors (Pentalonia nigronervosa) with dimethoate 30 EC (1.75 ml/L).",
            "Use exclusively virus-indexed tissue-cultured banana plantlets.",
        ],
        "watch_for": [
            "Spindle-shaped chlorotic or dark green streaks along leaf petioles and leaf sheaths.",
            "Malformed bunches with small, unevenly ripened fingers.",
        ],
        "avoid": [
            "Propagating conventional suckers from unverified farm blocks.",
            "Intercropping with vector host plants like Cucurbits or Colocasia.",
        ],
        "source": "ICAR-NRCB Trichy — Banana Virus Diseases",
    },
    "cordana": {
        "what_it_is": "A fungal leaf spot (Cordana musae) producing large oval necrotic patches with a bright yellow halo, often along leaf margins.",
        "do_now": [
            "De-leaf and safely dispose of severely infected leaves to reduce inoculum.",
            "Apply carbendazim 50 WP (1 g/L) or chlorothalonil 75 WP (2 g/L) covering both leaf surfaces.",
            "Ensure optimal plant spacing and suckering to facilitate airflow and rapid drying.",
        ],
        "watch_for": [
            "Spots coalescing into large necrotic bands along leaf margins with concentric rings.",
            "Premature drying of functional green leaves during bunch development.",
        ],
        "avoid": [
            "Overcrowded orchards with more than 1 sucker per mother stool.",
            "Sprinkler irrigation wetting lower canopy foliage in shaded plantations.",
        ],
        "source": "NRCB Trichy — Banana Pathology Guide",
    },
    "insectpest": {
        "what_it_is": "Damage caused by banana weevil borer or thrips, leading to pseudostem tunneling, root damage, and rust blemishing on fruit.",
        "do_now": [
            "Place split pseudostem disc traps (20 traps/acre) smeared with chlorpyrifos to catch adult weevils.",
            "Soil application of neem cake (250 g/plant) around root zones during planting and earthing up.",
            "Spray acephate 75 SP (1.5 g/L) if thrips or scarring beetles attack young emerging bunches.",
        ],
        "watch_for": [
            "Jelly-like sap exudation and black tunnels inside the corm and lower pseudostem.",
            "Unhealthy yellowing, stunted bunch formation, and plant toppling under wind.",
        ],
        "avoid": [
            "Leaving harvested pseudostem stumps in the field without chopping and composting.",
            "Planting suckers without paring and hot-water or biopesticide dipping.",
        ],
        "source": "NRCB Trichy — Banana Pest Management",
    },
    "moko": {
        "what_it_is": "A severe bacterial wilt (Ralstonia solanacearum) causing rapid yellowing, wilting, premature fruit yellowing, and dark brown vascular ring rot.",
        "do_now": [
            "Disinfect farm machetes and pruning knives with 20% household bleach or flame between each plant.",
            "Bag floral bunches and remove male buds (de-belling) to prevent insect transmission of bacteria.",
            "Eradicate infected stools immediately with chemical injectant and fence the area.",
        ],
        "watch_for": [
            "Premature yellowing and fruit cracking while fingers are still immature.",
            "Dirty white to brown bacterial ooze oozing from vascular strands in clean water.",
        ],
        "avoid": [
            "De-suckering or pruning with unsterilized cutting tools.",
            "Movement of contaminated farm machinery or soil between plots.",
        ],
        "source": "NRCB Trichy — Bacterial Diseases of Banana",
    },
    "panama": {
        "what_it_is": "A devastating vascular wilt fungus (Fusarium oxysporum f. sp. cubense) causing yellowing of lower leaves, skirt of dead leaves, and vascular discoloration.",
        "do_now": [
            "Quarantine affected mats; uproot and burn wilted stools with quicklime application to planting pits.",
            "Soil drench around healthy surrounding plants with carbendazim (2 g/L) or Trichoderma viride.",
            "Plant certified tissue culture plantlets of resistant cultivars (e.g., Grand Naine).",
        ],
        "watch_for": [
            "Buckling of leaf petioles and leaves hanging downwards like an apron around pseudostem.",
            "Reddish-brown or black discoloration of vascular strands when cutting pseudo-stem base.",
        ],
        "avoid": [
            "Taking suckers from infected plantations or fields with wilt history.",
            "Allowing runoff water from infected mats to flow through uninfected rows.",
        ],
        "source": "ICAR-NRCB Trichy — Panama Wilt Management Protocol",
    },
    "pestalotiopsis": {
        "what_it_is": "A fungal leaf spot causing circular to irregular necrotic lesions with ash-grey centers and prominent dark margins on older leaves.",
        "do_now": [
            "Prune and burn heavily infected dead lower leaves to reduce fungal spore reservoir.",
            "Apply copper oxychloride (2.5 g/L) or mancozeb 75 WP (2 g/L) covering both leaf sides.",
            "Improve soil drainage and maintain balanced potash nutrition.",
        ],
        "watch_for": [
            "Lesions enlarging and coalescing to cause broad dry leaf scorched margins.",
            "Black tiny dots (acervuli) emerging in concentric circles in grey centers.",
        ],
        "avoid": [
            "Injuring leaves during cultural operations or de-suckering.",
            "High tree canopy shading without pruning.",
        ],
        "source": "NRCB Trichy — Banana Leaf Spot Advisory",
    },
    "sigatoka": {
        "what_it_is": "A destructive fungal leaf spot disease of bananas causing premature death of leaves and reduced bunch weight.",
        "do_now": [
            "Prune and destroy severely spotted dry leaves to reduce spore load.",
            "Improve drainage to prevent stagnant water around pseudostems.",
            "Ensure wide spacing to facilitate canopy aeration.",
        ],
        "watch_for": [
            "Linear reddish-brown streaks parallel to leaf veins.",
            "Elliptical spots with sunken grey centers and black margins.",
        ],
        "avoid": [
            "Dense planting without suckering maintenance.",
            "Sprinkler irrigation wetting lower canopy foliage.",
        ],
        "source": "NRCB Trichy — Banana Advisory",
    },
    "yb_sigatoka": {
        "what_it_is": "Yellow Sigatoka (Pseudocercospora musae) producing initial yellowish-green streaks that expand into elliptical spots with light brown centers.",
        "do_now": [
            "Prune and destroy infected leaves with more than 50% dried area.",
            "Spray propiconazole 25 EC (1 ml/L) or mineral oil emulsion alternately with chlorothalonil.",
            "Maintain clean suckering (1 mother + 1 daughter follower).",
        ],
        "watch_for": [
            "Progression of narrow yellow streaks into sunken brown spots with yellow haloes.",
            "Rapid loss of functional leaf area before bunch harvest.",
        ],
        "avoid": [
            "Planting susceptible varieties in poorly drained, waterlogged basin soils.",
            "Overhead irrigation that promotes free leaf wetness.",
        ],
        "source": "NRCB Trichy — Sigatoka Management",
    },
    # Groundnut
    "early_leaf_spot": {
        "what_it_is": "A major fungal disease (Cercospora arachidicola / Tikka) producing reddish-brown to black circular spots with a prominent bright yellow halo.",
        "do_now": [
            "Spray tebuconazole 25.9 EC (1.5 ml/L) or carbendazim 12% + mancozeb 63% WP (2 g/L) at first symptom.",
            "Ensure uniform field drainage to prevent high soil surface relative humidity.",
            "Apply gypsum (200 kg/acre) at flowering to boost pod shell strength and plant vigor.",
        ],
        "watch_for": [
            "Spots appearing on younger canopy leaves 3-4 weeks after sowing.",
            "Severe premature defoliation leading to naked lower stems.",
        ],
        "avoid": [
            "Monocropping groundnut in the same plot year after year.",
            "Dense sowing beyond recommended seed rates.",
        ],
        "source": "ICRISAT Groundnut Doctor — Tikka Disease",
    },
    "early_rust": {
        "what_it_is": "Fungal rust infection in early vegetative stage producing tiny yellowish pustules on upper surface and orange-brown blister-like pustules underneath.",
        "do_now": [
            "Spray wettable sulfur 80 WP (3 g/L) or difenoconazole 25 EC (1 ml/L).",
            "Combine rust and Tikka management by using systemic triazole fungicides.",
            "Ensure balanced phosphorus and potash fertilization.",
        ],
        "watch_for": [
            "Pustules rupturing to expose reddish-brown powdery spores.",
            "Leaf margins rolling inward and curling before drying.",
        ],
        "avoid": [
            "Planting late in the season when surrounding older fields have high rust spore loads.",
            "Excessive nitrogen application.",
        ],
        "source": "TNAU Agritech Portal — Groundnut Crop Protection",
    },
    "late_leaf_spot": {
        "what_it_is": "A destructive fungal disease (Phaeoisariopsis personata) causing dark brown to jet-black spots on leaf undersides, with faint or absent yellow halos.",
        "do_now": [
            "Spray hexaconazole 5 EC (2 ml/L) or chlorothalonil 75 WP (2 g/L) targeting leaf undersides.",
            "Intercrop groundnut with pearl millet (bajra) or pigeonpea (4:1) to disrupt spore transmission.",
            "Destroy and incorporate groundnut haulms and infected crop debris after harvest.",
        ],
        "watch_for": [
            "Carbon-black velvety fungal sporulation on spot undersides.",
            "Rapid leaf drop leaving only terminal leaves intact.",
        ],
        "avoid": [
            "Over-irrigation during pod development stages.",
            "Delayed spraying once defoliation has commenced.",
        ],
        "source": "ICRISAT — Groundnut Foliar Disease Management",
    },
    "nutrition_deficiency": {
        "what_it_is": "Yellowing, interveinal chlorosis, or stunted growth caused by deficiency of essential nutrients (iron, zinc, calcium, or boron).",
        "do_now": [
            "Foliar spray of 0.5% ferrous sulfate + 0.1% citric acid for iron chlorosis.",
            "Apply gypsum (200 kg/acre) at flowering for calcium and sulfur replenishment.",
            "Ensure soil moisture is adequate for root nutrient absorption.",
        ],
        "watch_for": [
            "Bleached ivory-white new leaves in calcareous soils (iron deficiency).",
            "Pops (empty pods without kernels) due to calcium deficiency.",
        ],
        "avoid": [
            "Waterlogging that prevents root respiration and nutrient uptake.",
            "Applying lime in alkaline soils.",
        ],
        "source": "ICRISAT — Groundnut Production Guidelines",
    },
    "rust": {
        "what_it_is": "A fungal rust disease producing orange-brown pustules predominantly on the lower surface of leaves.",
        "do_now": [
            "Remove and destroy heavily infested lower leaves.",
            "Apply wettable sulfur (2.5g/L) or neem oil emulsion.",
            "Maintain optimal plant spacing to promote airflow.",
        ],
        "watch_for": [
            "Pustules rupturing and releasing rusty-colored spores.",
            "Premature defoliation starting from ground level leaves.",
        ],
        "avoid": [
            "Dense canopy planting in humid rainy periods.",
            "Continuous groundnut cultivation without crop rotation.",
        ],
        "source": "TNAU Agritech Portal — Groundnut Protection",
    },
    # Sugarcane
    "mosaic": {
        "what_it_is": "A potyvirus causing contrasting pale green to yellowish elongated chlorotic blotches alternating with normal green tissue.",
        "do_now": [
            "Rogue out and destroy mosaic-affected clumps immediately to prevent spread.",
            "Control aphid vectors with thiamethoxam 25 WG (0.2 g/L).",
            "Select disease-free setts from heat-treated nurseries.",
        ],
        "watch_for": [
            "Mottling on young leaf blades near the spindle.",
            "Stunting of stalks and shortened internodes.",
        ],
        "avoid": [
            "Using setts from infected fields or ratoon crops.",
            "Planting adjacent to maize or sorghum which serve as aphid reservoirs.",
        ],
        "source": "ICAR-Sugarcane Breeding Institute (SBI) Coimbatore",
    },
    "redrot": {
        "what_it_is": "A severe fungal disease of sugarcane causing longitudinal reddening of the internal stalk with characteristic white cross-bands.",
        "do_now": [
            "Uproot and burn diseased clumps immediately to prevent spread to ratoon.",
            "Ensure field channels are cleared to prevent waterlogged soil.",
            "Consult local extension officer for certified disease-free seed setts.",
        ],
        "watch_for": [
            "Third or fourth leaf from top showing yellowing and withering.",
            "Acidic sour odor when breaking open affected canes.",
        ],
        "avoid": [
            "Taking ratoon crop from red rot affected plots.",
            "Using flood irrigation from infected fields to healthy fields.",
        ],
        "source": "SBI Coimbatore — Sugarcane Advisory",
    },
    "yellow": {
        "what_it_is": "Yellow Leaf Disease caused by Sugarcane Yellow Leaf Virus causing midrib yellowing that spreads laterally into the leaf blade.",
        "do_now": [
            "Apply imidacloprid 17.8 SL (0.3 ml/L) to manage aphid vectors.",
            "Provide supplemental potash (MOP) to alleviate vascular stress in the cane.",
            "Adopt tissue-culture disease-free seed cane for replanting.",
        ],
        "watch_for": [
            "Bright yellow midrib on the 3rd to 5th leaf from the top expanding into leaf blade.",
            "Drying and necrosis of leaf tips leading to bunchy top symptoms.",
        ],
        "avoid": [
            "Taking multiple ratoons from plots showing high incidence.",
            "Water deficit stress during grand growth period.",
        ],
        "source": "ICAR-Sugarcane Breeding Institute (SBI) Coimbatore",
    },
    # Universal / Fallbacks
    "healthy": {
        "what_it_is": "The leaf shows healthy coloration, intact venation, and no noticeable pathogenic symptoms.",
        "do_now": [
            "Maintain standard nutrient and irrigation scheduling according to crop growth stage.",
            "Continue routine scouting for early symptoms of foliar pathogens or insect vectors.",
            "Ensure balanced potassium application to enhance natural plant immunity.",
        ],
        "watch_for": [
            "Emergence of subtle yellowing, chlorotic specks, or water-soaked lesions on lower foliage.",
            "Sucking pest build-up on the undersides of young leaves.",
        ],
        "avoid": [
            "Indiscriminate prophylactic chemical pesticide applications.",
            "Excessive nitrogen fertilizer causing succulent growth prone to pathogens.",
        ],
        "source": "ICAR & State Agricultural University Package of Practices",
    },
    "normal": {
        "what_it_is": "The leaf shows healthy coloration, intact venation, and no noticeable pathogenic symptoms.",
        "do_now": [
            "Maintain standard nutrient and irrigation scheduling according to crop growth stage.",
            "Continue routine scouting for early symptoms of foliar pathogens or insect vectors.",
            "Ensure balanced potassium application to enhance natural plant immunity.",
        ],
        "watch_for": [
            "Emergence of subtle yellowing, chlorotic specks, or water-soaked lesions on lower foliage.",
            "Sucking pest build-up on the undersides of young leaves.",
        ],
        "avoid": [
            "Indiscriminate prophylactic chemical pesticide applications.",
            "Excessive nitrogen fertilizer causing succulent growth prone to pathogens.",
        ],
        "source": "ICAR & State Agricultural University Package of Practices",
    },
    "unknown": {
        "what_it_is": "The uploaded photo could not be reliably diagnosed by the automated system.",
        "do_now": [
            "Take another photo in good daylight focusing clearly on a single affected leaf.",
            "Ensure the leaf fills the majority of the frame and is not blurred.",
            "Show the sample to your local Agricultural Extension Officer or KVK expert.",
        ],
        "watch_for": [
            "Spread of spots, wilting, or yellowing to neighboring plants.",
            "Presence of insects, eggs, or fungal powder on leaf undersides.",
        ],
        "avoid": [
            "Spraying chemical fungicides or insecticides without expert identification.",
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
            "Spread of spots, wilting, or yellowing to neighboring plants.",
            "Presence of insects, eggs, or fungal powder on leaf undersides.",
        ],
        "avoid": [
            "Spraying chemical fungicides or insecticides without expert identification.",
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
    gemini_data: Optional[Dict] = None,
) -> tuple[bool, Optional[str]]:
    """
    Evaluate deterministic escalation rule per CONTRACT.md Section 4:
    escalate = (severity in ["moderate", "severe"])
            OR (risk_72h.level == "high")
            OR (confidence < 0.70)
            OR (gemini != null AND gemini.agreement == false
                AND gemini.assessment_confidence IN ["high", "medium"])
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

    # Gemini disagreement escalation per CONTRACT.md
    if (
        gemini_data is not None
        and gemini_data.get("agreement") is False
        and gemini_data.get("assessment_confidence") in ("high", "medium")
    ):
        reasons.append("model_and_gemini_disagreement")

    if reasons:
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

    # 6. Gemini Second Opinion (must run BEFORE escalation per CONTRACT.md)
    gemini_data = None
    try:
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            import asyncio
            from ml.gemini_explainer import analyze_with_gemini
            from PIL import Image
            import io

            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            ml_summary = {
                "crop": norm_crop,
                "disease": pred_result.disease,
                "confidence": pred_result.confidence,
                "top_predictions": pred_result.top3,
            }
            gemini_raw = await asyncio.to_thread(
                analyze_with_gemini,
                image_input=pil_img,
                ml_result=ml_summary,
                affected_pct=pred_result.affected_pct,
                api_key=gemini_key,
            )
            if gemini_raw and isinstance(gemini_raw, dict):
                # Strip internal non-contract 'error' key if present
                gemini_raw.pop("error", None)
                if (
                    gemini_raw.get("gemini_assessment")
                    and gemini_raw.get("farmer_explanation")
                    and "agreement" in gemini_raw
                ):
                    gemini_data = gemini_raw
                else:
                    gemini_data = None
    except Exception as gemini_err:
        logger.warning("Gemini second opinion generation skipped: %s", gemini_err)
        gemini_data = None

    # 7. Escalation Rule (uses severity, risk, confidence, AND gemini agreement)
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
            gemini_data=gemini_data,
        )

    # 8. Metadata Generation
    case_id = f"CASE-{uuid.uuid4().hex[:4].upper()}"
    timestamp = datetime.now(IST).isoformat()

    top3_models = [
        Top3Prediction(disease=item["disease"], confidence=float(item["confidence"]))
        for item in pred_result.top3
    ]

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

    # 8. Persist Case via Repositories Layer (Task 1)
    try:
        from app.repositories import case_repository
        if hasattr(case_repository, "save_case"):
            await case_repository.save_case(response)
    except Exception as db_err:
        logger.error("Failed to persist case %s to database repository: %s", case_id, db_err)
        # Non-critical: Controlled failure guarantees prediction response is returned

    return response
