// Mock prediction response matching backend API contract
// IMPORTANT: Keys match the backend API contract exactly. Do not rename any keys.

export const MOCK_PREDICTION_RESPONSE = {
  crop: "rice",

  crop_label_i18n: {
    en: "Rice",
    hi: "धान",
    ta: "நெல்"
  },

  disease: "bacterial_leaf_blight",

  disease_label_i18n: {
    en: "Bacterial Leaf Blight",
    hi: "Bacterial Leaf Blight",
    ta: "Bacterial Leaf Blight"
  },

  confidence: 0.94,

  top3: [
    {
      disease: "bacterial_leaf_blight",
      confidence: 0.94
    },
    {
      disease: "bacterial_leaf_streak",
      confidence: 0.04
    },
    {
      disease: "brown_spot",
      confidence: 0.01
    }
  ],

  severity: "moderate",

  affected_pct: 26,

  heatmap_url: "/demo-heatmap.png",

  risk_72h: {
    level: "high",
    reasons: [
      "humidity_88pct",
      "rainfall_forecast_18mm",
      "susceptible_stage"
    ]
  },

  advisory: {
    what_it_is: "A bacterial disease affecting rice leaves.",

    do_now: [
      "Avoid working in wet fields",
      "Drain standing water",
      "Do not reuse tools between plots"
    ],

    watch_for: [
      "Rapid spreading of leaf damage",
      "Yellowing of nearby leaves"
    ],

    avoid: [
      "Overhead irrigation",
      "Dense planting"
    ],

    source: "TNAU Agritech Portal — Crop Protection"
  },

  escalate: true,

  escalate_reason: "severity_moderate_and_risk_high",

  case_id: "CASE-0042",

  timestamp: "2026-08-28T10:14:00+05:30"
};

// Supported crops catalogue for crop selection
export const MOCK_CROPS = [
  {
    id: 'rice',
    name: 'Rice',
    localName: 'धान (Rice)',
    icon: '🌾',
    popularIn: 'Punjab, UP, WB, AP, TN',
    sampleImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    diseases: ['bacterial_leaf_blight', 'brown_spot']
  },
  {
    id: 'chilli',
    name: 'Chilli',
    localName: 'मिर्च (Chilli)',
    icon: '🌶️',
    popularIn: 'AP, Telangana, MH, Karnataka',
    sampleImage: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    diseases: ['leaf_curl', 'anthracnose']
  },
  {
    id: 'banana',
    name: 'Banana',
    localName: 'केला (Banana)',
    icon: '🍌',
    popularIn: 'Tamil Nadu, MH, Gujarat, AP',
    sampleImage: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
    diseases: ['sigatoka', 'panama_wilt']
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    localName: 'मूंगफली (Groundnut)',
    icon: '🥜',
    popularIn: 'Gujarat, AP, Rajasthan, TN',
    sampleImage: 'https://images.unsplash.com/photo-1567080597797-6707812f8644?auto=format&fit=crop&w=600&q=80',
    diseases: ['tikka_leaf_spot', 'rust']
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    localName: 'गन्ना (Sugarcane)',
    icon: '🎋',
    popularIn: 'UP, Maharashtra, Karnataka',
    sampleImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
    diseases: ['red_rot', 'smut']
  }
];

export default MOCK_PREDICTION_RESPONSE;
