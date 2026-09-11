# ML Handoff — Backend Integration Guide

> **PattaPe / SIH26131** | For: Backend developer (B1)  
> This document covers exactly what you need to integrate the ML pipeline into FastAPI.  
> Read [`README.md`](README.md) for the full ML reference.

---

## What to Import

```python
from ml.infer import run_ml_pipeline, VALID_CROPS
from ml.predict import load_model, get_device
```

Load the model **once at startup** (not per request):

```python
device = get_device()
model, class_names = load_model()   # loads ml/checkpoints/best.pt
```

Call **once per `POST /predict` request**:

```python
result = run_ml_pipeline(
    image_input=pil_image,      # PIL.Image.Image (convert from uploaded bytes)
    crop=farmer_crop_selection, # e.g. "rice"
    model=model,                # pass pre-loaded model for speed
    class_names=class_names,
    device=device,
    heatmap_dir="/path/to/static/heatmaps",  # where to save the PNG
)
```

---

## Input Format

| Parameter | Type | Notes |
|---|---|---|
| `image_input` | `str`, `Path`, or `PIL.Image` | Convert `UploadFile` bytes with `Image.open(io.BytesIO(await file.read())).convert("RGB")` |
| `crop` | `str` | Must be one of the 5 valid crop values (see below) |
| `model` | `torch.nn.Module` | Pre-loaded at startup via `load_model()` |
| `class_names` | `List[str]` | Pre-loaded at startup via `load_model()` |
| `device` | `torch.device` | Auto-detected via `get_device()` at startup |
| `heatmap_dir` | `str` or `Path` | Directory where heatmap PNGs are written |
| `heatmap_path` | `str`, `Path`, or `None` | Optional: override exact output file path |

---

## Valid Crop Values

```python
VALID_CROPS = {"rice", "banana", "chilli", "groundnut", "sugarcane"}
```

These must match the farmer's crop selection from the frontend dropdown.

---

## Output Format

`run_ml_pipeline()` returns a dict. Map it to the `POST /predict` contract fields:

```python
ml_result = run_ml_pipeline(...)

# Directly usable contract fields from ML:
ml_result["disease"]        # str  → contract field: "disease"
ml_result["crop"]           # str  → contract field: "crop"
ml_result["confidence"]     # float 0.0–1.0 → contract field: "confidence"
ml_result["top3"]           # list[{"disease": str, "confidence": float}] → "top3"
ml_result["affected_pct"]   # float 0.0–100.0 → contract field: "affected_pct"
ml_result["heatmap_path"]   # str | None → use to build: "heatmap_url"
```

**You (B1) are responsible for computing:**
- `severity` — call `ml.severity.get_severity(ml_result["affected_pct"])`
- `risk_72h` — call `ml.risk.calculate_risk(humidity, rain, temp, severity, pathogen_type)`
- `advisory` — look up pathogen template in `advisory.json`
- `gemini` — call `ml.gemini_explainer.analyze_with_gemini(image, ml_result, ...)`
- `escalate` / `escalate_reason`, `case_id`, `timestamp`, `*_i18n` fields

---

## Example Output

```python
{
    "disease":       "blast",
    "crop":          "rice",
    "confidence":    0.8234,
    "top3": [
        {"disease": "blast",                  "confidence": 0.8234},
        {"disease": "brown_spot",             "confidence": 0.1102},
        {"disease": "bacterial_leaf_blight",  "confidence": 0.0421},
    ],
    "affected_pct":  27.65,
    "heatmap_path":  "/abs/path/to/static/heatmaps/leaf_rice_blast_gradcam.png",
}
```

---

## Heatmap Handling

- `heatmap_path` is an **absolute filesystem path** to the saved PNG.
- Serve it as a static file from your FastAPI app (e.g. `StaticFiles`).
- Build the `"heatmap_url"` contract field from it:

```python
# FastAPI example
app.mount("/static/heatmaps", StaticFiles(directory="ml/heatmaps"), name="heatmaps")

filename = Path(ml_result["heatmap_path"]).name
heatmap_url = f"/static/heatmaps/{filename}"
```

