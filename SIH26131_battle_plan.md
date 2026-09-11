# SIH26131 — AI Crop Doctor for Indian Farmers
### 48-hour on-spot battle plan · 6 members

---

## 0. Scope lock (read this first, agree in hour 0, never revisit)

**What we build:** A mobile-web app where a farmer picks their crop, takes a photo of a diseased leaf, and gets a plain-language diagnosis with a visual heatmap, a severity estimate, a 72-hour weather-based spread risk, and IPM-aligned advice in their language — plus an extension-officer dashboard showing all cases across the field/village.

**5 crops:** Rice, Chilli, Banana, Groundnut, Sugarcane.
(Radish + Cauliflower are also in our data — kept as a live "add a crop" demo moment.)

**One sentence pitch:** Every image our model is trained on was collected in real Indian fields — no PlantVillage lab photos — and every diagnosis above a severity threshold escalates to a human agriculture officer instead of telling a farmer to spray something.

**What we are NOT building.** This list is final. Anyone who proposes one of these after hour 0 gets ignored:

- Heavy RAG / vector DB / hallucinating LLM making primary diagnostic decisions (Gemini 2.5 Flash-Lite is integrated strictly as an auxiliary second-opinion & plain-language explanation layer, never overriding EfficientNet)
- Object detection or segmentation models
- Translation models or speech recognition models (we use static i18n dictionaries + browser native SpeechSynthesis)
- React Native / Flutter / native mobile app
- User auth, signup, OAuth
- Docker, Kubernetes, CI/CD
- Training from scratch, hyperparameter search, model ensembles
- Real-time video streaming

---

## 1. Data — three downloads, all Indian field-collected

| # | Dataset | Crops we take | Size | Link |
|---|---|---|---|---|
| 1 | Paddy Doctor (Kaggle competition, 480×640 version) | **Rice** — 10 classes | ~1 GB | `kaggle.com/datasets/imbikramsaha/paddy-doctor` (comp: `kaggle.com/competitions/paddy-disease-classification`) |
| 2 | Multi-Crop Disease Dataset (Tamil Nadu) | **Chilli, Banana, Groundnut** (+ Radish, Cauliflower spare) | ~4 GB | `data.mendeley.com/datasets/6243z8r6t6/1` |
| 3 | Sugarcane Leaf Disease Dataset (Maharashtra) | **Sugarcane** — 5 classes | ~0.5 GB | `data.mendeley.com/datasets/9424skmnrk/1` |

**Provenance facts to use in the pitch (verify each before you say it on stage):**

- Dataset 1: 10,407 labeled training images, 10 classes, shot in real paddy fields near Tirunelveli, Tamil Nadu, labeled with help from an agricultural officer. Metadata includes paddy variety and crop age.
- Dataset 2: 23,000+ images at 640×640 with bounding-box annotations, 30+ classes, collected from real fields in Chengalpattu, Kanchipuram and Krishnagiri districts, Tamil Nadu.
- Dataset 3: 2,569 images, 5 classes (healthy, mosaic, redrot, rust, yellow), Maharashtra, captured on a mix of smartphone models for device diversity.

**Datasets we deliberately excluded, and why (a judge may ask):**

- **PlantVillage** — uniform grey lab backgrounds. Models score ~99% on it and collapse on real field photos because the background is the shortcut feature. Excluded entirely.
- **The popular 8,814-image Mendeley chilli set** — collected in Bangladesh (Ashulia, Narsingdi, Cumilla, Feni, Noakhali, Laksham), not India. Agro-climatically similar and usable, but we can't call it Indian, so we used the Tamil Nadu chilli data instead.
- **SAR-CLD-2024 cotton** — Gazipur, Bangladesh. Same reason. This is why cotton isn't in our MVP.

> Several datasets with Indian-sounding names are Bangladesh-collected. Knowing this is a credibility point. Do not blur it.

---

## 2. The key architecture decisions that make this survivable

### 2.1 One model over all crops, masked at inference

Do **not** train five classifiers. Train **one flat classifier over all ~35 classes**, then mask logits using the crop the farmer already selected.

