# PattaPe ML Module — `ml/`

> **SIH26131 — AI Crop Doctor for Indian Farmers**  
> Branch: `ml/nihaal` | Status: ✅ Complete

---

## Purpose

The `ml/` directory contains the entire machine learning and inference engine for PattaPe.

It is responsible for:
- Training the EfficientNet-B0 crop disease classifier on Indian field datasets
- Crop-aware inference (logit masking per farmer-selected crop)
- Grad-CAM lesion localization and affected leaf area estimation
- Deterministic severity scoring and 72-hour environmental risk evaluation
- Optional Gemini 2.5 Flash-Lite multimodal second-opinion and plain-language explanation
- Interactive Streamlit prototype for hackathon demonstration

**ML does NOT own:** severity→i18n mapping, weather API calls, advisory templates, SQLite cases, escalation logic, FastAPI routes, or any frontend UI. These belong to the backend (`backend/`).

---

## Supported Crops & All 36 Disease Classes

All 36 classes follow the naming convention `<crop>__<disease>` and are stored in [`classes.json`](classes.json).

| Crop | # Classes | Disease Classes |
|---|---|---|
| **banana** | 9 | `bract_mosaic_virus`, `cordana`, `healthy`, `insectpest`, `moko`, `panama`, `pestalotiopsis`, `sigatoka`, `yb_sigatoka` |
| **chilli** | 6 | `anthracnose`, `healthy`, `leafcurl`, `leafspot`, `whitefly`, `yellowish` |
| **groundnut** | 6 | `early_leaf_spot`, `early_rust`, `healthy`, `late_leaf_spot`, `nutrition_deficiency`, `rust` |
| **rice** | 10 | `bacterial_leaf_blight`, `bacterial_leaf_streak`, `bacterial_panicle_blight`, `blast`, `brown_spot`, `dead_heart`, `downy_mildew`, `hispa`, `normal`, `tungro` |
| **sugarcane** | 5 | `healthy`, `mosaic`, `redrot`, `rust`, `yellow` |

---

## Dataset Structure

Three Indian field-collected datasets (zero PlantVillage/lab-background images):

| Dataset | Source | Crops | Size |
|---|---|---|---|
| Paddy Doctor | Kaggle (Tirunelveli, Tamil Nadu) | Rice — 10 classes | ~1 GB |
| Multi-Crop Disease (Mendeley) | Chengalpattu/Kanchipuram/Krishnagiri, Tamil Nadu | Chilli, Banana, Groundnut | ~4 GB |
| Sugarcane Leaf Disease (Mendeley) | Maharashtra | Sugarcane — 5 classes | ~0.5 GB |

After ingestion (`ingest.py`), images are split 80/20 with stratification and stored as:

```
ml/data/
    train/
        rice__blast/         ← <crop>__<disease> double-underscore convention
        rice__tungro/
        banana__sigatoka/
        ...
    val/
        rice__blast/
        ...
```

Cap: **300 images per class** to prevent any single dataset from dominating.

---

## Model Architecture

