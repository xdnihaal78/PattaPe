# 🌱 PattaPe

## AI Crop Doctor for Indian Farmers

> An AI-powered crop disease diagnosis and decision-support system built for Indian agriculture.

---

## 🚜 Overview

**PattaPe** is a mobile-first AI Crop Doctor that helps farmers identify crop diseases using a photograph of a leaf.

A farmer selects their crop, uploads or captures a leaf image, and receives:

- 🌾 Disease diagnosis
- 📊 Confidence score and top-3 predictions
- 🔥 Grad-CAM visual heatmap
- 📐 Estimated affected leaf area
- 🚦 Disease severity
- 🌦️ 72-hour disease-spread risk based on weather
- 💡 IPM-aligned agricultural advisory
- 🤖 Gemini-powered second opinion and explanation
- 👨‍🌾 Automatic escalation to an agricultural extension officer when required

PattaPe is designed as a **human-in-the-loop decision-support system**, rather than an autonomous pesticide recommendation system.

---

# 🎯 Problem

Indian farmers can face significant delays when trying to identify crop diseases and obtain reliable agricultural advice.

Disease symptoms can be difficult to identify visually, while agricultural extension officers may have to handle many cases simultaneously.

This can lead to:

- Delayed diagnosis
- Disease spreading before intervention
- Difficulty understanding technical agricultural information
- Unnecessary or inappropriate pesticide usage
- Limited access to expert agricultural support

PattaPe aims to provide an initial, explainable diagnosis while ensuring uncertain and serious cases can be reviewed by a human agricultural officer.

---

# 💡 Our Solution

PattaPe combines computer vision, explainable AI, deterministic agricultural rules, weather information, and human validation.

```text
Farmer
  │
  ▼
Select Crop
  │
  ▼
Capture / Upload Leaf Image
  │
  ▼
┌─────────────────────────────┐
│       EfficientNet-B0       │
│      Primary Diagnosis      │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
    Disease          Grad-CAM
    + Top-3           Heatmap
       │                │
       └───────┬────────┘
               ▼
        Affected Area %
               │
               ▼
       Backend Rule Engine
               │
       ┌───────┼─────────┐
       ▼       ▼         ▼
   Severity   72h Risk   Advisory
       │       │         │
       └───────┼─────────┘
               ▼
     Gemini 2.5 Flash-Lite
       Second Opinion
               │
               ▼
        Escalation Engine
          │           │
          ▼           ▼
       Farmer       Officer
         UI         Dashboard
```

---

# 🧠 AI Architecture

## EfficientNet-B0 — Primary Diagnosis

The primary crop-disease diagnosis is performed using a fine-tuned **EfficientNet-B0** model.

The model is trained across the supported crop-disease classes.

At inference time, the farmer's selected crop is used to restrict the model's predictions to that crop.

### Crop-aware inference

Instead of maintaining five independent classifiers:

```text
One EfficientNet-B0
        │
        ├── Banana
        ├── Chilli
        ├── Groundnut
        ├── Rice
        └── Sugarcane
```

the farmer's crop selection is used to mask irrelevant classes during inference.

This reduces unnecessary cross-crop competition and makes use of information the farmer already knows.

---

# 🔥 Explainable AI with Grad-CAM

PattaPe uses **Grad-CAM** to visualize the regions of the leaf that contributed to the model's prediction.

```text
Leaf Image
    +
EfficientNet Prediction
    │
    ▼
  Grad-CAM
    │
    ▼
Lesion Heatmap
```

The resulting heatmap is displayed to provide a visual explanation of the diagnosis.

Grad-CAM also provides the basis for estimating the percentage of leaf area affected.

```text
affected_pct =
activated lesion area / leaf area × 100
```

---

# 🚦 Severity Assessment

Severity is calculated using a deterministic rule based on the estimated affected leaf area.

| Affected Area | Severity |
|---:|---|
| 0–5% | Trace |
| 6–15% | Mild |
| 16–35% | Moderate |
| 36%+ | Severe |

This layer is deliberately rule-based rather than another machine-learning model.

---

# 🌦️ 72-Hour Disease Risk

PattaPe evaluates the potential for disease spread over the next 72 hours using agrometeorological conditions.

