# PattaPe

AI-powered crop disease detection for Indian farmers.

SIH Problem Statement ID: SIH26131

---

## Overview

PattaPe is a field-ready diagnostic tool that lets a farmer photograph a crop leaf, select their crop, and receive an instant, actionable disease diagnosis in under 30 seconds. The system runs a fine-tuned EfficientNet-B0 model for primary classification, generates a Grad-CAM heatmap to highlight the diseased region, and calls Gemini 2.5 Flash-Lite as an independent second opinion. All output is returned in a single structured JSON response that the React frontend renders for the farmer.

Supported crops: Rice, Banana, Chilli, Groundnut, Sugarcane.

---

## Architecture

```
Browser (React/Vite)
       |  multipart POST /predict
       v
FastAPI Backend (uvicorn)
       |
       +-- model_service.py  (PyTorch EfficientNet-B0 + Grad-CAM)
       +-- predict_service.py (orchestrates severity, risk, advisory, i18n, Gemini, escalation)
       +-- schemas.py        (Pydantic models, strictly enforces CONTRACT.md)
       |
       v
ml/infer.py              (ML pipeline entry point)
ml/gemini_explainer.py   (Gemini second-opinion layer)
```

The API contract is frozen in [CONTRACT.md](CONTRACT.md). The frontend consumes exactly the fields documented there and nothing else.

---

## Repository Structure

```
PattaPe/
  backend/
    app/
      main.py              FastAPI app entry point, CORS, static file serving
      schemas.py           Pydantic request/response models
      services/
        model_service.py   PyTorch inference + Grad-CAM, async wrapper
        predict_service.py Orchestrator: severity, risk, advisory, Gemini, escalation
    requirements.txt       Python dependencies for the backend only
    static/
      heatmaps/            Grad-CAM images served at /static/heatmaps/<uuid>.png
  ml/
    infer.py               Single entry point for ML pipeline
    predict.py             EfficientNet-B0 crop-aware classification
    gradcam.py             Grad-CAM heatmap generation
    gemini_explainer.py    Gemini second-opinion integration
    model.py               Model architecture definition
    train.py               Training script (offline, not run in production)
    classes.json           Class-to-index mapping for the trained checkpoint
    checkpoints/
      best.pt              Trained model weights (not committed to git)
  src/                     React frontend source
    pages/
    components/
    services/api.js        All fetch calls to the backend
  index.html
  vite.config.js
  package.json
  requirements.txt         Consolidated Python dependencies (backend + ML)
  CONTRACT.md              Frozen API contract
  .env.example             Template for required environment variables
```

---

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- A Google Gemini API key (free tier works)
- PyTorch installed for your target hardware (see note in requirements.txt)

---

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd PattaPe
```

### 2. Configure environment variables

Copy the example file and fill in your key:

```bash
cp .env.example .env
```

Edit `.env`:

```
GEMINI_API_KEY=your_key_here
USE_MOCK_MODEL=false
```

Set `USE_MOCK_MODEL=true` if you do not have the trained checkpoint and want to run the backend with simulated responses.

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

Install PyTorch separately for your hardware. CPU-only example:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### 4. Place the trained checkpoint

Copy `best.pt` into `ml/checkpoints/best.pt`. The backend will not start real inference without it unless `USE_MOCK_MODEL=true`.

### 5. Install frontend dependencies

```bash
npm install
```

---

## Running Locally

Start both servers in separate terminals.

**Backend:**

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`. The Vite dev server proxies `/api` and `/static` requests to the FastAPI backend at `http://127.0.0.1:8000`.

---

## API

**POST /predict**

Accepts a multipart form with:

| Field | Type   | Required | Description                                    |
|-------|--------|----------|------------------------------------------------|
| image | file   | yes      | JPEG or PNG leaf photograph                    |
| crop  | string | yes      | One of: rice, banana, chilli, groundnut, sugarcane |
| lat   | float  | no       | Latitude for 72-hour weather risk assessment   |
| lon   | float  | no       | Longitude for 72-hour weather risk assessment  |

Returns a `PredictResponse` JSON object. See [CONTRACT.md](CONTRACT.md) for the full schema.

**GET /health**

Returns server status and model load state.

---

## ML Pipeline

The model is an EfficientNet-B0 fine-tuned on a curated dataset of 5 Indian crops across 21 disease classes. Training was done offline; the production backend loads `best.pt` once at startup and reuses it for all requests.

Grad-CAM targets the last convolutional block and produces a heatmap PNG saved to `backend/static/heatmaps/`. The `heatmap_url` field in the response is a relative URL served by FastAPI's static file handler.

Gemini runs after the primary model and independently assesses the image. It never overrides the EfficientNet prediction. Its `agreement` field triggers escalation if it disagrees with medium or high confidence.

---

## Key Configuration

| Variable         | Default | Description                                             |
|------------------|---------|---------------------------------------------------------|
| GEMINI_API_KEY   | -       | Required for second-opinion layer                       |
| USE_MOCK_MODEL   | false   | If true, skips PyTorch and returns simulated output     |
| MODEL_TIMEOUT    | 30.0s   | Seconds before inference times out and fallback is used |

---

## Testing

Run the backend unit and integration tests:

```bash
cd backend
pytest tests/ -v
```

Run the ML pipeline tests:

```bash
cd ml
pytest test_pipeline.py -v
```

---

## Deployment

The backend is a standard ASGI app deployable to any Python host (Railway, Render, Fly.io, VPS). The frontend is a static Vite build deployable to Vercel, Netlify, or Cloudflare Pages.

For local tunnel access from a mobile device on the same network:

```bash
# backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# frontend
npm run dev -- --host
```

Then access the frontend via your machine's local IP address on port 5173.

---

## Contract

The API response schema is defined and frozen in [CONTRACT.md](CONTRACT.md). Any change to field names, types, or the escalation rule requires a version bump and coordination across the backend and frontend.

---

## Acknowledgments

Built for Smart India Hackathon 2026 (SIH26131) by Team PattaPe.

Dataset sourced from TNAU Agritech Portal, ICAR-IIHR, and field collections.
Disease advisories based on TNAU, ICAR-IIHR, NRCB, and SBI Coimbatore recommendations.