| Component | Detail |
|---|---|
| **Backbone** | `efficientnet_b0` via `timm` (`tf_efficientnet_b0.ns_jft_in1k` weights) |
| **Classifier Head** | Linear layer `→ 36 classes` (one flat head, all crops in one model) |
| **Grad-CAM Target Layer** | `model.conv_head` (1×1 conv, 320 → 1280 channels before global average pool) |
| **Input Size** | 224 × 224 px |
| **Normalization** | ImageNet mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]` |

See [`model.py`](model.py) for the 12-line architecture definition.

---

## Training Configuration

| Hyperparameter | Value |
|---|---|
| Optimizer | AdamW (`lr=1e-4`, `weight_decay=1e-4`) |
| Epochs | 8 |
| Batch size | 32 |
| Image size | 224 × 224 |
| Loss | CrossEntropyLoss |
| Augmentations | RandomHorizontalFlip, RandomRotation(10°), ColorJitter (brightness/contrast/saturation ±0.2) |
| Saved checkpoint | Best validation accuracy across all epochs |

See [`train.py`](train.py) for the complete training script.

---

## Checkpoint Location

```
ml/checkpoints/best.pt
```

The checkpoint file stores:
```python
{
    "model_state_dict": ...,   # EfficientNet-B0 weights
    "class_names":      [...], # 36 ordered class names (same ordering as classes.json)
    "val_accuracy":     0.9088,
    "epoch":            6,
    "image_size":       224,
}
```

Size: ~16.5 MB.

---

## Validation Results

Evaluated on **2,073 held-out validation images** via [`evaluate.py`](evaluate.py). Results in [`outputs/evaluation.json`](outputs/evaluation.json).

| Metric | Value |
|---|---|
| Overall Accuracy | **90.88%** |
| Macro F1 | **90.04%** |
| Weighted F1 | **90.78%** |
| Macro Precision | 90.24% |
| Macro Recall | 90.10% |

**Notable per-class results:**

| Class | F1 |
|---|---|
| banana__healthy | 1.000 |
| groundnut__early_rust | 0.992 |
| groundnut__healthy | 1.000 |
| banana__sigatoka | 0.629 ← weakest class |
| chilli__yellowish | 0.596 ← second weakest |

Full report: [`outputs/classification_report.txt`](outputs/classification_report.txt)  
Confusion matrix: [`outputs/confusion_matrix.png`](outputs/confusion_matrix.png)

---

## Inference Flow

```
Farmer selects crop + uploads leaf image
             │
             ▼
   predict_image(image, crop)          ← ml/predict.py
   - Full EfficientNet-B0 forward pass (36-class logits)
   - Crop-aware logit masking (non-selected crops → -inf)
   - Softmax over selected crop's classes only
   - Returns: disease, confidence, top3
             │
             ▼
   generate_gradcam(image, target_idx)  ← ml/gradcam.py
   - GradCAM on model.conv_head
   - Produces cam_mask (224×224, float [0,1])
   - extract_leaf_mask() — HSV-based leaf/background segmentation
   - calculate_affected_percentage() → affected_pct ∈ [0, 100]
   - Saves overlay PNG to ml/heatmaps/
             │
             ▼
   run_ml_pipeline(image, crop)         ← ml/infer.py  (handoff interface)
   Returns: {disease, crop, confidence, top3, affected_pct, heatmap_path}
```

---

## Crop-Aware Prediction

The model is trained once on all 36 classes. At inference time, logits for classes **not belonging to the farmer-selected crop** are set to `-inf` before softmax.

This means:
- Probability mass is 100% concentrated on the selected crop's classes
- The model can never output a banana disease for a rice image when `crop="rice"`
- Original 36-class indices are preserved (needed for Grad-CAM targeting)

```python
# Core crop-masking logic (ml/predict.py)
mask = torch.full((len(class_names),), float("-inf"), device=device)
for idx in crop_indices:
    mask[idx] = logits[idx]
logits = mask
probabilities = F.softmax(logits, dim=0)
```

Valid crop values: `rice`, `banana`, `chilli`, `groundnut`, `sugarcane`.

---

## Top-3 Predictions

`predict_image()` returns `top_predictions` (up to `top_k=3` items), each with:
- `"class"`: full class name (e.g. `"rice__blast"`)
- `"crop"`: crop component (e.g. `"rice"`)
- `"disease"`: disease component (e.g. `"blast"`)
- `"confidence"`: softmax probability (0.0–1.0)

All entries are restricted to the selected crop and sorted highest to lowest confidence.

The backend maps these to the contract's `top3` field as `[{"disease": str, "confidence": float}]`.

---

## Grad-CAM

Grad-CAM uses `pytorch_grad_cam` targeting `model.conv_head`.

**Critical:** the `target_class_index` passed to `generate_gradcam()` must be the **original 36-class index** of the crop-aware predicted class (not a re-indexed crop-local index). `app.py` and `infer.py` both do this correctly:
```python
target_idx = class_names.index(pred["predicted_class"])
generate_gradcam(image, model, class_names, target_class_index=target_idx, ...)
```

This ensures Grad-CAM highlights the lesion for the exact disease the model predicted, not an unconstrained re-inference.

---

## `affected_pct` Calculation

```python
leaf_mask   = extract_leaf_mask(img_np)       # HSV threshold: excludes white/dark backgrounds
active_mask = (cam_mask > 0.5) & leaf_mask    # Grad-CAM activations above threshold, within leaf
affected_pct = (active_mask.sum() / leaf_mask.sum()) * 100.0
```

- **Threshold:** 0.5 (configurable)
- **Bounds:** always in `[0.0, 100.0]` — `active_mask` is a logical subset of `leaf_mask`
- **Division by zero guard:** if `leaf_mask` is all-False, falls back to full image pixel count
- **Output:** rounded to 2 decimal places

---

## ML Outputs

The handoff interface (`ml/infer.py`) returns:

```python
{
    "disease":       str,         # snake_case disease name (e.g. "bacterial_leaf_blight")
    "crop":          str,         # farmer-selected crop (e.g. "rice")
    "confidence":    float,       # 0.0–1.0 softmax probability
    "top3": [
        {"disease": str, "confidence": float},
        {"disease": str, "confidence": float},
        {"disease": str, "confidence": float},
    ],
    "affected_pct":  float,       # 0.0–100.0 leaf area covered by lesion activation
    "heatmap_path":  str | None,  # absolute path to saved PNG, or None on Grad-CAM failure
}
```

---

## Installation

```bash
cd ml
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS

pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install timm pytorch-grad-cam pillow opencv-python matplotlib scikit-learn tqdm
pip install streamlit google-genai python-dotenv
```

For GPU (recommended for Streamlit demo):
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

---

## How to Run Inference

**As a Python import (recommended for backend integration):**
```python
from ml.infer import run_ml_pipeline, VALID_CROPS
from ml.predict import load_model, get_device

# Load once at startup
device = get_device()
model, class_names = load_model()

# Call per request
result = run_ml_pipeline(
    image_input="path/to/leaf.jpg",   # str, Path, or PIL.Image
    crop="rice",                        # must be in VALID_CROPS
    model=model,
    class_names=class_names,
    device=device,
)
print(result["disease"], result["confidence"], result["affected_pct"])
```

**CLI:**
```bash
# From project root
python ml/infer.py ml/data/val/rice__blast/0000.jpg --crop rice

# predict.py directly
python ml/predict.py ml/data/val/rice__blast/0000.jpg --crop rice

# gradcam.py directly
python ml/gradcam.py ml/data/val/rice__blast/0000.jpg
```

---

## How to Run the Streamlit App

```bash
streamlit run ml/app.py
```

Opens at `http://localhost:8501`. Requires `GEMINI_API_KEY` in `.env` for the second-opinion tab (optional — the app works without it).

---

## How to Run Evaluation

```bash
python ml/evaluate.py
```

Outputs to `ml/outputs/`:
- `evaluation.json` — machine-readable metrics
- `classification_report.txt` — per-class precision/recall/F1
- `confusion_matrix.png` — 300 DPI heatmap

Requires `ml/data/val/` to exist.

---

## How to Run Tests

```bash
python ml/test_pipeline.py -v
```

Expected output: **27 tests, 27 passed, 0 failures**.

Tests require:
- `ml/checkpoints/best.pt` to exist
- `ml/data/val/rice__blast/0000.jpg` to exist
- `ml/data/val/banana__healthy/0000.jpg` to exist

---

## Known Limitations

1. **Single field season per crop.** The model was trained on a limited number of districts and seasons per crop. Generalization to substantially different agro-climatic zones (e.g. Northeast India for rice, Punjab for groundnut) is unvalidated.
2. **`banana__sigatoka` is the weakest class** (F1: 62.9%). Visual overlap with `yb_sigatoka` causes frequent confusion. These are the two most likely classes to have high-confidence misclassifications on real field images.
3. **`chilli__yellowish`** (F1: 59.6%) — small support (25 validation images). Treat with lower confidence.
4. **No in-distribution test for novel lighting.** Heavily backlit or severely blurred images may produce low-confidence outputs that correctly trigger the escalation condition (`confidence < 0.70`).
5. **Grad-CAM leaf masking is HSV-based.** Dark-background or complex field environments (e.g. soil, other vegetation in background) may reduce leaf mask accuracy, causing `affected_pct` to be slightly under- or over-estimated.
6. **Gemini 2.5 Flash-Lite is optional and rate-limited.** `gemini_explainer.py` depends on `GEMINI_API_KEY` and internet. Its output is auxiliary — always falls back gracefully.

---

## What ML Does NOT Own

The following are **backend (B1) and content (C1) responsibilities**, not ML:

| Output | Owner |
|---|---|
| `severity` tier (`trace`/`mild`/`moderate`/`severe`) | `ml/severity.py` (shared util, called by B1) |
| `risk_72h` weather-based spread risk | `ml/risk.py` (shared util, called by B1 after Open-Meteo fetch) |
| `advisory` (IPM templates T1–T8) | C1 (`advisory.json` + B1 lookup) |
| `i18n` disease labels (hi, ta) | C1 (`i18n.json`) |
| `escalate` / `escalate_reason` | B1 deterministic rule |
| `case_id` / `timestamp` | B1 |
| `gemini` (second opinion) | `ml/gemini_explainer.py` called by B1, or directly in Streamlit |
| SQLite storage | B1 |
| `POST /predict` FastAPI endpoint | B1 |
| Frontend farmer flow | F1 |
| Officer dashboard | F2 |