The farmer knows what they planted. One dropdown tap deletes an entire ML problem.

Folder convention — `crop__disease`, double underscore as separator:

```
data/train/rice__brown_spot/
data/train/rice__tungro/
data/train/rice__normal/
data/train/chilli__leaf_curl/
data/train/banana__sigatoka/
data/train/groundnut__rust/
data/train/sugarcane__redrot/
data/train/sugarcane__healthy/
```

Inference:

```python
import numpy as np

def predict(img, crop, model, classes):
    logits = model(preprocess(img))[0]                     # shape [35]
    idx = [i for i, c in enumerate(classes) if c.startswith(crop + "__")]
    sub = logits[idx]
    probs = np.exp(sub - sub.max()); probs /= probs.sum()   # softmax over crop only
    best = int(np.argmax(probs))
    return classes[idx[best]], float(probs[best])
```

One training run. Crop-conditioned accuracy. ~15 lines.

**Say this before a judge asks:** because each crop comes from a different dataset with a different camera and location, unconditioned cross-crop accuracy would be meaningless — the model would partly be recognizing the capture device. Conditioning on the farmer's crop selection is a deliberate design choice, not a shortcut. Volunteering this makes you look sharp; getting caught on it does the opposite.

### 2.2 Grad-CAM replaces YOLO

There are no usable bounding boxes for most of this data and annotating during a hackathon is suicide.

Train a plain classifier, then Grad-CAM the last conv layer to produce a heatmap over the lesion. ~20 lines, zero annotation, and on screen it reads exactly like detection.

That heatmap also gives you severity for free:

```
affected_pct = (grad_cam_mask > 0.5).sum() / leaf_pixel_count * 100
```

Fallback if Grad-CAM misbehaves: HSV threshold for brown/yellow pixels inside the leaf region. Less impressive, works instantly, nobody will interrogate it.

### 2.3 Everything downstream is rules, not ML

Severity, spread risk, and advisory selection are deterministic rule engines. There is no dataset for any of them, so training a model would be fabrication. Real agromet advisories are rule-based too — this is the correct approach, not a compromise.

### 2.4 Gemini 2.5 Flash-Lite as Multimodal Second-Opinion & Explainer

Primary vision diagnosis is strictly performed by our trained EfficientNet-B0 model. However, raw disease labels and heatmaps are not always self-explanatory to smallholder farmers. 

We integrate **Gemini 2.5 Flash-Lite** (`ml/gemini_explainer.py` via `google-genai`) to serve two critical roles:
1. **Multimodal Second Opinion:** Gemini independently inspects the leaf image with strict structured JSON schema output and compares its finding with the EfficientNet prediction (`agreement: true/false`).
2. **Farmer-Friendly Visual Evidence & Plain Explanation:** Returns 2–4 factual visual observations (e.g. "yellow wavy margins") and a 2–4 sentence jargon-free farmer explanation in simple terms.
3. **Escalation Safeguard:** Gemini NEVER overrides EfficientNet. If Gemini strongly disagrees with EfficientNet, it triggers human officer escalation (`escalate = true`), preventing silent misdiagnoses.
4. **Offline Resilient:** If `GEMINI_API_KEY` is not configured or the network times out, the backend gracefully defaults `gemini: null` and the core flow continues without crashing.

---

## 3. The JSON contract — written in hour 1, frozen forever

Everything is built against this. Backend serves it hardcoded from hour 1 so frontends never wait on the model.

```json
{
  "crop": "rice",
  "crop_label_i18n": { "en": "Rice", "hi": "धान", "ta": "நெல்" },
  "disease": "bacterial_leaf_blight",
  "disease_label_i18n": { "en": "Bacterial Leaf Blight", "hi": "...", "ta": "..." },
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
    "reasons": ["humidity_88pct", "rainfall_forecast_18mm", "susceptible_stage"]
  },
  "advisory": {
    "what_it_is": "...",
    "do_now": ["...", "...", "..."],
    "watch_for": ["...", "..."],
    "avoid": ["..."],
    "source": "TNAU Agritech Portal — Crop Protection"
  },
  "gemini": {
    "gemini_assessment": "bacterial_leaf_blight",
    "agreement": true,
    "assessment_confidence": "high",
    "visual_evidence": [
      "Yellow to straw-coloured necrotic lesions along leaf margins",
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
  "case_id": "CASE-0042",
  "timestamp": "2026-08-28T10:14:00+05:30"
}
```