- If `heatmap_path` is `None`, Grad-CAM failed silently (possible on corrupted images). Set `"heatmap_url": null` in the response.

---

## Severity and Risk Utilities

These live in `ml/` but are designed to be called by B1:

```python
from ml.severity import get_severity
from ml.risk import calculate_risk

# After you have affected_pct from ML:
severity = get_severity(ml_result["affected_pct"])
# Returns one of: "trace", "mild", "moderate", "severe"

# After you fetch weather from Open-Meteo:
risk = calculate_risk(
    humidity_avg=78.5,
    rain_72h_mm=12.0,
    temp_avg=27.0,
    severity=severity,
    pathogen_type="T2",  # from advisory.json mapping for the disease
)
# Returns: {"level": "moderate", "score": 4, "reasons": ["humidity_78pct", ...]}
```

---

## Gemini Second Opinion (Optional)

```python
from ml.gemini_explainer import analyze_with_gemini

# Requires GEMINI_API_KEY in environment or .env file
# Call AFTER predict_image() so you can pass ml_result
gemini = analyze_with_gemini(
    image_input=pil_image,
    ml_result={"crop": "rice", "disease": "blast", "confidence": 0.82},
    affected_pct=27.65,
)
# Returns dict with: gemini_assessment, agreement, assessment_confidence,
#                    visual_evidence, possible_causes, farmer_explanation, disagreement_reason
# On failure: returns safe fallback dict (never raises — always safe to include in response)
```

---

## Errors to Handle

| Exception | When | Action |
|---|---|---|
| `ValueError` | Unknown crop string passed to `run_ml_pipeline()` | Return HTTP 422 with message |
| `FileNotFoundError` | Image path doesn't exist (only in CLI mode; in API use PIL Image directly) | Return HTTP 400 |
| `TypeError` | Unsupported image_input type | Return HTTP 400 |
| `heatmap_path` is `None` | Grad-CAM failed on the image | Continue — set `heatmap_url: null` in response |

---

## Quick Startup Pattern for FastAPI

```python
# main.py
import io
from pathlib import Path
from PIL import Image
from fastapi import FastAPI, UploadFile, Form
from ml.predict import load_model, get_device
from ml.infer import run_ml_pipeline

app = FastAPI()
device = get_device()
model, class_names = load_model()  # once at startup

HEATMAP_DIR = Path("ml/heatmaps")

@app.post("/predict")
async def predict(file: UploadFile, crop: str = Form(...)):
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")

    ml_result = run_ml_pipeline(
        image_input=image,
        crop=crop,
        model=model,
        class_names=class_names,
        device=device,
        heatmap_dir=HEATMAP_DIR,
    )

    # TODO: add severity, risk, advisory, gemini, escalation, case_id, timestamp, i18n
    return ml_result  # replace with full contract response
```

---

## Files You Need From `ml/`

| File | Purpose |
|---|---|
| `ml/infer.py` | **Main handoff interface — import this** |
| `ml/predict.py` | Crop-aware EfficientNet-B0 inference |
| `ml/gradcam.py` | Grad-CAM + affected_pct |
| `ml/severity.py` | Deterministic severity from affected_pct |
| `ml/risk.py` | Deterministic 72-hour risk scoring |
| `ml/gemini_explainer.py` | Gemini 2.5 Flash-Lite second opinion (optional) |
| `ml/model.py` | EfficientNet-B0 model definition |
| `ml/classes.json` | Ordered list of all 36 class names |
| `ml/checkpoints/best.pt` | Trained model weights (~16.5 MB) |

---

## Do Not Call These From the Backend

| File | Reason |
|---|---|
| `ml/train.py` | Training script only — do not import |
| `ml/ingest.py` | Dataset prep only — do not import |
| `ml/evaluate.py` | Evaluation script only — do not import |
| `ml/app.py` | Streamlit app — do not import in FastAPI |
| `ml/test_pipeline.py` | Test suite — do not import |
