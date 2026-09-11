# Project Context: PattaPe (SIH26131 — AI Crop Doctor for Indian Farmers)

> **Context Document for ChatGPT & Collaborators**  
> **Repository:** `xdnihaal78/PattaPe` | **Branch:** `ml/nihaal`  
> **Target Problem:** Smart India Hackathon (SIH26131) — Real-world crop disease diagnosis and advisory system for Indian agriculture.

---

## 1. Executive Summary & Core Pitch

**PattaPe** is a mobile-first AI Crop Doctor designed specifically for Indian smallholder farmers. 
A farmer selects their crop, uploads/captures a photo of a diseased leaf, and receives:
1. **Accurate Disease Diagnosis** conditioned on their crop.
2. **Visual Grad-CAM Lesion Heatmap** explaining what the model saw without requiring tedious bounding-box annotations.
3. **Deterministic Severity Level & Affected Surface Percentage** (trace, mild, moderate, severe).
4. **72-Hour Weather-Based Disease Spread Risk** computed deterministically using agrometeorological factors (humidity, rain forecast, temperature).
5. **Farmer-Friendly IPM Advisory & Second Opinion** powered by Gemini 2.5 Flash-Lite.
6. **Automatic Escalation Flag** to human agricultural extension officers when severe damage or high risk is detected.

### Key Differentiators & Rules
- **100% Indian Field-Collected Data:** Zero lab/sterile background datasets (e.g., PlantVillage is deliberately excluded because grey-background shortcut learning collapses on real field photos). Bangladesh datasets were also excluded to ensure agro-climatic and geographical authenticity.
- **Single Model with Logit Masking:** One EfficientNet-B0 model trained across all ~36 classes, but at inference time, logits are masked strictly to the farmer's selected crop. This prevents camera/dataset shortcut learning.
- **Grad-CAM Replaces YOLO:** Instead of expensive manual bounding-box annotations, Grad-CAM activation on the final convolutional layer pinpoints the lesion area and calculates `affected_pct = (gradcam_mask > 0.5).sum() / leaf_pixels * 100`.
- **Deterministic Guardrails:** Severity assessment and 72-hour environmental risk are computed by pure deterministic mathematical rule engines (not black-box LLMs).
- **Gemini as an Advisory Reviewer, Not Overrider:** Gemini 2.5 Flash-Lite serves strictly as an independent second-opinion and plain-language explanation generator; it never overrides the primary vision model.

---

## 2. Five Supported Indian Crops & 36 Classes

Trained on 3 Indian field datasets:
1. **Paddy Doctor** (Tirunelveli, Tamil Nadu): Rice (10 classes).
2. **Multi-Crop Disease Dataset** (Chengalpattu/Kanchipuram/Krishnagiri, Tamil Nadu): Chilli, Banana, Groundnut.
3. **Sugarcane Leaf Disease Dataset** (Maharashtra): Sugarcane (5 classes).

### Full Class List (`ml/classes.json`):
- **Banana (9 classes):** `banana__bract_mosaic_virus`, `banana__cordana`, `banana__healthy`, `banana__insectpest`, `banana__moko`, `banana__panama`, `banana__pestalotiopsis`, `banana__sigatoka`, `banana__yb_sigatoka`
- **Chilli (6 classes):** `chilli__anthracnose`, `chilli__healthy`, `chilli__leafcurl`, `chilli__leafspot`, `chilli__whitefly`, `chilli__yellowish`
- **Groundnut (6 classes):** `groundnut__early_leaf_spot`, `groundnut__early_rust`, `groundnut__healthy`, `groundnut__late_leaf_spot`, `groundnut__nutrition_deficiency`, `groundnut__rust`
- **Rice (10 classes):** `rice__bacterial_leaf_blight`, `rice__bacterial_leaf_streak`, `rice__bacterial_panicle_blight`, `rice__blast`, `rice__brown_spot`, `rice__dead_heart`, `rice__downy_mildew`, `rice__hispa`, `rice__normal`, `rice__tungro`
- **Sugarcane (5 classes):** `sugarcane__healthy`, `sugarcane__mosaic`, `sugarcane__redrot`, `sugarcane__rust`, `sugarcane__yellow`

---

## 3. What We Have Built & Implemented So Far

The entire machine learning and inference engine has been engineered under `ml/`:

| Module | File | Responsibilities & Functionality |
|---|---|---|
| **Model Definition** | `ml/model.py` | PyTorch model wrapper using `timm` (`tf_efficientnet_b0.ns_jft_in1k`) with custom linear classifier head mapping to 36 classes. |
| **Dataset Ingestion** | `ml/ingest.py` | Standardizes raw folder names into `<crop>__<disease>`, performs 80/20 train/val split with stratification, and validates image integrity. |
| **Training Pipeline** | `ml/train.py` | EfficientNet-B0 fine-tuning pipeline with AdamW, Cosine Annealing scheduler, class weighting, data augmentations (flips, affine, color jitter), and checkpointing to `ml/checkpoints/best.pt`. |
| **Crop-Aware Inference** | `ml/predict.py` | Core prediction engine. Supports standalone CLI or programmatic API. Implements crop-conditioned logit masking and returns top-3 candidate predictions with softmax probabilities. |
| **Grad-CAM Engine** | `ml/gradcam.py` | Computes activation heatmaps over `conv_head`. Calculates affected leaf area percentage via thresholding (`affected_pct`) and outputs side-by-side diagnostic overlays. |
| **Severity Calculator** | `ml/severity.py` | Deterministic severity categorization based on affected leaf area: `trace` (≤5%), `mild` (6–15%), `moderate` (16–35%), `severe` (>35%). |
| **72-Hour Risk Engine** | `ml/risk.py` | Deterministic agrometeorological risk engine (0–7 score) evaluating humidity (>80% / >65%), rainfall (>15mm / >5mm), temperature window (20–30°C), severity, and pathogen susceptibility (`T1`, `T2`, `T7`). Outputs `low`, `moderate`, or `high` with machine-readable reasons. |
| **Gemini Second Opinion** | `ml/gemini_explainer.py` | Multimodal integration with Google Gemini 2.5 Flash-Lite (`google-genai` SDK). Delivers farmer-friendly explanations, symptom validation, agronomic cultural steps, and audio-ready scripts. |
| **Model Evaluation** | `ml/evaluate.py` | Comprehensive validation harness generating high-resolution confusion matrix plot (`ml/outputs/confusion_matrix.png`), classification report (`classification_report.txt`), and `evaluation.json`. |
| **Streamlit Web Demo** | `ml/app.py` | Full interactive prototype bringing together crop selection, image upload, Grad-CAM visualization, severity/risk calculation, and Gemini farmer advisory in a modern UI. |

---

## 4. Frozen API Contract: `POST /predict`

Defined in `CONTRACT.md`. The backend and frontend adhere strictly to this schema:

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
  "affected_pct": 26.4,
  "heatmap_url": "/static/heatmaps/case_0042.png",
  "risk_72h": {
    "level": "high",
    "reasons": [
      "humidity_88pct",
      "rainfall_forecast_18mm",
      "susceptible_stage"
    ]
  },
  "advisory": {
    "what_it_is": "A bacterial infection causing water-soaked stripes and yellowing on leaves.",
    "do_now": [
      "Drain excess water from the field immediately.",
      "Avoid applying additional nitrogen fertilizer until lesions dry.",
      "Spray copper hydroxide or validamycin if recommended by local KVK."
    ],
    "watch_for": [
      "Rapid spread along irrigation flow lines",
      "Wilting of whole tillers (Kresek phase)"
    ],
    "avoid": [
      "Excess nitrogen top-dressing",
      "Overhead irrigation that splashes bacteria"
    ],
    "source": "TNAU Agritech Portal — Crop Protection"
  },
  "escalate": true,
  "escalate_reason": "severity_moderate_and_risk_high",
  "case_id": "CASE-0042",
  "timestamp": "2026-09-11T12:00:00+05:30"
}
```

---

## 5. Current State of the Repository & What to Build Next

### Current Status:
- `ml/` branch: **Complete and verified.** All inference, Grad-CAM, risk, severity, evaluation, Gemini explainer, and Streamlit prototype are working.

### Ready-to-Prompt Prompts for ChatGPT:
When asking ChatGPT for the next tasks, you can say:
> *"Here is our project context document for PattaPe (SIH26131). The ML pipeline (`ml/`) is fully completed with EfficientNet-B0, Grad-CAM, deterministic severity & 72-hour risk engines, and Gemini 2.5 Flash-Lite explainer.