**Rule: nobody changes a key name after hour 2 without telling all six people in the group chat.**

---

## 4. Team distribution

### Assignment table

| Code | Role | Owns | Never touches |
|---|---|---|---|
| **M1** | Model lead | Ingest script, training, Grad-CAM, weights, `classes.json` | Frontend, PPT |
| **B1** | Backend | Mock server, FastAPI, `/predict`, SQLite, weather API | Model training, CSS |
| **F1** | Frontend — farmer | The farmer flow. Demo-critical path. | Dashboard, backend |
| **F2** | Frontend — officer | Dashboard, charts, case list, shared components | Farmer flow after hour 20 |
| **C1** | Content & rules | `advisory.json`, severity/risk rules, `i18n.json`, seed data | Anything requiring a debugger |
| **I1** | Integration & demo | Git merges, deploy, demo video, PPT, demo script, Q&A prep | Feature code |

**Hard rules:**
- Only **M1** uses the GPU / Colab account. Nobody else runs a training job.
- Branch per person. Merges go through **I1** only. No force pushes.
- **I1 does not write features.** The moment I1 starts coding, nobody is watching the clock and the demo won't get recorded.
- If you're blocked for more than 20 minutes, say it out loud. Silent blocking kills hackathons.

---

### M1 — Model lead

Hardest role, and the one with a real deadline. Your job is done at hour 26; after that you help F1 polish.

| Hours | Deliverable |
|---|---|
| 0–1 | Agree contract. Start all three dataset extractions. |
| 1–5 | **`ingest.py`** — the critical path. Three inconsistent folder layouts → one `data/train/crop__disease/` + `data/val/...` tree. Cap **300 images per class**. 80/20 split. Emit `classes.json`. |
| 5–6 | Sanity check: print class counts, open 5 random images per class, confirm nothing is mislabeled or in the wrong crop. |
| 6–9 | **Run 1.** EfficientNet-B0 (timm) or `yolov8n-cls`, 224px, 8 epochs, standard augment. Save `best.pt`. |
| 9–11 | Grad-CAM working. `heatmap(img) → PNG + affected_pct`. Hand M1's `infer.py` to B1. |
| 11–12 | **Gate: end-to-end works.** Photo in → disease + confidence + heatmap out. |
| 12–20 | **Run 2** at 320px, 15 epochs, in the background. Meanwhile write the per-class accuracy table for the PPT. |
| 20–26 | Freeze best weights. Confusion matrix screenshot for the deck. Hand off final numbers to I1. |
| 26+ | Support F1. Enable radish/cauliflower classes if the stretch goal is on. |

**Notes.** Expect roughly 10–11k images after the 300/class cap. That's ~30 min per run on a Colab free T4 — comfortably three runs. Budget **more** than 4 hours for `ingest.py`, not less: Mendeley folder structures are inconsistent and you will hit at least one surprise (nested zips, spaces in class names, an `augmented/` folder that must be excluded or your split leaks).

**Do not chase accuracy.** On the paddy data, above 0.95 is easy and 0.98 was the actual competition challenge. Your model is a solved problem. Every hour past 26 spent on it is an hour stolen from the product.

---

### B1 — Backend

