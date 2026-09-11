# PattaPe – Backend Integration Documentation

This document outlines the API specifications, data structures, and instructions for the backend team to connect their AI prediction service (`POST /predict`), crop data, and officer escalation endpoints with the **PattaPe Farmer Web App**.

---

## 🛠️ Frontend Service Layer Location

All API calls are decoupled and localized in **`src/services/api.js`**.  
Currently, it serves simulated response objects from **`src/services/mockData.js`**.

To connect to your real backend server (e.g. FastAPI / Flask / Node.js), update the base URL in `src/services/api.js`:

```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

---

## 📡 API Endpoints Specification

### 1. Crop List Endpoint
- **URL**: `GET /api/crops`
- **Description**: Fetches available crop categories for farmer selection.
- **Sample Response Body**:
```json
[
  {
    "id": "rice",
    "name": "Rice",
    "localName": "धान (Rice)",
    "icon": "🌾"
  },
  {
    "id": "chilli",
    "name": "Chilli",
    "localName": "मिर्च (Chilli)",
    "icon": "🌶️"
  },
  {
    "id": "banana",
    "name": "Banana",
    "localName": "केला (Banana)",
    "icon": "🍌"
  },
  {
    "id": "groundnut",
    "name": "Groundnut",
    "localName": "मूंगफली (Groundnut)",
    "icon": "🥜"
  },
  {
    "id": "sugarcane",
    "name": "Sugarcane",
    "localName": "गन्ना (Sugarcane)",
    "icon": "🎋"
  }
]
```

---

### 2. AI Leaf Disease Prediction Endpoint
- **URL**: `POST /predict` (or `POST /api/predict`)
- **Content-Type**: `multipart/form-data`
- **Request Form Parameters**:
  - `file`: File binary (JPEG, PNG, WebP)
  - `crop`: String (`rice`, `chilli`, `banana`, `groundnut`, `sugarcane`)

- **Expected Response Payload (JSON)**:
```json
{
  "success": true,
  "timestamp": "2026-09-11T12:00:00Z",
  "cropId": "chilli",
  "data": {
    "diseaseId": "chilli_curl",
    "diseaseName": "Chilli Leaf Curl Virus",
    "localDiseaseName": "मिर्च का पर्ण कुंचन रोग (Leaf Curl)",
    "scientificName": "Begomovirus",
    "cropName": "Chilli",
    "confidence": 95,
    "severity": "High",
    "severityColor": "#DC2626",
    "affectedAreaPercentage": 62,
    "summary": "Leaves curling upwards, puckered texture, and stunted plant growth.",
    "localSummary": "पत्तियां ऊपर की ओर मुड़ रही हैं और पौधे का विकास रुक गया है।",
    "weatherRisk": {
      "level": "High Risk",
      "riskScore": 80,
      "humidity": "78%",
      "tempRange": "28°C - 35°C",
      "forecastText": "Hot dry weather favoring whitefly vector spread.",
      "localForecastText": "सूखा और गर्म मौसम सफेद मक्खी के फैलाव को बढ़ाएगा।"
    },
    "advisory": {
      "cultural": [
        {
          "title": "Yellow Sticky Traps",
          "detail": "Install 12 yellow sticky traps per acre to trap whiteflies.",
          "local": "सफेद मक्खी नियंत्रण के लिए पीले चिपचिपे कार्ड लगाएं।"
        }
      ],
      "chemical": [
        {
          "title": "Imidacloprid 17.8% SL",
          "detail": "Spray 0.5 ml per Liter of water to control whitefly vector.",
          "local": "इमिडाक्लोप्रिड ०.५ मि.ली. प्रति लीटर पानी में मिलाकर स्प्रे करें।"
        }
      ],
      "prevention": [
        {
          "title": "Remove infected plants",
          "detail": "Uproot severely crumpled plants early.",
          "local": "अत्यधिक खराब पौधों को उखाड़ कर नष्ट करें।"
        }
      ]
    },
    "officerInfo": {
      "name": "Dr. Ramesh Kumar",
      "designation": "Senior Krishi Vigyan Kendra Officer",
      "center": "District KVK Agriculture Hub",
      "phone": "+91 98765 43210",
      "kisanHelpline": "1800-180-1551",
      "availableHours": "8:00 AM - 6:00 PM"
    }
  }
}
```

---

### 3. Officer Escalation Ticket Endpoint
- **URL**: `POST /api/escalate`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "cropId": "chilli",
  "disease": "Chilli Leaf Curl Virus",
  "farmerNotes": "Severe leaf curling across 2 acres"
}
```
- **Expected Response Payload (JSON)**:
```json
{
  "success": true,
  "ticketId": "KVK-918233",
  "message": "Case escalated to KVK Agriculture Officer. Expect a callback within 2 hours.",
  "localMessage": "आपकी समस्या कृषि अधिकारी के पास भेज दी गई है। आपको २ घंटे में कॉल आएगा।"
}
```

---

## ⚡ Quick Backend Integration Guide

1. Open `src/services/api.js`.
2. Replace mock function calls with standard `fetch` or `axios`:
```javascript
export async function analyzeCropImage(cropId, imageFileOrData) {
  const formData = new FormData();
  formData.append('crop', cropId);
  formData.append('file', imageFileOrData);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  return await response.json();
}
```
3. Set environment variable `.env.local` for local development:
```env
VITE_API_BASE_URL=http://localhost:8000
```