The risk engine considers factors including:

- Humidity
- Forecast rainfall
- Temperature
- Current disease severity
- Pathogen characteristics

The result is categorized as:

```text
Low
Moderate
High
```

If the weather service is unavailable, the system can safely return an `unknown` risk state without breaking the core diagnosis flow.

---

# 🤖 Gemini 2.5 Flash-Lite

Gemini is an **auxiliary layer**, not the primary diagnostic model.

The primary diagnosis always comes from EfficientNet-B0.

Gemini 2.5 Flash-Lite independently examines the uploaded image and provides:

- A second disease assessment
- Agreement/disagreement with EfficientNet
- Visual evidence
- Possible high-level causes
- A plain-language explanation for the farmer

### Important

**Gemini never overrides EfficientNet.**

```text
EfficientNet
     │
     │ Primary diagnosis
     ▼
   Result
     │
     ▼
  Gemini
     │
     ├── Independent second opinion
     ├── Visual evidence
     └── Farmer-friendly explanation
```

If Gemini disagrees strongly with the primary model, the case can be escalated to an agricultural officer instead of automatically selecting a different AI prediction.

If Gemini is unavailable, the core system continues operating and returns:

```json
{
  "gemini": null
}
```

---

# 👨‍🌾 Human-in-the-Loop Safety

PattaPe does not assume every AI prediction is correct.

A case is escalated when:

```text
Severity is Moderate or Severe
        OR
72-hour risk is High
        OR
EfficientNet confidence < 0.70
        OR
Gemini strongly disagrees with EfficientNet
```

This creates a safety-oriented workflow:

```text
             AI Diagnosis
                  │
        ┌─────────┴─────────┐
        │                   │
   Confident /            Serious /
     normal              uncertain
        │                   │
        ▼                   ▼
    Farmer UI         Officer Review
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
                Confirm           Override
```

The goal is not to replace agricultural expertise, but to make expert intervention more targeted and timely.

---

# 🌾 Supported Crops

The current model supports **5 Indian crops and 36 classes**.

| Crop | Classes |
|---|---:|
| Banana | 9 |
| Chilli | 6 |
| Groundnut | 6 |
| Rice | 10 |
| Sugarcane | 5 |
| **Total** | **36** |

### Banana

- Bract Mosaic Virus
- Cordana
- Healthy
- Insect Pest
- Moko
- Panama
- Pestalotiopsis
- Sigatoka
- Yellow Sigatoka

### Chilli

- Anthracnose
- Healthy
- Leaf Curl
- Leaf Spot
- Whitefly
- Yellowish

### Groundnut

- Early Leaf Spot
- Early Rust
- Healthy
- Late Leaf Spot
- Nutrition Deficiency
- Rust

### Rice

- Bacterial Leaf Blight
- Bacterial Leaf Streak
- Bacterial Panicle Blight
- Blast
- Brown Spot
- Dead Heart
- Downy Mildew
- Hispa
- Normal
- Tungro

### Sugarcane

- Healthy
- Mosaic
- Red Rot
- Rust
- Yellow

---

# 🇮🇳 Dataset Strategy

PattaPe is deliberately trained using **field-collected Indian agricultural datasets**.

The current system combines:

### Paddy Doctor

Used for the Rice classes.

### Multi-Crop Disease Dataset

Used for:

- Banana
- Chilli
- Groundnut

### Sugarcane Leaf Disease Dataset

Used for Sugarcane.

---

## Why Not PlantVillage?

PlantVillage was deliberately excluded from the core training data.

Controlled laboratory-style images can allow models to learn visual shortcuts such as background and capture conditions rather than robust disease symptoms.

PattaPe therefore prioritizes field-collected imagery that better reflects the environment in which farmers will actually use the system.

Non-Indian datasets were also avoided where they would conflict with the project's focus on Indian agricultural conditions.

---

# 💬 Farmer Experience

The farmer flow is intentionally simple:

```text
1. Select Crop
       ↓
2. Take / Upload Photo
       ↓
3. View Diagnosis
       ↓
4. Understand Severity & Risk
       ↓
5. Read / Listen to Advisory
       ↓
6. Contact Agricultural Officer if Escalated
```