| Hours | Deliverable |
|---|---|
| 0–1 | Agree contract with the team. |
| 1–**3** | **Mock FastAPI server live.** `POST /predict` returns the hardcoded JSON above with a 1.5s artificial delay. This unblocks F1 and F2 — treat it as your most urgent task of the whole 48h. |
| 3–6 | SQLite schema: `cases(id, crop, disease, confidence, severity, affected_pct, risk, gemini_agreement, lat, lon, village, status, created_at)`. `GET /cases`, `PATCH /cases/{id}/status`. |
| 6–9 | Open-Meteo integration: `lat/lon → {humidity, rain_72h, temp_avg}`. No API key needed. Cache responses — the venue wifi will fail at some point and a cached fallback saves the demo. |
| 9–12 | Swap in M1's `predict.py` + `gradcam.py`. Serve heatmap PNGs from `/static/`. **Gate at hour 12.** |
| 12–16 | Wire C1's rule engine: severity buckets, risk levels, advisory lookup. Wire `ml/gemini_explainer.py` as auxiliary second opinion (graceful degradation to `gemini: null` if API key missing/offline). Evaluate escalation rules (including model vs Gemini disagreement). |
| 16–22 | `GET /stats` for the dashboard: counts by crop, by severity, by disease, 7-day trend. |
| 22–30 | Sleep shift. Then: error handling, image size limits, graceful degradation when the weather API or Gemini times out. |
| 30+ | Support I1 with deploy. Freeze at hour 38. |

**Hard requirement:** the app must still function with no internet or without Gemini. If the weather call fails, return `risk_72h: {level: "unknown"}`. If Gemini fails/offline, return `gemini: null` and render the rest. A demo that white-screens because an API timed out is a lost hackathon.

---

### F1 — Frontend, farmer flow

The single most important screen in the project. Guard your time.

| Hours | Deliverable |
|---|---|
| 1–3 | Vite + React + Tailwind PWA scaffold, mobile viewport. |
| 3–8 | **Screen 1:** crop picker — 5 huge tiles with icons and native-script labels. **Screen 2:** camera / upload. Both against the mock. |
| 8–14 | **Screen 3: the result screen.** This is the money shot. Photo with heatmap overlay, big severity chip, affected-area ring, risk badge, expandable advisory blocks (Do now / Watch for / Avoid), and **Gemini Second Opinion card** (AI agreement badge, observed symptoms, plain explanation). |
| 14–18 | Language switcher pulling from `i18n.json`. Test that Devanagari and Tamil don't break your layout — they're taller than Latin and will overflow tight containers. |
| 18–24 | "Send to agriculture officer" button → `POST /cases`. Confirmation state. Escalation banner if severe or Gemini disagreed. |
| 24–30 | Sleep shift. Then polish: loading states, error states, offline banner, transitions. |
| 30–36 | Voice output — browser `speechSynthesis` with `lang: 'hi-IN'` / `'ta-IN'`. A speaker icon on the result screen reads `gemini.farmer_explanation` (or advisory) aloud. ~30 minutes of work, and it's the feature judges remember. |
| 36+ | Freeze. Help I1 rehearse. |

**Design constraints, non-negotiable:** minimum 18px body text, minimum 56px tap targets, icon on every button, no screen requiring more than one decision. Assume the user has low digital literacy and is standing in a field in bright sunlight — high contrast, no thin grey text.

---

### F2 — Frontend, officer dashboard

| Hours | Deliverable |
|---|---|
| 1–4 | Shared component library with F1 (buttons, cards, chips) so styling isn't done twice. Agree this split early. |
| 4–10 | Case list table: crop, disease, severity, risk, Gemini agreement flag, village, date, status. Filter by crop, severity, and AI disagreement. |
| 10–16 | Stat cards (total scanned / healthy / at-risk / infected / disagreements) + two Recharts charts: cases by crop, cases over time. |
| 16–20 | Case detail drawer: photo, heatmap, full model output, top-3 predictions, Gemini assessment & symptoms breakdown, "Confirm diagnosis" / "Override" / "Request lab test" actions. **This is your expert-validation loop — the PS explicitly asks for it, so make it visible.** |
| 20–24 | Village-level view. A simple table grouped by village with severity counts beats a broken map. Only attempt a Leaflet map if you're ahead. |
| 24–30 | Sleep shift, then polish. |
| 30–36 | Load C1's seed data and make sure the dashboard looks *populated and plausible*, not empty. |
| 36+ | Freeze. |

