# PattaPe API Contract:│   ├

> **SOURCE OF TRUTH:** Section 3 of `SIH26131_battle_plan.md`  
> **STATUS:** 🔒 **FROZEN** — Written in Hour 1, frozen forever. Key names must not be changed casually.

---

## 1. Purpose of this Contract

This document defines the definitive JSON response contract for the core diagnostic endpoint:
```http
POST /predict
```

The purpose of this frozen contract is to decouple development across team roles during the hackathon:
- **ML (M1)** is responsible for producing the core diagnosis-related information (predicted disease class, confidence, top-3 candidates, Grad-CAM heatmap visualization, and affected leaf surface percentage).
- **Backend (B1 / C1)** exposes the API endpoint, executes deterministic rule engines, and enriches the ML output with downstream data: internationalized labels (`i18n`), severity classification, 72-hour weather-based spread risk, IPM advisory content, escalation logic, and case metadata.
- **Frontend (F1 / F2)** consumes this exact JSON structure to render the farmer result screen (heatmap overlay, severity chip, affected-area indicator, risk badge, expandable advisory blocks, audio readout) and feed the extension officer dashboard.

---

## 2. Complete Example Response

Below is the authoritative mock response straight from Section 3 of the battle plan:

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
    "hi": "...",
    "ta": "..."
  },
  "confidence": 0.94,
  "top3": [
    { "disease": "bacterial_leaf_blight", "confidence": 0.94 },
    { "disease": "bacterial_leaf_streak", "confidence": 0.04 },
    { "disease": "brown_spot", "confidence": 0.01 }
  ],
  "severity": "moderate",
  "affected_pct": 26,
  "heatmap_url": "/static/heatmaps/abc123.png",
  "risk_72h": {
    "level": "high",
    "reasons": [
      "humidity_88pct",
      "rainfall_forecast_18mm",
      "susceptible_stage"
    ]
  },
  "advisory": {
    "what_it_is": "...",
    "do_now": [
      "...",
      "...",
      "..."
    ],
    "watch_for": [
      "...",
      "..."
    ],
    "avoid": [
      "..."
    ],
    "source": "TNAU Agritech Portal — Crop Protection"
  },
  "escalate": true,
  "escalate_reason": "severity_moderate_and_risk_high",
  "case_id": "CASE-0042",
  "timestamp": "2026-08-28T10:14:00+05:30"
}
```

---

## 3. Field Specification & Data Dictionary

| Field Name | Type | Produced By | Description & Purpose |
|---|---|---|---|
| `crop` | `string` | ML / Backend | Target crop key selected by farmer (`rice`, `chilli`, `banana`, `groundnut`, `sugarcane`). |
| `crop_label_i18n` | `object` (`dict[string, string]`) | Backend | Localized crop names for UI rendering (keyed by ISO code: `en`, `hi`, `ta`). |
| `disease` | `string` | ML | Predicted disease class identifier (snake_case matching `classes.json`). |
| `disease_label_i18n` | `object` (`dict[string, string]`) | Backend | Localized disease display names for farmer UI (keys: `en`, `hi`, `ta`). |
| `confidence` | `number` (`float`, 0.0–1.0) | ML | Softmax probability score of the top predicted class. |
| `top3` | `array[object]` | ML | Top 3 ranked candidate predictions. Each item contains `{"disease": string, "confidence": float}`. |
| `severity` | `string` | Backend | Severity tier derived from `affected_pct`: `"trace"` (0–5%), `"mild"` (6–15%), `"moderate"` (16–35%), or `"severe"` (36%+). |
| `affected_pct` | `number` (`integer` / `float`) | ML | Percentage of the leaf area affected by lesions, computed from Grad-CAM activation mask `(grad_cam_mask > 0.5).sum() / leaf_pixels * 100`. |
| `heatmap_url` | `string` | ML / Backend | Relative or absolute URL to the Grad-CAM lesion heatmap overlay image served by the backend. |
| `risk_72h` | `object` | Backend | 72-hour disease spread risk assessment based on Open-Meteo agrometeorological forecast data. |
| `risk_72h.level` | `string` | Backend | Risk category: `"low"`, `"moderate"`, `"high"` (or `"unknown"` if weather service times out / offline). |
| `risk_72h.reasons` | `array[string]` | Backend | List of environmental / agronomic contributing factor tokens triggering the risk score. |
| `advisory` | `object` | Backend | IPM-aligned agronomic recommendations mapped from the pathogen template system (`T1`–`T8`). |
| `advisory.what_it_is` | `string` | Backend | Plain-language explanation of what the disease/pest is. |
| `advisory.do_now` | `array[string]` | Backend | Immediate cultural and mechanical IPM actions to take. |
| `advisory.watch_for` | `array[string]` | Backend | Symptoms, signs, or thresholds to monitor over coming days. |
| `advisory.avoid` | `array[string]` | Backend | Harmful practices to avoid (e.g. dense planting, overhead irrigation, excessive nitrogen). |
| `advisory.source` | `string` | Backend | Authoritative citation source (e.g., `"TNAU Agritech Portal — Crop Protection"` or ICAR institute package). |
| `escalate` | `boolean` | Backend | Whether this case must escalate to a human agricultural extension officer. |
| `escalate_reason` | `string` / `null` | Backend | Deterministic rule identifier explaining why escalation was triggered. |
| `case_id` | `string` | Backend | Unique identifier for tracking the diagnostic record in SQLite / dashboard (e.g., `"CASE-0042"`). |
| `timestamp` | `string` (ISO 8601) | Backend | Timestamp of diagnosis creation with timezone offset (e.g., `"2026-08-28T10:14:00+05:30"`). |

---

## 4. Escalation Rule

The decision to escalate a case to an agricultural officer is deterministic and must strictly implement the following condition:

```text
escalate = (severity IN ["moderate", "severe"]) OR (risk_72h.level == "high") OR (confidence < 0.70)
```

### Escalation Rationale:
1. **Severe / Moderate damage:** High crop loss probability demands human inspection.
2. **High 72h risk:** High humidity/rainfall forecast indicates explosive spore dispersal.
3. **Low confidence (< 0.70):** Model ambiguity routes safely to human expertise instead of guessing in front of a farmer.

---

## 5. Architectural Responsibilities

```
+-----------------------------------------------------------------------------------+
| 1. ML Pipeline (M1)                                                               |
|    - Input: Image + Farmer Selected Crop                                          |
|    - Output: crop, disease, confidence, top3, affected_pct, heatmap image         |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------+-----------------------------------------+
| 2. Backend & Rule Engine (B1, C1)                                                 |
|    - Ingests ML inference output                                                  |
|    - Computes severity tier from affected_pct                                     |
|    - Fetches agromet weather & evaluates 72h spread risk                          |
|    - Attaches i18n labels & IPM advisory templates (T1-T8)                        |
|    - Evaluates escalation rule & assigns case_id + timestamp                     |
|    - Exposes POST /predict conforming to this contract                           |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------+-----------------------------------------+
| 3. Frontend Clients (F1 Farmer PWA, F2 Officer Dashboard)                         |
|    - Consumes frozen JSON contract directly                                       |
|    - Displays heatmap, severity, risk, advisory blocks, and audio readout         |
|    - Manages officer validation & case queue                                      |
+-----------------------------------------------------------------------------------+
```

---

## 6. Rules for Developers

1. **Do not rename JSON keys:**  
   Nobody changes a key name without explicit agreement and informing all six members in the team chat. Changing a field name breaks frontend and backend simultaneously.
2. **Develop in parallel against this contract:**  
   Frontend (F1, F2) and backend (B1) must develop immediately against this contract. Do not wait for ML model training (M1) or weights to be ready.
3. **Mock server first:**  
   Backend can and must serve hardcoded responses matching this exact contract starting in Hour 1 (with an artificial 1.5s latency).
4. **No invented fields or endpoints:**  
   Do not add ad-hoc properties, nested wrappers, or unexpected data types unless explicitly updated in the battle plan.
