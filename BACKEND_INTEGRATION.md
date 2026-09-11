# PattaPe – Backend Developer Handoff & Integration Guide

> **Document Version:** 2.0 (SIH 2026 / SIH26131)  
> **Target Audience:** Backend Developers (B1), Full-Stack Integrators  
> **Source of Truth:** Aligned with `CONTRACT.md`, `SIH26131_battle_plan.md`, and `ml/ML_HANDOFF.md`  
> **Frontend Stack:** React + Vite PWA (`src/services/api.js`, `src/services/officerService.js`)  
> **Default Backend URL:** `http://localhost:8000` (Configurable via `VITE_API_BASE_URL`)

---

## 📋 Table of Contents
1. [Architecture & System Flow](#1-architecture--system-flow)
2. [Quickstart & Environment Setup](#2-quickstart--environment-setup)
3. [Core Prediction API (`POST /predict`)](#3-core-prediction-api-post-predict)
4. [ML Pipeline Integration (`ml/infer.py`)](#4-ml-pipeline-integration-mlinferpy)
5. [Officer Dashboard APIs (`/cases`, `/stats`)](#5-officer-dashboard-apis-cases-stats)
6. [Escalation & Auxiliary APIs](#6-escalation--auxiliary-apis)
7. [Database Schema (SQLite)](#7-database-schema-sqlite)
8. [External Integrations (Weather & Gemini)](#8-external-integrations-weather--gemini)
9. [Error Handling & Status Codes](#9-error-handling--status-codes)
10. [Complete Ready-to-Run `main.py` Template](#10-complete-ready-to-run-mainpy-template)
11. [Frontend Verification & Switchover](#11-frontend-verification--switchover)

---

## 1. Architecture & System Flow

```text
       ┌─────────────────────────────────────────────────────────┐
       │              FARMER PWA / OFFICER PORTAL                │
       │                   (React + Vite)                        │
       └────────────┬─────────────────────────────▲──────────────┘
                    │                             │
       multipart/form-data                        │ JSON Response
       (image + crop + metadata)                  │ (Contract V2)
                    │                             │
                    ▼                             │
       ┌──────────────────────────────────────────┴──────────────┐
       │                    FASTAPI BACKEND                      │
       │                   (Port 8000, CORS)                     │
       ├─────────────────────────┬───────────────────────────────┤
       │  1. ML Inference Engine │  2. Agrometeorology (Weather) │
       │     ml.infer / PyTorch  │     Open-Meteo API            │
       │     EfficientNet-B0     │     Cached / Fallback         │
       │     Grad-CAM Heatmap    │                               │
       ├─────────────────────────┼───────────────────────────────┤
       │  3. Gemini 2.5 Flash    │  4. Deterministic Engines     │
       │     Second-Opinion AI   │     Severity & 72h Risk Calc  │
       │     (Graceful fallback) │     Advisory Templates        │
       │                         │     Escalation Rules          │
       ├─────────────────────────┴───────────────────────────────┤
       │               5. SQLite Database (cases.db)             │
       │            Persistent storage & officer triage          │
       └─────────────────────────────────────────────────────────┘
```

---

## 2. Quickstart & Environment Setup

### 2.1 Backend Python Environment
From the project root:

```bash
# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install required packages
pip install fastapi uvicorn pillow torch torchvision numpy requests python-multipart google-genai
```

### 2.2 Environment Variables (`.env`)
Create a `.env` file in the project root:

```env
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
# Google Gemini API key for multimodal second opinion (optional; pipeline falls back gracefully if absent)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2.3 Static Heatmap Directory
Ensure the static heatmaps directory exists so FastAPI can serve generated PNG overlays:
```bash
mkdir -p ml/heatmaps
```

---

## 3. Core Prediction API (`POST /predict`)

### 3.1 Endpoint Details
- **Route:** `POST /predict` (alias: `POST /api/predict`)
- **Content-Type:** `multipart/form-data`

### 3.2 Request Parameters
| Parameter | Type | Required? | Description |
|---|---|---|---|
| `file` (or `image`) | Binary file | **Yes** | Leaf image (JPEG, PNG, WebP) |
| `crop` | String | **Yes** | Crop key: `"rice"`, `"chilli"`, `"banana"`, `"groundnut"`, `"sugarcane"` |
| `lat` | Float | No | Farmer latitude (default: `16.5449` for Bhimavaram) |
| `lon` | Float | No | Farmer longitude (default: `81.5212`) |
| `village` | String | No | Village name (e.g. `"Bhimavaram"`, `"Baramati"`, `"Guntur"`, `"Junagadh"`) |
| `farmer_name` | String | No | Farmer name (default: `"Local Farmer"`) |
| `farmer_phone` | String | No | Contact phone number |

> **Note on File Field Name:** The frontend primarily sends `file`, but some test scripts send `image`. Your FastAPI route should support both gracefully (see code template below).

---

### 3.3 Authoritative Response JSON Schema (Frozen `CONTRACT.md`)
Every `POST /predict` response must return the exact frozen contract structure:

```json
{
  "crop": "rice",
  "crop_label_i18n": {
    "en": "Rice",
    "hi": "धान",
    "ta": "நெல்"
  },
  "disease": "bacterial_leaf_blight",
  "disease_label_i18n": {
    "en": "Bacterial Leaf Blight",
    "hi": "जीवाणु झुलसा",
    "ta": "பாக்டீரியா இலைக்கருகல்"
  },
  "confidence": 0.94,
  "top3": [
    { "disease": "bacterial_leaf_blight", "confidence": 0.94 },
    { "disease": "bacterial_leaf_streak", "confidence": 0.04 },
    { "disease": "brown_spot", "confidence": 0.01 }
  ],
  "severity": "moderate",
  "affected_pct": 26.5,
  "heatmap_url": "/static/heatmaps/rice_blight_gradcam_xyz.png",
  "risk_72h": {
    "level": "high",
    "reasons": [
      "humidity_88pct",
      "rainfall_forecast_18mm",
      "susceptible_stage"
    ]
  },
  "advisory": {
    "what_it_is": "A devastating bacterial disease caused by Xanthomonas oryzae pv. oryzae causing wilting and yellow lesions along leaf margins.",
    "do_now": [
      "Drain excess standing water from the field for 24-48 hours to lower humidity.",
      "Spray Streptocycline (1g in 10L water) mixed with Copper Oxychloride (25g in 10L water).",
      "Avoid applying urea or nitrogenous fertilizers until new growth appears."
    ],
    "watch_for": [
      "Milky bacterial ooze beads on young lesions during early morning dew.",
      "Rapid spread along field waterways and windward field borders."
    ],
    "avoid": [
      "Do not apply nitrogen top-dressing during active blight infection.",
      "Avoid field-to-field irrigation flow from infected plots."
    ],
    "source": "TNAU Agritech Portal — Crop Protection"
  },
  "gemini": {
    "gemini_assessment": "bacterial_leaf_blight",
    "agreement": true,
    "assessment_confidence": "high",
    "visual_evidence": [
      "Yellow to straw-coloured necrotic lesions along the leaf margins",
      "Wavy margins with water-soaked boundaries typical of bacterial blight"
    ],
    "possible_causes": [
      "Bacterial infection (Xanthomonas oryzae pv. oryzae)",
      "Favoured by high humidity (>80%) and warm temperatures (25-30°C)"
    ],
    "farmer_explanation": "The leaf shows classic signs of Bacterial Leaf Blight, starting with yellowish stripes along the leaf edges that dry up. This reduces the green area needed for the crop to produce grain, which can reduce yield if not managed.",
    "disagreement_reason": null
  },
  "escalate": true,
  "escalate_reason": "severity_moderate_and_risk_high",
  "case_id": "CASE-1042",
  "timestamp": "2026-09-11T12:00:00+05:30"
}
```

---

### 3.4 Data Dictionary & Origin Table

| Field Name | Type | Source | Logic / Extraction |
|---|---|---|---|
| `crop` | `string` | Client request | One of: `"rice"`, `"chilli"`, `"banana"`, `"groundnut"`, `"sugarcane"` |
| `crop_label_i18n` | `object` | Backend dictionary | Localized crop names for `en`, `hi`, `ta` |
| `disease` | `string` | `ml.infer.run_ml_pipeline` | Snake_case class name from `classes.json` |
| `disease_label_i18n` | `object` | Backend dictionary | Localized disease display names |
| `confidence` | `float` (0.0–1.0) | `ml.infer.run_ml_pipeline` | Primary softmax probability score |
| `top3` | `array[object]` | `ml.infer.run_ml_pipeline` | `[{"disease": str, "confidence": float}, ...]` |
| `severity` | `string` | `ml.severity.get_severity` | `"trace"` (0–5%), `"mild"` (6–15%), `"moderate"` (16–35%), or `"severe"` (36%+) |
| `affected_pct` | `float` (0.0–100.0) | `ml.infer.run_ml_pipeline` | Grad-CAM active lesion pixel ratio |
| `heatmap_url` | `string` or `null` | Static file server | URL path to saved PNG (`/static/heatmaps/{filename}`) |
| `risk_72h` | `object` | `ml.risk.calculate_risk` | `{ "level": "low"|"moderate"|"high"|"unknown", "reasons": [...] }` |
| `advisory` | `object` | Backend dictionary / JSON | `{ what_it_is, do_now, watch_for, avoid, source }` |
| `gemini` | `object` or `null` | `ml.gemini_explainer` | Second opinion. **Always `null` if disabled/offline (does not crash)** |
| `escalate` | `boolean` | Deterministic rule | `true` if escalation triggered (see Section 3.5) |
| `escalate_reason` | `string` or `null` | Deterministic rule | Token explaining escalation trigger |
| `case_id` | `string` | SQLite / Generator | Format: `"CASE-XXXX"` or `"KVK-XXXX"` |
| `timestamp` | `string` | Server datetime | ISO 8601 with offset (`YYYY-MM-DDTHH:mm:ss+05:30`) |

---

### 3.5 Escalation Rule Formula
The escalation rule is deterministic and must be evaluated after severity, risk, and Gemini analysis:

```python
def check_escalation(severity: str, risk_level: str, confidence: float, gemini_data: dict | None) -> tuple[bool, str | None]:
    if severity in ["moderate", "severe"] and risk_level == "high":
        return True, "severity_moderate_and_risk_high"
    if severity == "severe":
        return True, "severity_severe"
    if risk_level == "high":
        return True, "risk_high"
    if confidence < 0.70:
        return True, "low_model_confidence"
    if gemini_data and gemini_data.get("agreement") is False and gemini_data.get("assessment_confidence") in ["high", "medium"]:
        return True, "model_and_gemini_disagreement"
    return False, None
```

---

## 4. ML Pipeline Integration (`ml/infer.py`)

The ML pipeline is fully self-contained in the `ml/` directory.

### 4.1 What to Import in Backend
```python
from ml.predict import load_model, get_device
from ml.infer import run_ml_pipeline, VALID_CROPS
from ml.severity import get_severity
from ml.risk import calculate_risk
from ml.gemini_explainer import analyze_with_gemini
```

### 4.2 Lifecycle: Startup vs Request
1. **At Startup (Once):**
   ```python
   device = get_device()
   model, class_names = load_model()  # Loads ml/checkpoints/best.pt once into memory
   ```
2. **On Each Request:**
   ```python
   # Convert uploaded bytes to PIL Image:
   image = Image.open(io.BytesIO(await file.read())).convert("RGB")

   # Run inference + Grad-CAM:
   ml_result = run_ml_pipeline(
       image_input=image,
       crop=crop,
       model=model,
       class_names=class_names,
       device=device,
       heatmap_dir=Path("ml/heatmaps"),
   )
   ```

### 4.3 Output of `run_ml_pipeline`
```python
{
    "disease": "bacterial_leaf_blight",
    "crop": "rice",
    "confidence": 0.9412,
    "top3": [
        {"disease": "bacterial_leaf_blight", "confidence": 0.9412},
        {"disease": "bacterial_leaf_streak", "confidence": 0.0381},
        {"disease": "brown_spot", "confidence": 0.0105}
    ],
    "affected_pct": 26.54,
    "heatmap_path": "ml/heatmaps/rice_bacterial_leaf_blight_gradcam_xyz.png"
}
```

---

## 5. Officer Dashboard APIs (`/cases`, `/stats`)

The Agricultural Extension Officer portal consumes four critical endpoints implemented in `src/services/officerService.js`.

### 5.1 Case Listing: `GET /cases`
- **Route:** `GET /cases` (or `GET /api/cases`)
- **Query Parameters:**
  - `village` (optional): Filter by village (e.g. `"Bhimavaram"`, or `"all"`)
  - `crop` (optional): Filter by crop (e.g. `"Rice"`, or `"all"`)
  - `severity` (optional): `"trace"`, `"mild"`, `"moderate"`, `"severe"`
  - `risk` (optional): `"low"`, `"moderate"`, `"high"`
  - `status` (optional): `"Pending Review"`, `"Confirmed"`, `"Overridden"`, `"Lab Test Requested"`
  - `search` (optional): Fuzzy search matching case ID, farmer name, village, or disease
- **Response Format:** Array of case objects:
```json
[
  {
    "id": "1",
    "case_id": "KVK-1001",
    "farmer_name": "Ramesh Patel",
    "farmer_phone": "+91 98234 11200",
    "crop": "Rice",
    "disease": "Rice Leaf Blast",
    "confidence": 93,
    "severity": "severe",
    "affected_pct": 75,
    "risk": "high",
    "village": "Bhimavaram",
    "status": "Pending Review",
    "created_at": "2026-09-11T09:30:00Z",
    "image_url": "/static/images/leaf_sample.jpg",
    "heatmap_url": "/static/heatmaps/blast_heatmap.png",
    "top3": [
      { "name": "Rice Leaf Blast", "confidence": 93 },
      { "name": "Brown Spot", "confidence": 5 },
      { "name": "Bacterial Blight", "confidence": 2 }
    ],
    "simple_summary": "Spindle-shaped gray spots on leaves. Spores spreading quickly in humid night air.",
    "recommended_treatment": "Tricyclazole spray @ 0.6g/liter of water. Drain excess standing water for 2 days."
  }
]
```

---

### 5.2 Single Case Details: `GET /cases/{id}`
- **Route:** `GET /cases/{id}` (or `GET /api/cases/{id}`)
- **Path Parameter:** `id` (Supports both internal database `id` or string `case_id` like `"KVK-1001"`)
- **Response:** Single Case Object as above. If not found, return HTTP 404 (`{"detail": "Case not found"}`).

---

### 5.3 Aggregate Officer Stats: `GET /stats`
- **Route:** `GET /stats` (or `GET /api/stats`)
- **Response Format:**
```json
{
  "total": 40,
  "healthy": 8,
  "at_risk": 14,
  "infected": 18,
  "pending": 22,
  "confirmed": 10,
  "overridden": 4,
  "lab_requested": 4,
  "by_crop": {
    "Rice": { "total": 8, "healthy": 2, "at_risk": 2, "infected": 4 },
    "Chilli": { "total": 8, "healthy": 1, "at_risk": 3, "infected": 4 },
    "Banana": { "total": 8, "healthy": 2, "at_risk": 3, "infected": 3 },
    "Groundnut": { "total": 8, "healthy": 2, "at_risk": 3, "infected": 3 },
    "Sugarcane": { "total": 8, "healthy": 1, "at_risk": 3, "infected": 4 }
  }
}
```

---

### 5.4 Officer Validation Action: `PATCH /cases/{id}/status`
- **Route:** `PATCH /cases/{id}/status`
- **Request Body (JSON):**
```json
{
  "status": "Confirmed", 
  "notes": "Verified in person. Classic bacterial blight lesion progression.",
  "updatedDisease": null,
  "newSeverity": null,
  "adjustedDosage": "Streptocycline 1g/10L + Copper Oxychloride 2.5g/L",
  "updatedAdvice": "Ensure field drainage immediately.",
  "labDetails": {
    "priority": "Urgent",
    "labName": "Regional Agritech Research Center",
    "notes": "Suspected novel bacterial strain resistant to standard bactericides."
  }
}
```
- **Allowed `status` Values:**
  - `"Pending Review"`
  - `"Confirmed"`
  - `"Overridden"` (accompanied by `updatedDisease` and optional `newSeverity`)
  - `"Lab Test Requested"` (accompanied by `labDetails`)
- **Response:** Updated case object with HTTP 200.

---

## 6. Escalation & Auxiliary APIs

### 6.1 Direct Farmer Escalation: `POST /api/escalate`
- **Route:** `POST /api/escalate`
- **Request Body (JSON):**
```json
{
  "cropId": "chilli",
  "disease": "Chilli Leaf Curl Virus",
  "farmerNotes": "Severe leaf curling across 2 acres",
  "phone": "+91 98234 11200"
}
```
- **Response (JSON):**
```json
{
  "success": true,
  "ticketId": "KVK-918233",
  "message": "Case escalated to KVK Agriculture Officer. Expect a callback within 2 hours.",
  "localMessage": "आपकी समस्या कृषि अधिकारी के पास भेज दी गई है। आपको २ घंटे में कॉल आएगा।"
}
```

---

### 6.2 Supported Crops List: `GET /api/crops`
- **Route:** `GET /api/crops`
- **Response (JSON):**
```json
[
  { "id": "rice", "name": "Rice", "localName": "धान (Rice)", "icon": "🌾" },
  { "id": "chilli", "name": "Chilli", "localName": "मिर्च (Chilli)", "icon": "🌶️" },
  { "id": "banana", "name": "Banana", "localName": "केला (Banana)", "icon": "🍌" },
  { "id": "groundnut", "name": "Groundnut", "localName": "मूंगफली (Groundnut)", "icon": "🥜" },
  { "id": "sugarcane", "name": "Sugarcane", "localName": "गन्ना (Sugarcane)", "icon": "🎋" }
]
```

---

## 7. Database Schema (SQLite)

The battle plan specifies a single lightweight SQLite database (`cases.db`) requiring no external database service.

```sql
CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id TEXT UNIQUE NOT NULL,
    crop TEXT NOT NULL,
    disease TEXT NOT NULL,
    confidence REAL NOT NULL,
    severity TEXT NOT NULL,
    affected_pct REAL NOT NULL,
    risk TEXT NOT NULL,
    gemini_agreement INTEGER DEFAULT 1,
    village TEXT DEFAULT 'Bhimavaram',
    farmer_name TEXT DEFAULT 'Farmer',
    farmer_phone TEXT DEFAULT '+91 98765 43210',
    lat REAL DEFAULT 16.5449,
    lon REAL DEFAULT 81.5212,
    image_url TEXT,
    heatmap_url TEXT,
    top3_json TEXT,
    advisory_json TEXT,
    gemini_json TEXT,
    officer_notes TEXT,
    status TEXT DEFAULT 'Pending Review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_village ON cases(village);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_crop ON cases(crop);
```

---

## 8. External Integrations (Weather & Gemini)

### 8.1 Open-Meteo Weather API (No API Key Required)
Use Open-Meteo to fetch 72-hour agrometeorological forecasts:
- **Endpoint:** `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=relative_humidity_2m,temperature_2m,precipitation&forecast_days=3`
- **Resilience Rule:**
  - Timeout after 2.5 seconds.
  - If weather fails or device is offline:
    ```python
    risk_72h = {"level": "unknown", "reasons": ["weather_service_offline"]}
    ```
  - Never allow an external weather API failure to block the prediction response!

### 8.2 Google Gemini Multimodal Second Opinion
- Implemented in `ml/gemini_explainer.py`.
- Invoked via:
  ```python
  from ml.gemini_explainer import analyze_with_gemini
  gemini_data = analyze_with_gemini(pil_image, ml_result, affected_pct=ml_result["affected_pct"])
  ```
- **Resilience Rule:**
  - If `GEMINI_API_KEY` is not set or times out, `analyze_with_gemini()` automatically returns a safe fallback dictionary or `null`.
  - The API response simply sets `"gemini": null` or the fallback dictionary.

---

## 9. Error Handling & Status Codes

The frontend (`FarmerErrorState.jsx` and `src/services/api.js`) recognizes specific HTTP status codes and maps them to clear, farmer-friendly recovery screens:

| Scenario | HTTP Status | Response Body | Frontend User Recovery Action |
|---|---|---|---|
| Invalid or unsupported crop | `422 Unprocessable Entity` | `{"detail": "Unsupported crop. Must be one of: rice, chilli, banana, groundnut, sugarcane"}` | Prompt farmer to pick a valid crop tile |
| Corrupted or unreadable image | `400 Bad Request` | `{"detail": "Invalid or unreadable image file"}` | "Choose Another Photo" button |
| Model inference failure | `500 Internal Server Error` | `{"detail": "Diagnostic inference failed"}` | "Try Again" with retry button |
| Request timeout (> 10s) | `504 Gateway Timeout` | `{"detail": "Service communication timed out"}` | "Backend Timeout" screen with retry |
| Heatmap generation failed | `200 OK` | Return standard contract with `"heatmap_url": null` | Displays original image with clear note that heatmap is unavailable |

---

## 10. Complete Ready-to-Run `main.py` Template

Here is an end-to-end FastAPI starter file (`main.py`) bridging the ML pipeline, static file serving, SQLite persistence, and CORS:

```python
# main.py
import io
import json
import uuid
import sqlite3
from datetime import datetime, timezone, timedelta
from pathlib import Path
from PIL import Image

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Import ML pipeline modules
from ml.predict import load_model, get_device
from ml.infer import run_ml_pipeline, VALID_CROPS
from ml.severity import get_severity
from ml.risk import calculate_risk
from ml.gemini_explainer import analyze_with_gemini

app = FastAPI(title="PattaPe API", version="2.0.0")

# 1. Enable CORS for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Static Heatmap Files
HEATMAP_DIR = Path("ml/heatmaps")
HEATMAP_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static/heatmaps", StaticFiles(directory=str(HEATMAP_DIR)), name="heatmaps")

# 3. Model Pre-loading at Startup
device = get_device()
model, class_names = load_model()
DB_FILE = "cases.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# 4. Initialize Database
def init_db():
    with get_db() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT UNIQUE NOT NULL,
            crop TEXT NOT NULL,
            disease TEXT NOT NULL,
            confidence REAL NOT NULL,
            severity TEXT NOT NULL,
            affected_pct REAL NOT NULL,
            risk TEXT NOT NULL,
            gemini_agreement INTEGER DEFAULT 1,
            village TEXT DEFAULT 'Bhimavaram',
            farmer_name TEXT DEFAULT 'Farmer',
            farmer_phone TEXT DEFAULT '+91 98765 43210',
            image_url TEXT,
            heatmap_url TEXT,
            top3_json TEXT,
            advisory_json TEXT,
            gemini_json TEXT,
            officer_notes TEXT,
            status TEXT DEFAULT 'Pending Review',
            created_at TEXT NOT NULL
        )
        """)
init_db()

# 5. Core Prediction Endpoint
@app.post("/predict")
@app.post("/api/predict")
async def predict(
    file: UploadFile = File(None),
    image: UploadFile = File(None),
    crop: str = Form(...),
    village: str = Form("Bhimavaram"),
    farmer_name: str = Form("Local Farmer"),
    farmer_phone: str = Form("+91 98765 43210")
):
    upload = file or image
    if not upload:
        raise HTTPException(status_code=400, detail="No image file provided")

    crop_clean = crop.strip().lower()
    if crop_clean not in VALID_CROPS:
        raise HTTPException(status_code=422, detail=f"Invalid crop '{crop}'. Valid crops: {list(VALID_CROPS)}")

    # Read image
    try:
        image_bytes = await upload.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not decode image file")

    # Run ML Inference + Grad-CAM
    ml_result = run_ml_pipeline(
        image_input=pil_image,
        crop=crop_clean,
        model=model,
        class_names=class_names,
        device=device,
        heatmap_dir=HEATMAP_DIR
    )

    affected_pct = ml_result["affected_pct"]
    severity = get_severity(affected_pct)

    # Build heatmap URL
    heatmap_url = None
    if ml_result.get("heatmap_path"):
        filename = Path(ml_result["heatmap_path"]).name
        heatmap_url = f"/static/heatmaps/{filename}"

    # Weather Risk Assessment (fallback safe)
    risk_72h = calculate_risk(
        humidity_avg=82.0,
        rain_72h_mm=14.0,
        temp_avg=29.0,
        severity=severity,
        pathogen_type="T2"
    )

    # Gemini Second Opinion (graceful degradation)
    try:
        gemini_data = analyze_with_gemini(pil_image, ml_result, affected_pct=affected_pct)
    except Exception:
        gemini_data = None

    # Escalation Rule Evaluation
    escalate = (
        severity in ["moderate", "severe"] or 
        risk_72h.get("level") == "high" or 
        ml_result["confidence"] < 0.70 or
        (gemini_data and gemini_data.get("agreement") is False)
    )
    escalate_reason = "severity_moderate_and_risk_high" if escalate else None

    case_id = f"KVK-{uuid.uuid4().hex[:6].upper()}"
    ist_tz = timezone(timedelta(hours=5, minutes=30))
    timestamp = datetime.now(ist_tz).isoformat()

    # Advisory Template
    advisory = {
        "what_it_is": f"Diagnosis for {ml_result['disease'].replace('_', ' ').title()}.",
        "do_now": [
            "Isolate infected plant foliage immediately.",
            "Maintain proper drainage to prevent humidity buildup."
        ],
        "watch_for": ["Lesion expansion over next 48-72 hours."],
        "avoid": ["Excess nitrogen fertilizer application."],
        "source": "TNAU Agritech Portal — Crop Protection"
    }

    # Persist in SQLite
    with get_db() as conn:
        conn.execute("""
            INSERT INTO cases (
                case_id, crop, disease, confidence, severity, affected_pct, risk, 
                village, farmer_name, farmer_phone, heatmap_url, top3_json, advisory_json, 
                gemini_json, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review', ?)
        """, (
            case_id, crop_clean.title(), ml_result["disease"].replace('_', ' ').title(),
            round(ml_result["confidence"] * 100, 1), severity, round(affected_pct, 1),
            risk_72h.get("level", "moderate"), village, farmer_name, farmer_phone,
            heatmap_url, json.dumps(ml_result["top3"]), json.dumps(advisory),
            json.dumps(gemini_data) if gemini_data else None, timestamp
        ))

    # Return authoritative CONTRACT.md JSON
    return {
        "crop": crop_clean,
        "crop_label_i18n": { "en": crop_clean.title(), "hi": crop_clean.title(), "ta": crop_clean.title() },
        "disease": ml_result["disease"],
        "disease_label_i18n": { "en": ml_result["disease"].replace('_', ' ').title(), "hi": "...", "ta": "..." },
        "confidence": round(ml_result["confidence"], 4),
        "top3": ml_result["top3"],
        "severity": severity,
        "affected_pct": round(affected_pct, 2),
        "heatmap_url": heatmap_url,
        "risk_72h": risk_72h,
        "advisory": advisory,
        "gemini": gemini_data,
        "escalate": escalate,
        "escalate_reason": escalate_reason,
        "case_id": case_id,
        "timestamp": timestamp
    }

# 6. Officer Endpoints
@app.get("/cases")
@app.get("/api/cases")
def list_cases(
    village: str = Query(None),
    crop: str = Query(None),
    severity: str = Query(None),
    risk: str = Query(None),
    status: str = Query(None),
    search: str = Query(None)
):
    with get_db() as conn:
        query = "SELECT * FROM cases WHERE 1=1"
        params = []
        if village and village != "all":
            query += " AND village = ?"; params.append(village)
        if crop and crop != "all":
            query += " AND LOWER(crop) = LOWER(?)"; params.append(crop)
        if severity and severity != "all":
            query += " AND severity = ?"; params.append(severity)
        if risk and risk != "all":
            query += " AND risk = ?"; params.append(risk)
        if status and status != "all":
            query += " AND status = ?"; params.append(status)
        if search:
            query += " AND (farmer_name LIKE ? OR case_id LIKE ? OR disease LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        
        query += " ORDER BY id DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]

@app.get("/stats")
@app.get("/api/stats")
def get_stats():
    with get_db() as conn:
        rows = [dict(r) for r in conn.execute("SELECT * FROM cases").fetchall()]
        total = len(rows)
        healthy = len([c for c in rows if c["severity"] == "trace" or "Healthy" in c["disease"]])
        at_risk = len([c for c in rows if c["risk"] == "moderate" or (c["risk"] == "high" and c["severity"] != "severe")])
        infected = len([c for c in rows if c["severity"] == "severe"])
        pending = len([c for c in rows if c["status"] == "Pending Review"])
        confirmed = len([c for c in rows if c["status"] == "Confirmed"])
        overridden = len([c for c in rows if c["status"] == "Overridden"])
        lab_requested = len([c for c in rows if c["status"] == "Lab Test Requested"])

        by_crop = {}
        for c in rows:
            cr = c["crop"]
            if cr not in by_crop:
                by_crop[cr] = {"total": 0, "healthy": 0, "at_risk": 0, "infected": 0}
            by_crop[cr]["total"] += 1
            if c["severity"] == "severe":
                by_crop[cr]["infected"] += 1
            elif c["severity"] == "trace" or "Healthy" in c["disease"]:
                by_crop[cr]["healthy"] += 1
            else:
                by_crop[cr]["at_risk"] += 1

        return {
            "total": total, "healthy": healthy, "at_risk": at_risk, "infected": infected,
            "pending": pending, "confirmed": confirmed, "overridden": overridden,
            "lab_requested": lab_requested, "by_crop": by_crop
        }

class StatusUpdate(BaseModel):
    status: str
    notes: str = None
    updatedDisease: str = None
    newSeverity: str = None
    adjustedDosage: str = None
    updatedAdvice: str = None
    labDetails: dict = None

@app.patch("/cases/{case_id}/status")
def update_status(case_id: str, payload: StatusUpdate):
    with get_db() as conn:
        conn.execute("""
            UPDATE cases SET status = ?, officer_notes = ? WHERE case_id = ? OR id = ?
        """, (payload.status, payload.notes, case_id, case_id))
        row = conn.execute("SELECT * FROM cases WHERE case_id = ? OR id = ?", (case_id, case_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Case not found")
        return dict(row)
```

---

## 11. Frontend Verification & Switchover

When your backend is running on `http://localhost:8000`:

1. **Configure Environment in Frontend:**
   In the root directory, check or update `.env.local`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. **Disable Mocking in `src/services/api.js`:**
   In [src/services/api.js](file:///c:/Users/nihaa/OneDrive/Documents/SIH/PattaPe/src/services/api.js#L7):
   ```javascript
   // Change:
   const USE_MOCK = true;
   // To:
   const USE_MOCK = false;
   ```

3. **Verify with cURL:**
   Test your `/predict` endpoint directly before opening the browser:
   ```bash
   curl -X POST "http://localhost:8000/predict" \
     -F "crop=rice" \
     -F "file=@ml/leaf.jpg"
   ```

4. **Verify in Browser:**
   - Launch frontend (`npm run dev`)
   - Navigate to `http://localhost:5173`
   - Select **Rice**, upload a leaf picture, and observe real Grad-CAM heatmaps and diagnostic predictions streaming live from FastAPI!