---

### C1 — Content & rules

Sounds like the boring job. It is the difference between "another YOLO demo" and something a judge remembers.

| Hours | Deliverable |
|---|---|
| 1–4 | **8 pathogen-class advisory templates** (see §5). Do not write 35 advisories from scratch. |
| 4–10 | Map every class in `classes.json` to a template + 2 crop-specific lines. Source: TNAU Agritech Portal crop protection pages (`agritech.tnau.ac.in/crop_protection/crop_prot.html`) and ICAR institute IPM packages. **Record the source URL for every entry.** |
| 10–13 | Severity + risk rule tables (see §6). Hand as a Python dict to B1. |
| 13–18 | `i18n.json` — ~50 UI strings + all disease names in English / Hindi / Tamil. Get a native speaker on the team to check the Tamil; machine-translated agricultural terms come out wrong and a Tamil-speaking judge will notice immediately. |
| 18–24 | Seed data: **40 realistic cases** spread across 5 crops, 4 villages, varied severity and dates. Realism matters — plausible village names, sensible disease-to-season pairing, a believable severity distribution. |
| 24–30 | Sleep shift. |
| 30–38 | Write the PPT content with I1. You know the domain material better than anyone else on the team by this point. |

**Absolute rule on advisories: never state a specific chemical, dose, or ml/litre figure.** Every entry ends in cultural/mechanical control plus escalation to an officer. India has adopted IPM as national crop protection policy — aligning with that is both safer and scores better than a spray recommendation you can't source.

---

### I1 — Integration & demo

You are the reason this project ships. You write no features.

| Hours | Deliverable |
|---|---|
| 0–1 | Repo, branches, `README`, group chat pinned with the JSON contract. |
| 1–6 | Deploy target working end-to-end *empty*: frontend on Vercel/Netlify, backend on Render or a laptop + ngrok. Have **both** ready. |
| 6–12 | Merge traffic. Enforce the hour-12 gate. If end-to-end isn't working at hour 12, you make the call to cut the dashboard. |
| 12–24 | Merges, conflict resolution, keeping the timeline visible on a whiteboard. Every 4 hours ask each person: on track, or cut something? |
| 24–30 | Sleep shift. Then: **start the PPT.** 8 slides max — problem, why existing solutions fall short, our approach, architecture, Indian-data provenance, demo screenshots, results table with limitations stated, roadmap. |
| 30–36 | Write the **90-second demo script**, word for word, and assign who says what. |
| 36–**40** | **Record the demo video.** Screen recording plus voiceover. This is your insurance against a live-demo failure and it is not optional. |
| 40–44 | **Code freeze at hour 40.** Rehearse the live demo three times, out loud, with a timer. |
| 44–46 | Q&A prep (see §9). Everyone must be able to answer the dataset-provenance question. |
| 46–48 | Buffer. Nothing new gets built. Sleep if you can. |

---

## 5. Advisory template system

35 classes is too many to write individually. Write **8 templates by pathogen type**, then map each disease to one plus 2 crop-specific lines. IPM guidance genuinely clusters this way, so it's agronomically sound, and it cuts the work ~70%.

| Template | Applies to | Core "do now" pattern |
|---|---|---|
| T1 Fungal leaf spot | brown spot, cercospora, sigatoka, early blight | Remove and destroy affected leaves; improve air circulation; avoid overhead irrigation |
| T2 Bacterial blight/streak | bacterial leaf blight, bacterial leaf streak, bacterial panicle blight | Avoid working in wet fields; do not reuse tools between plots; drain standing water |
| T3 Viral / vector-borne | tungro, leaf curl virus, mosaic | Remove infected plants entirely; control the insect vector; the disease itself is not curable |
| T4 Sucking pests | thrips, aphids, hispa, whitefly | Inspect leaf undersides; encourage natural enemies; monitor population threshold before any intervention |
| T5 Boring pests | dead heart, stem borer, redrot association | Cut and destroy affected tillers; check for the entry hole; monitor with traps |
| T6 Rust | groundnut rust, sugarcane rust | Remove severely affected leaves; avoid dense canopy; monitor spread rate |
| T7 Powdery/downy mildew | downy mildew, powdery mildew | Improve spacing and airflow; avoid evening irrigation |
| T8 Nutrient / abiotic | yellow disease, nutrient deficiency | Not a pathogen — check soil and water; recommend a soil test before any input |