The interface is designed around:

- Large touch targets
- Minimal typing
- Native-language labels
- Simple visual indicators
- High contrast
- Voice output
- Mobile-first design

Supported interface languages:

- English
- Hindi
- Tamil

---

# 👨‍💼 Agricultural Officer Dashboard

The officer dashboard provides an overview of cases submitted through the system.

Officers can view:

- Case ID
- Crop
- Disease
- Confidence
- Top-3 predictions
- Severity
- Affected area
- 72-hour risk
- Grad-CAM heatmap
- Gemini agreement/disagreement
- Case status

The dashboard allows officers to review cases requiring human validation and confirm or override AI results.

---

# 🔌 API

The primary integration endpoint is:

```http
POST /predict
```

The API contract is frozen in:

```text
CONTRACT.md
```

A typical response contains:

```json
{
  "crop": "rice",
  "disease": "bacterial_leaf_blight",
  "confidence": 0.94,
  "top3": [
    {
      "disease": "bacterial_leaf_blight",
      "confidence": 0.94
    }
  ],
  "severity": "moderate",
  "affected_pct": 26,
  "heatmap_url": "/static/heatmaps/abc123.png",
  "risk_72h": {
    "level": "high",
    "reasons": []
  },
  "advisory": {},
  "gemini": {},
  "escalate": true,
  "escalate_reason": "severity_moderate_and_risk_high",
  "case_id": "CASE-0042",
  "timestamp": "2026-08-28T10:14:00+05:30"
}
```

The API separates responsibilities between the ML, backend, and frontend layers.

---

# 🏗️ Project Architecture

```text
PattaPe/
│
├── README.md
├── CONTRACT.md
├── SIH26131_battle_plan.md
│
├── ml/
│   ├── model.py
│   ├── ingest.py
│   ├── train.py
│   ├── predict.py
│   ├── gradcam.py
│   ├── severity.py
│   ├── risk.py
│   ├── gemini_explainer.py
│   ├── evaluate.py
│   ├── infer.py
│   ├── test_pipeline.py
│   ├── app.py
│   ├── README.md
│   └── ML_HANDOFF.md
│
├── backend/
│   └── ...
│
├── frontend/
│   └── ...
│
└── ppt/
    └── ...
```

---

# 🧩 Technology Stack

## Machine Learning

- Python
- PyTorch
- Torchvision
- timm
- EfficientNet-B0
- Grad-CAM
- OpenCV
- scikit-learn

## Generative AI

- Google Gemini 2.5 Flash-Lite
- Google GenAI SDK

## Backend

- Python
- FastAPI
- Uvicorn
- SQLite
- Weather API integration

## Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- Lucide React
- Browser Speech Synthesis

---

# 📊 Current ML Performance

The current EfficientNet-B0 model was evaluated on:

- **36 classes**
- **5 crops**
- **2,073 validation images**

| Metric | Score |
|---|---:|
| Validation Accuracy | **90.88%** |
| Macro F1 | **90.04%** |
| Weighted F1 | **90.78%** |

The ML pipeline also includes automated tests covering the core inference and processing components.

---

# 🧪 ML Testing

The ML subsystem contains an automated test suite.

Run:

```bash
python ml/test_pipeline.py -v
```

Current test status:

```text
27 tests
27 passed
0 failed
0 errors
```

---

# ⚙️ Installation

## Prerequisites

### ML

- Python 3.10+
- PyTorch
- torchvision
- CUDA-capable GPU recommended for training
- Python virtual environment

### Backend

- Python 3.10+
- FastAPI
- Uvicorn

### Frontend

- Node.js
- npm

---

## Clone the repository

```bash
git clone https://github.com/xdnihaal78/PattaPe.git
cd PattaPe
```

---

## ML Setup

Create/activate the ML virtual environment.

### Windows

```powershell
.\ml\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r ml/requirements.txt
```

The trained model checkpoint is expected at:

```text
ml/checkpoints/best.pt
```

Dataset files are intentionally excluded from Git and should be provided separately.

---

## Run ML Tests

```bash
python ml/test_pipeline.py -v
```

---

## Run Model Evaluation