Each `advisory.json` entry:

```json
{
  "class": "groundnut__rust",
  "template": "T6",
  "what_it_is": "A fungal disease causing rusty orange pustules on the underside of leaves.",
  "do_now": ["<T6 line 1>", "<T6 line 2>", "<crop-specific line>"],
  "watch_for": ["Pustules spreading to upper leaves", "Early leaf drop"],
  "avoid": ["Dense planting in the next season"],
  "source": "https://agritech.tnau.ac.in/crop_protection/..."
}
```

---

## 6. Severity and risk rules

**Severity** from `affected_pct`:

| affected_pct | severity | UI |
|---|---|---|
| 0–5 | trace | 🟢 |
| 6–15 | mild | 🟡 |
| 16–35 | moderate | 🟠 |
| 36+ | severe | 🔴 |

**72-hour spread risk** — score, then bucket:

```python
score = 0
if humidity_avg > 80: score += 2
elif humidity_avg > 65: score += 1
if rain_72h_mm > 15:   score += 2
elif rain_72h_mm > 5:  score += 1
if 20 <= temp_avg <= 30: score += 1        # optimal range for most fungal pathogens
if severity in ("moderate", "severe"): score += 1
if pathogen_type in ("T1", "T2", "T7"): score += 1   # moisture-driven

level = "high" if score >= 5 else "moderate" if score >= 3 else "low"
```

**Escalate to officer if:** `severity in (moderate, severe)` OR `risk == high` OR `confidence < 0.70`.

That last condition matters — low confidence routing to a human is exactly the kind of design judges reward, and it's one line of code.

---

## 7. Pre-hackathon prep (all legal — public data and your own environment)

- [ ] All three datasets downloaded to **a USB drive**, ~6 GB. Venue wifi will betray you.
- [ ] Kaggle account + API token (`kaggle.json`) on M1's machine.
- [ ] Confirm the training environment. If nobody has a GPU laptop, verify Colab free T4 works and know the fallback: a 100-images-per-class subset.
- [ ] Everyone runs their `pip install` / `npm install` once at home. Nobody debugs a wheel build at hour 3.
- [ ] M1 has run Grad-CAM once on any dataset. It's the one unfamiliar piece that will bite.
- [ ] Read the problem statement wording once more and note the exact phrases it uses — mirror them in the PPT.
- [ ] One person has a phone hotspot as wifi backup.
- [ ] Extension cords and a power strip. Six laptops, two sockets, 48 hours.

**Stack:**
```bash
pip install torch torchvision timm ultralytics fastapi uvicorn \
            pillow opencv-python grad-cam requests python-multipart \
            google-genai python-dotenv
npm create vite@latest -- --template react
npm install tailwindcss recharts lucide-react
```

---

## 8. Master timeline

| Hours | Milestone |
|---|---|
| 0–1 | Scope lock. JSON contract written. Repo up. Datasets extracting. |
| 1–3 | **Mock API live.** Both frontends unblocked. |
| 1–5 | `ingest.py` — the real critical path. |
| 5–9 | Training run 1. Frontends building against mock. |
| 9–12 | Grad-CAM + real `/predict`. |
| **12** | **GATE: end-to-end works.** Photo → diagnosis + heatmap in the browser. If not: cut the officer dashboard, F2 moves to help F1. |
| 12–18 | Advisory, severity, risk, i18n, and Gemini second-opinion explainer wired in. |
| 18–22 | Officer dashboard, seeded with 40 cases (including model-Gemini disagreement examples). |
| 22–26 | Sleep shifts (3 people at a time). Training run 2 in the background. |
| 26–34 | Voice output. Farmer-screen polish. Dashboard polish. |
| 34–38 | **One** stretch goal only: enable radish + cauliflower as a live "watch us add crops" moment (cheap, demos well) OR video frame-sampling for a field summary. Not both. |
| 38–40 | **Record demo video. Code freeze at hour 40.** |
| 40–44 | PPT finished. Rehearse live demo 3× with a timer. |
| 44–46 | Q&A prep. |
| 46–48 | Buffer. Build nothing. |

---

## 9. Q&A prep — the questions you will actually get

**"Isn't this just an LLM doing the diagnosis?"**
No. An LLM alone has no spatial grounding, can hallucinate, and cannot produce localized lesion activations. 100% of our primary diagnosis and Grad-CAM lesion segmentation is performed by our fine-tuned EfficientNet-B0 trained on real Indian field datasets. Gemini 2.5 Flash-Lite acts solely as an auxiliary second-opinion consultant — it extracts factual visual observations and generates a plain-language summary for the farmer. If Gemini strongly disagrees with EfficientNet, the case is automatically escalated to a human agricultural extension officer.

**"Isn't this just PlantVillage with a UI?"**
No. We excluded PlantVillage deliberately — its uniform lab backgrounds let models score 99% and then fail on real photos. All three of our datasets were collected in real Indian fields, in Tamil Nadu and Maharashtra.

**"What's your accuracy?"**
Give the number, then immediately give the limitation: this is a small number of districts and seasons per crop, so generalization to other agro-climatic zones is unvalidated. That's precisely why anything above a severity threshold routes to a human extension officer rather than issuing a spray instruction.

**"Why does the farmer have to select the crop?"**
Because each crop's data comes from a different location and camera, so an unconditioned model would partly be learning the capture device. Conditioning on crop selection is a deliberate correctness decision, and it costs the farmer one tap on something they already know.

**"Can a farmer with low digital literacy actually use this?"**
Three taps to a result. Icons on every control, native-script labels, and voice output. No typing anywhere in the flow.

**"Why don't you recommend a pesticide?"**
India's national crop protection policy is IPM. Naming a chemical and dose without location- and crop-specific authority is how pesticide overuse happens. We give cultural and mechanical controls plus escalation to an officer, with a cited source on every advisory.

**"How would you scale to 50 crops?"**
Add classes to the same flat head and extend the mask. Adding a crop is a data problem, not an architecture change. The advisory layer scales through the 8 pathogen templates.

---

## 10. Risk register

| Risk | Mitigation |
|---|---|
| No GPU at venue | Colab free T4. Fallback: 100 images/class subset, MobileNetV3-Small at 160px. |
| Venue wifi dies | Datasets pre-downloaded to USB. Weather API responses cached. Laptop + ngrok as deploy fallback. Demo video recorded by hour 40. |
| `ingest.py` overruns | Ship rice + sugarcane only (both clean, simple structures) and add the Multi-Crop three when the script works. Never let this block hour 12. |
| Grad-CAM won't cooperate | HSV brown/yellow threshold instead. 20 minutes, works immediately. |
| Live demo crashes | Play the recorded video. Never apologize; just say "here's the recorded run" and keep talking. |
| Someone disappears down a rabbit hole | I1 checks in with all five every 4 hours. Blocked over 20 minutes must be said out loud. |
| Merge hell at hour 38 | Branch per person, merges through I1 only, freeze at 40. |

---

## 11. Definition of done

**Minimum viable (must exist by hour 12):**
- Pick crop → upload photo → disease name + confidence + heatmap on screen

**Target (hour 34):**
- 5 crops, ~35 classes, Grad-CAM heatmap, severity %, 72h weather risk, templated IPM advisory with sources, 3 languages, voice output, officer dashboard with 40 seeded cases and a confirm/override loop

**Stretch (only if genuinely ahead at hour 34):**
- Live crop addition (radish/cauliflower) **or** video frame-sampling field summary

---

### The one-line reminder for hour 30 when you're tired and want to retrain the model

The model is a solved problem. The product is not. Go polish the farmer screen.