```bash
python ml/evaluate.py
```

Evaluation artifacts are written to:

```text
ml/outputs/
```

---

## Run the ML Demo

The Streamlit application is intended as an ML verification/demo harness.

```bash
streamlit run ml/app.py
```

This allows developers to test:

- Crop selection
- Image upload
- Disease prediction
- Confidence
- Top-3 predictions
- Grad-CAM
- Affected area
- Severity
- Gemini integration

The final production product is the backend + frontend application, not the Streamlit harness.

---

# 🔐 Environment Variables

Gemini requires an API key.

Create a `.env` file or configure the environment variable:

```text
GEMINI_API_KEY=your_api_key_here
```

Never commit API keys or other secrets to Git.

Gemini is optional for the core system. If unavailable, the diagnosis flow continues without the Gemini response.

---

# 🛡️ Design Principles

### 1. Explainability over black-box output

The system provides a visual explanation instead of returning only a disease name.

### 2. Human expertise over uncertain AI

Serious and uncertain cases are escalated.

### 3. Rules for deterministic decisions

Severity, weather risk and escalation use explicit rules rather than asking an LLM to make safety-critical decisions.

### 4. Indian agricultural context

Training data and advisory design are targeted toward Indian farming environments.

### 5. IPM-aligned recommendations

The system focuses on responsible crop-management actions rather than blindly prescribing pesticides.

### 6. Graceful degradation

External services such as Gemini and weather APIs should not cause the entire application to fail.

---

# ⚠️ Limitations

PattaPe is a hackathon prototype and has important limitations.

The current datasets do not represent every:

- Indian state
- Crop variety
- Season
- Climate
- Soil condition
- Smartphone camera
- Disease stage

Therefore, validation performance should not be interpreted as guaranteed real-world accuracy across India.

Additional field data and expert validation are required before production deployment.

---

# 🚀 Future Scope

Potential future improvements include:

- Expansion to more Indian crops
- More geographically diverse field datasets
- Additional seasons and crop varieties
- Larger expert-validated datasets
- Improved affected-area estimation
- Offline/on-device inference
- Continuous officer-feedback learning
- Additional Indian languages
- Field-level disease progression tracking
- Larger-scale agricultural officer networks

---

# 🏆 Why PattaPe?

PattaPe is not simply an image classifier.

It combines:

```text
Computer Vision
      +
Explainable AI
      +
Weather Intelligence
      +
Agricultural Rules
      +
Generative AI Second Opinion
      +
Human Expert Validation
```

The result is a complete crop-disease decision-support workflow designed around the realities of Indian agriculture.

---

# 📌 Current Status

## ML

- [x] Dataset ingestion
- [x] 36-class dataset
- [x] 5 crop support
- [x] EfficientNet-B0
- [x] Crop-aware inference
- [x] Top-3 predictions
- [x] Grad-CAM
- [x] Affected-area estimation
- [x] Severity engine
- [x] 72-hour risk engine
- [x] Gemini second opinion
- [x] Evaluation pipeline
- [x] ML → Backend handoff
- [x] Automated pipeline tests
- [x] ML documentation

## Backend

- [ ] FastAPI integration
- [ ] `/predict`
- [ ] Weather integration
- [ ] Advisory engine
- [ ] Escalation logic
- [ ] Case persistence
- [ ] Officer APIs
- [ ] Statistics

## Frontend

- [ ] Farmer PWA
- [ ] Diagnosis screen
- [ ] Heatmap display
- [ ] Advisory display
- [ ] Gemini card
- [ ] Language support
- [ ] Voice output
- [ ] Officer dashboard
- [ ] Validation workflow

---

# ⚠️ Disclaimer

PattaPe is a hackathon prototype and decision-support system.

AI predictions may be incorrect, especially for images, regions, crops, diseases or environmental conditions not represented in the training data.

The system is designed to assist farmers and agricultural officers, not replace professional agricultural diagnosis.

When a case is uncertain, severe, high-risk, or produces conflicting AI assessments, human agricultural expertise should take precedence.

---

## 🌱 PattaPe

### Diagnose earlier. Explain clearly. Escalate responsibly.

**Built for Smart India Hackathon — SIH26131**
