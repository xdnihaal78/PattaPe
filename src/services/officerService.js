// src/services/officerService.js
// Mock API Service for Extension Officer Dashboard
// Simulates:
// GET /cases
// GET /stats
// PATCH /cases/{id}/status

const STORAGE_KEY = 'pattape_cases_v2';

// 4 Realistic Villages
const VILLAGES = ['Bhimavaram', 'Baramati', 'Guntur', 'Junagadh'];

// High quality leaf sample images mapped to crops
const IMAGES = {
  rice_blast: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
  rice_blight: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
  rice_healthy: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  chilli_curl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
  chilli_anthracnose: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
  chilli_healthy: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80',
  banana_sigatoka: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80',
  banana_panama: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80',
  banana_healthy: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
  groundnut_tikka: 'https://images.unsplash.com/photo-1567080597797-6707812f8644?auto=format&fit=crop&w=800&q=80',
  groundnut_rust: 'https://images.unsplash.com/photo-1567080597797-6707812f8644?auto=format&fit=crop&w=800&q=80',
  groundnut_healthy: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  sugarcane_redrot: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
  sugarcane_smut: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
  sugarcane_healthy: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80'
};

// 40 Realistic Seed Cases
export const SEED_CASES = [
  // 1-8: RICE (Bhimavaram & Junagadh)
  {
    id: '1',
    case_id: 'KVK-1001',
    farmer_name: 'Ramesh Patel',
    farmer_phone: '+91 98234 11200',
    crop: 'Rice',
    disease: 'Rice Leaf Blast',
    confidence: 93,
    severity: 'severe',
    affected_pct: 75,
    risk: 'high',
    village: 'Bhimavaram',
    status: 'Pending Review',
    created_at: '2026-09-11T09:30:00Z',
    image_url: IMAGES.rice_blast,
    heatmap_url: IMAGES.rice_blast,
    top3: [
      { name: 'Rice Leaf Blast', confidence: 93 },
      { name: 'Brown Spot', confidence: 5 },
      { name: 'Bacterial Blight', confidence: 2 }
    ],
    simple_summary: 'Spindle-shaped gray spots on leaves. Spores are spreading quickly in humid night air.',
    recommended_treatment: 'Tricyclazole spray @ 0.6g/liter of water. Drain excess standing water for 2 days.'
  },
  {
    id: '2',
    case_id: 'KVK-1002',
    farmer_name: 'Venkat Rao',
    farmer_phone: '+91 94412 88701',
    crop: 'Rice',
    disease: 'Brown Spot',
    confidence: 88,
    severity: 'moderate',
    affected_pct: 38,
    risk: 'moderate',
    village: 'Bhimavaram',
    status: 'Confirmed',
    created_at: '2026-09-11T08:15:00Z',
    image_url: IMAGES.rice_blast,
    heatmap_url: IMAGES.rice_blast,
    top3: [
      { name: 'Brown Spot', confidence: 88 },
      { name: 'Rice Leaf Blast', confidence: 8 },
      { name: 'Narrow Brown Spot', confidence: 4 }
    ],
    simple_summary: 'Small round brown spots with yellow borders. Common when soil lacks potash fertilizer.',
    recommended_treatment: 'Mancozeb spray @ 2.5g/liter. Apply potash fertilizer (MOP) to field.'
  },
  {
    id: '3',
    case_id: 'KVK-1003',
    farmer_name: 'Suresh Varma',
    farmer_phone: '+91 98480 32190',
    crop: 'Rice',
    disease: 'Bacterial Leaf Blight',
    confidence: 91,
    severity: 'severe',
    affected_pct: 68,
    risk: 'high',
    village: 'Bhimavaram',
    status: 'Lab Test Requested',
    created_at: '2026-09-10T15:40:00Z',
    image_url: IMAGES.rice_blight,
    heatmap_url: IMAGES.rice_blight,
    top3: [
      { name: 'Bacterial Leaf Blight', confidence: 91 },
      { name: 'Sheath Blight', confidence: 6 },
      { name: 'Rice Blast', confidence: 3 }
    ],
    simple_summary: 'Leaves turning straw-colored starting from leaf tips. Fast transmission through rainwater.',
    recommended_treatment: 'Streptocycline spray (1g in 10L water) + Copper Oxychloride 2.5g/L.'
  },
  {
    id: '4',
    case_id: 'KVK-1004',
    farmer_name: 'Anji Reddy',
    farmer_phone: '+91 99890 12345',
    crop: 'Rice',
    disease: 'Healthy Leaf',
    confidence: 96,
    severity: 'trace',
    affected_pct: 2,
    risk: 'low',
    village: 'Bhimavaram',
    status: 'Confirmed',
    created_at: '2026-09-10T11:20:00Z',
    image_url: IMAGES.rice_healthy,
    heatmap_url: IMAGES.rice_healthy,
    top3: [
      { name: 'Healthy Leaf', confidence: 96 },
      { name: 'Minor Sun Scorch', confidence: 3 },
      { name: 'Early Brown Spot', confidence: 1 }
    ],
    simple_summary: 'Crop looks very healthy and green. No active disease spots found.',
    recommended_treatment: 'No chemical spray needed. Maintain clean water and regular weeding.'
  },
  {
    id: '5',
    case_id: 'KVK-1005',
    farmer_name: 'Mansukh Bhai',
    farmer_phone: '+91 98251 77610',
    crop: 'Rice',
    disease: 'Sheath Blight',
    confidence: 84,
    severity: 'moderate',
    affected_pct: 44,
    risk: 'moderate',
    village: 'Junagadh',
    status: 'Pending Review',
    created_at: '2026-09-11T07:45:00Z',
    image_url: IMAGES.rice_blight,
    heatmap_url: IMAGES.rice_blight,
    top3: [
      { name: 'Sheath Blight', confidence: 84 },
      { name: 'Stem Rot', confidence: 11 },
      { name: 'Bacterial Blight', confidence: 5 }
    ],
    simple_summary: 'Irregular gray-green spots near the water line on lower plant stems.',
    recommended_treatment: 'Hexaconazole 5% SC @ 2ml/L water sprayed near stem base.'
  },
  {
    id: '6',
    case_id: 'KVK-1006',
    farmer_name: 'Kanu Patel',
    farmer_phone: '+91 98790 44321',
    crop: 'Rice',
    disease: 'Rice Leaf Blast',
    confidence: 79,
    severity: 'mild',
    affected_pct: 15,
    risk: 'moderate',
    village: 'Junagadh',
    status: 'Overridden',
    created_at: '2026-09-09T14:10:00Z',
    image_url: IMAGES.rice_blast,
    heatmap_url: IMAGES.rice_blast,
    top3: [
      { name: 'Rice Leaf Blast', confidence: 79 },
      { name: 'Brown Spot', confidence: 15 },
      { name: 'Nitrogen Deficiency', confidence: 6 }
    ],
    simple_summary: 'Officer found early Brown Spot rather than Blast. Fertilizer top dressing advised.',
    recommended_treatment: 'Apply Muriate of Potash @ 15kg/acre.'
  },
  {
    id: '7',
    case_id: 'KVK-1007',
    farmer_name: 'Dinesh Ahir',
    farmer_phone: '+91 94266 55099',
    crop: 'Rice',
    disease: 'False Smut',
    confidence: 86,
    severity: 'mild',
    affected_pct: 12,
    risk: 'low',
    village: 'Junagadh',
    status: 'Pending Review',
    created_at: '2026-09-10T16:00:00Z',
    image_url: IMAGES.rice_blast,
    heatmap_url: IMAGES.rice_blast,
    top3: [
      { name: 'False Smut', confidence: 86 },
      { name: 'Kernel Smut', confidence: 9 },
      { name: 'Grain Discoloration', confidence: 5 }
    ],
    simple_summary: 'Yellow-green velvety spore balls beginning to show on rice grains.',
    recommended_treatment: 'Copper Hydroxide 77% WP @ 2g/L at boot leaf stage.'
  },
  {
    id: '8',
    case_id: 'KVK-1008',
    farmer_name: 'Govind Ram',
    farmer_phone: '+91 98244 88122',
    crop: 'Rice',
    disease: 'Healthy Leaf',
    confidence: 94,
    severity: 'trace',
    affected_pct: 3,
    risk: 'low',
    village: 'Junagadh',
    status: 'Confirmed',
    created_at: '2026-09-08T10:30:00Z',
    image_url: IMAGES.rice_healthy,
    heatmap_url: IMAGES.rice_healthy,
    top3: [
      { name: 'Healthy Leaf', confidence: 94 },
      { name: 'Leaf Tip Burn', confidence: 4 },
      { name: 'Zinc Deficiency', confidence: 2 }
    ],
    simple_summary: 'Clean healthy foliage. Excellent field vigor.',
    recommended_treatment: 'Continue routine field monitoring.'
  },

  // 9-16: CHILLI (Guntur & Bhimavaram)
  {
    id: '9',
    case_id: 'KVK-1009',
    farmer_name: 'Sunita Devi',
    farmer_phone: '+91 94150 88219',
    crop: 'Chilli',
    disease: 'Chilli Leaf Curl',
    confidence: 95,
    severity: 'severe',
    affected_pct: 62,
    risk: 'high',
    village: 'Guntur',
    status: 'Pending Review',
    created_at: '2026-09-11T10:15:00Z',
    image_url: IMAGES.chilli_curl,
    heatmap_url: IMAGES.chilli_curl,
    top3: [
      { name: 'Chilli Leaf Curl', confidence: 95 },
      { name: 'Mite Curling', confidence: 3 },
      { name: 'Thrips Damage', confidence: 2 }
    ],
    simple_summary: 'Leaves curling upward and plants becoming stunted. Spread by whitefly insects.',
    recommended_treatment: 'Spray Imidacloprid 17.8% SL @ 0.5ml/L water. Put 12 yellow sticky cards per acre.'
  },
  {
    id: '10',
    case_id: 'KVK-1010',
    farmer_name: 'K. Venkateswarlu',
    farmer_phone: '+91 98492 33411',
    crop: 'Chilli',
    disease: 'Anthracnose Fruit Rot',
    confidence: 90,
    severity: 'severe',
    affected_pct: 54,
    risk: 'high',
    village: 'Guntur',
    status: 'Confirmed',
    created_at: '2026-09-10T14:30:00Z',
    image_url: IMAGES.chilli_anthracnose,
    heatmap_url: IMAGES.chilli_anthracnose,
    top3: [
      { name: 'Anthracnose Fruit Rot', confidence: 90 },
      { name: 'Cercospora Leaf Spot', confidence: 7 },
      { name: 'Bacterial Spot', confidence: 3 }
    ],
    simple_summary: 'Dark sunken spots on chillies and drying of twig tips from top downwards.',
    recommended_treatment: 'Azoxystrobin + Difenoconazole (Amistar Top) @ 1ml/L water.'
  },
  {
    id: '11',
    case_id: 'KVK-1011',
    farmer_name: 'Subba Rao',
    farmer_phone: '+91 99480 66200',
    crop: 'Chilli',
    disease: 'Mite Damage',
    confidence: 86,
    severity: 'moderate',
    affected_pct: 35,
    risk: 'moderate',
    village: 'Guntur',
    status: 'Pending Review',
    created_at: '2026-09-11T08:00:00Z',
    image_url: IMAGES.chilli_curl,
    heatmap_url: IMAGES.chilli_curl,
    top3: [
      { name: 'Mite Damage', confidence: 86 },
      { name: 'Chilli Leaf Curl', confidence: 10 },
      { name: 'Powdery Mildew', confidence: 4 }
    ],
    simple_summary: 'Young leaves curling downward with a shiny bronze color underneath.',
    recommended_treatment: 'Spiromesifen 22.9% SC @ 1ml/L or wettable sulfur @ 3g/L.'
  },
  {
    id: '12',
    case_id: 'KVK-1012',
    farmer_name: 'Padma Rani',
    farmer_phone: '+91 94901 88344',
    crop: 'Chilli',
    disease: 'Healthy Leaf',
    confidence: 97,
    severity: 'trace',
    affected_pct: 1,
    risk: 'low',
    village: 'Guntur',
    status: 'Confirmed',
    created_at: '2026-09-09T16:20:00Z',
    image_url: IMAGES.chilli_healthy,
    heatmap_url: IMAGES.chilli_healthy,
    top3: [
      { name: 'Healthy Leaf', confidence: 97 },
      { name: 'Minor Aphid Nymphs', confidence: 2 },
      { name: 'Nutrient Deficiency', confidence: 1 }
    ],
    simple_summary: 'Leaves are flat, dark green, and healthy. Good flower setting.',
    recommended_treatment: 'No pesticide needed. Keep yellow sticky sheets in field.'
  },
  {
    id: '13',
    case_id: 'KVK-1013',
    farmer_name: 'Babu Rao',
    farmer_phone: '+91 98495 11090',
    crop: 'Chilli',
    disease: 'Bacterial Spot',
    confidence: 82,
    severity: 'mild',
    affected_pct: 18,
    risk: 'moderate',
    village: 'Bhimavaram',
    status: 'Pending Review',
    created_at: '2026-09-11T11:00:00Z',
    image_url: IMAGES.chilli_anthracnose,
    heatmap_url: IMAGES.chilli_anthracnose,
    top3: [
      { name: 'Bacterial Spot', confidence: 82 },
      { name: 'Cercospora Leaf Spot', confidence: 12 },
      { name: 'Anthracnose', confidence: 6 }
    ],
    simple_summary: 'Small rough brown spots on leaf edges. Rain droplets spread it quickly.',
    recommended_treatment: 'Copper Oxychloride @ 2.5g/L + Streptocycline @ 0.1g/L.'
  },
  {
    id: '14',
    case_id: 'KVK-1014',
    farmer_name: 'Nageswara Rao',
    farmer_phone: '+91 99630 44211',
    crop: 'Chilli',
    disease: 'Chilli Leaf Curl',
    confidence: 94,
    severity: 'severe',
    affected_pct: 58,
    risk: 'high',
    village: 'Bhimavaram',
    status: 'Lab Test Requested',
    created_at: '2026-09-08T13:45:00Z',
    image_url: IMAGES.chilli_curl,
    heatmap_url: IMAGES.chilli_curl,
    top3: [
      { name: 'Chilli Leaf Curl', confidence: 94 },
      { name: 'Tomato Spotted Wilt', confidence: 4 },
      { name: 'Thrips Scars', confidence: 2 }
    ],
    simple_summary: 'Heavy leaf puckering across 2 acres. Sample sent to verify virus strain.',
    recommended_treatment: 'Immediate spray of Diafenthiuron 50% WP @ 1.25g/L.'
  },
  {
    id: '15',
    case_id: 'KVK-1015',
    farmer_name: 'Ravi Teja',
    farmer_phone: '+91 98850 77123',
    crop: 'Chilli',
    disease: 'Powdery Mildew',
    confidence: 88,
    severity: 'mild',
    affected_pct: 14,
    risk: 'low',
    village: 'Bhimavaram',
    status: 'Confirmed',
    created_at: '2026-09-09T09:15:00Z',
    image_url: IMAGES.chilli_healthy,
    heatmap_url: IMAGES.chilli_healthy,
    top3: [
      { name: 'Powdery Mildew', confidence: 88 },
      { name: 'Whitefly Residue', confidence: 8 },
      { name: 'Leaf Mold', confidence: 4 }
    ],
    simple_summary: 'White powdery patches on leaf undersides with yellow spots above.',
    recommended_treatment: 'Wettable Sulfur 80% WP @ 3g/L water in early morning.'
  },
  {
    id: '16',
    case_id: 'KVK-1016',
    farmer_name: 'M. Sriman',
    farmer_phone: '+91 94400 33112',
    crop: 'Chilli',
    disease: 'Cercospora Leaf Spot',
    confidence: 81,
    severity: 'moderate',
    affected_pct: 28,
    risk: 'moderate',
    village: 'Guntur',
    status: 'Overridden',
    created_at: '2026-09-10T12:00:00Z',
    image_url: IMAGES.chilli_anthracnose,
    heatmap_url: IMAGES.chilli_anthracnose,
    top3: [
      { name: 'Cercospora Leaf Spot', confidence: 81 },
      { name: 'Bacterial Spot', confidence: 14 },
      { name: 'Anthracnose', confidence: 5 }
    ],
    simple_summary: 'Officer confirmed frogeye spots. Farmer advised on spray schedule.',
    recommended_treatment: 'Chlorothalonil 75% WP @ 2g/L.'
  },

  // 17-24: BANANA (Baramati & Bhimavaram)
  {
    id: '17',
    case_id: 'KVK-1017',
    farmer_name: 'Anand Shinde',
    farmer_phone: '+91 97654 33211',
    crop: 'Banana',
    disease: 'Sigatoka Leaf Spot',
    confidence: 91,
    severity: 'severe',
    affected_pct: 64,
    risk: 'high',
    village: 'Baramati',
    status: 'Pending Review',
    created_at: '2026-09-11T08:50:00Z',
    image_url: IMAGES.banana_sigatoka,
    heatmap_url: IMAGES.banana_sigatoka,
    top3: [
      { name: 'Sigatoka Leaf Spot', confidence: 91 },
      { name: 'Cordana Leaf Spot', confidence: 6 },
      { name: 'Panama Wilt', confidence: 3 }
    ],
    simple_summary: 'Dark brown streaks and large dry patches along leaf veins.',
    recommended_treatment: 'Propiconazole 25% EC @ 1ml/L + mineral oil (10ml/L). Cut dry leaves.'
  },
  {
    id: '18',
    case_id: 'KVK-1018',
    farmer_name: 'Dattatray Kale',
    farmer_phone: '+91 98220 99401',
    crop: 'Banana',
    disease: 'Panama Wilt',
    confidence: 89,
    severity: 'severe',
    affected_pct: 70,
    risk: 'high',
    village: 'Baramati',
    status: 'Lab Test Requested',
    created_at: '2026-09-10T10:20:00Z',
    image_url: IMAGES.banana_panama,
    heatmap_url: IMAGES.banana_panama,
    top3: [
      { name: 'Panama Wilt', confidence: 89 },
      { name: 'Bacterial Soft Rot', confidence: 7 },
      { name: 'Sigatoka Spot', confidence: 4 }
    ],
    simple_summary: 'Older leaves turning yellow and collapsing at petiole base. Soil fungal test ordered.',
    recommended_treatment: 'Drench stem base with Carbendazim 2g/L. Do not let irrigation water flow to other plots.'
  },
  {
    id: '19',
    case_id: 'KVK-1019',
    farmer_name: 'Sambhaji More',
    farmer_phone: '+91 94223 88100',
    crop: 'Banana',
    disease: 'Healthy Leaf',
    confidence: 95,
    severity: 'trace',
    affected_pct: 2,
    risk: 'low',
    village: 'Baramati',
    status: 'Confirmed',
    created_at: '2026-09-09T15:30:00Z',
    image_url: IMAGES.banana_healthy,
    heatmap_url: IMAGES.banana_healthy,
    top3: [
      { name: 'Healthy Leaf', confidence: 95 },
      { name: 'Wind Tear', confidence: 4 },
      { name: 'Dust Accumulation', confidence: 1 }
    ],
    simple_summary: 'Broad, glossy green leaves. No fungal spots.',
    recommended_treatment: 'Regular drip irrigation and potassium booster.'
  },
  {
    id: '20',
    case_id: 'KVK-1020',
    farmer_name: 'Bhausaheb Patil',
    farmer_phone: '+91 98901 44520',
    crop: 'Banana',
    disease: 'Yellow Sigatoka',
    confidence: 83,
    severity: 'moderate',
    affected_pct: 36,
    risk: 'moderate',
    village: 'Baramati',
    status: 'Confirmed',
    created_at: '2026-09-08T11:40:00Z',
    image_url: IMAGES.banana_sigatoka,
    heatmap_url: IMAGES.banana_sigatoka,
    top3: [
      { name: 'Yellow Sigatoka', confidence: 83 },
      { name: 'Black Sigatoka', confidence: 12 },
      { name: 'Nutrient Burn', confidence: 5 }
    ],
    simple_summary: 'Small light yellow streaks turning brown with bright yellow halo.',
    recommended_treatment: 'Mancozeb 75% WP @ 2.5g/L water mixed with wetting agent.'
  },
  {
    id: '21',
    case_id: 'KVK-1021',
    farmer_name: 'P. Appa Rao',
    farmer_phone: '+91 94402 11988',
    crop: 'Banana',
    disease: 'Cordana Leaf Spot',
    confidence: 80,
    severity: 'mild',
    affected_pct: 16,
    risk: 'low',
    village: 'Bhimavaram',
    status: 'Pending Review',
    created_at: '2026-09-11T09:00:00Z',
    image_url: IMAGES.banana_sigatoka,
    heatmap_url: IMAGES.banana_sigatoka,
    top3: [
      { name: 'Cordana Leaf Spot', confidence: 80 },
      { name: 'Sigatoka Spot', confidence: 14 },
      { name: 'Sun Scorch', confidence: 6 }
    ],
    simple_summary: 'Large oval spots on outer leaf borders with concentric rings.',
    recommended_treatment: 'Copper Oxychloride @ 2.5g/L sprayed on leaf margins.'
  },
  {
    id: '22',
    case_id: 'KVK-1022',
    farmer_name: 'K. Subrahmanyam',
    farmer_phone: '+91 98481 77334',
    crop: 'Banana',
    disease: 'Sigatoka Leaf Spot',
    confidence: 76,
    severity: 'mild',
    affected_pct: 20,
    risk: 'moderate',
    village: 'Bhimavaram',
    status: 'Overridden',
    created_at: '2026-09-09T13:10:00Z',
    image_url: IMAGES.banana_sigatoka,
    heatmap_url: IMAGES.banana_sigatoka,
    top3: [
      { name: 'Sigatoka Leaf Spot', confidence: 76 },
      { name: 'Yellow Sigatoka', confidence: 18 },
      { name: 'Leaf Scorching', confidence: 6 }
    ],
    simple_summary: 'Officer adjusted recommendation to organic oil spray due to harvest stage.',
    recommended_treatment: 'Neem oil spray (5ml/L) + Potassium bicarbonate (3g/L).'
  },
  {
    id: '23',
    case_id: 'KVK-1023',
    farmer_name: 'Vikas Jagtap',
    farmer_phone: '+91 98600 22199',
    crop: 'Banana',
    disease: 'Healthy Leaf',
    confidence: 96,
    severity: 'trace',
    affected_pct: 2,
    risk: 'low',
    village: 'Baramati',
    status: 'Confirmed',
    created_at: '2026-09-10T14:50:00Z',
    image_url: IMAGES.banana_healthy,
    heatmap_url: IMAGES.banana_healthy,
    top3: [
      { name: 'Healthy Leaf', confidence: 96 },
      { name: 'Mechanical Abrasion', confidence: 3 },
      { name: 'Sooty Mold', confidence: 1 }
    ],
    simple_summary: 'Robust plantation. Healthy bunch formation underway.',
    recommended_treatment: 'Maintain routine de-suckering.'
  },
  {
    id: '24',
    case_id: 'KVK-1024',
    farmer_name: 'Nitin Salunkhe',
    farmer_phone: '+91 94231 66455',
    crop: 'Banana',
    disease: 'Anthracnose Peel Spot',
    confidence: 85,
    severity: 'mild',
    affected_pct: 15,
    risk: 'low',
    village: 'Baramati',
    status: 'Pending Review',
    created_at: '2026-09-10T17:15:00Z',
    image_url: IMAGES.banana_sigatoka,
    heatmap_url: IMAGES.banana_sigatoka,
    top3: [
      { name: 'Anthracnose Peel Spot', confidence: 85 },
      { name: 'Sigatoka', confidence: 10 },
      { name: 'Cigar End Rot', confidence: 5 }
    ],
    simple_summary: 'Small brown diamond spots near leaf edges and bunch bracts.',
    recommended_treatment: 'Carbendazim 50% WP @ 1g/L on bunches and foliage.'
  },

  // 25-32: GROUNDNUT (Junagadh & Guntur)
  {
    id: '25',
    case_id: 'KVK-1025',
    farmer_name: 'Kishore Jadav',
    farmer_phone: '+91 94278 12390',
    crop: 'Groundnut',
    disease: 'Tikka Leaf Spot',
    confidence: 91,
    severity: 'moderate',
    affected_pct: 38,
    risk: 'moderate',
    village: 'Junagadh',
    status: 'Pending Review',
    created_at: '2026-09-11T10:45:00Z',
    image_url: IMAGES.groundnut_tikka,
    heatmap_url: IMAGES.groundnut_tikka,
    top3: [
      { name: 'Tikka Leaf Spot', confidence: 91 },
      { name: 'Groundnut Rust', confidence: 6 },
      { name: 'Late Leaf Spot', confidence: 3 }
    ],
    simple_summary: 'Round black spots with bright yellow rings on upper leaf surface.',
    recommended_treatment: 'Carbendazim + Mancozeb (Saaf) @ 2g/L water.'
  },
  {
    id: '26',
    case_id: 'KVK-1026',
    farmer_name: 'Hitesh Vora',
    farmer_phone: '+91 98254 99012',
    crop: 'Groundnut',
    disease: 'Groundnut Rust',
    confidence: 89,
    severity: 'severe',
    affected_pct: 56,
    risk: 'high',
    village: 'Junagadh',
    status: 'Confirmed',
    created_at: '2026-09-10T12:30:00Z',
    image_url: IMAGES.groundnut_rust,
    heatmap_url: IMAGES.groundnut_rust,
    top3: [
      { name: 'Groundnut Rust', confidence: 89 },
      { name: 'Tikka Leaf Spot', confidence: 8 },
      { name: 'Alternaria Leaf Spot', confidence: 3 }
    ],
    simple_summary: 'Orange-brown powdery pustules under leaves causing early leaf drop.',
    recommended_treatment: 'Hexaconazole 5% EC @ 2ml/L or Tebuconazole @ 1ml/L.'
  },
  {
    id: '27',
    case_id: 'KVK-1027',
    farmer_name: 'Pravin Solanki',
    farmer_phone: '+91 94280 44100',
    crop: 'Groundnut',
    disease: 'Healthy Leaf',
    confidence: 97,
    severity: 'trace',
    affected_pct: 1,
    risk: 'low',
    village: 'Junagadh',
    status: 'Confirmed',
    created_at: '2026-09-09T08:45:00Z',
    image_url: IMAGES.groundnut_healthy,
    heatmap_url: IMAGES.groundnut_healthy,
    top3: [
      { name: 'Healthy Leaf', confidence: 97 },
      { name: 'Leafminer Tunnel', confidence: 2 },
      { name: 'Iron Chlorosis', confidence: 1 }
    ],
    simple_summary: 'Healthy crop canopy, good peg penetration into soil.',
    recommended_treatment: 'Apply gypsum @ 200kg/acre at flowering.'
  },
  {
    id: '28',
    case_id: 'KVK-1028',
    farmer_name: 'Bhupat Chudasama',
    farmer_phone: '+91 98795 33022',
    crop: 'Groundnut',
    disease: 'Collar Rot',
    confidence: 86,
    severity: 'severe',
    affected_pct: 60,
    risk: 'high',
    village: 'Junagadh',
    status: 'Lab Test Requested',
    created_at: '2026-09-08T16:15:00Z',
    image_url: IMAGES.groundnut_tikka,
    heatmap_url: IMAGES.groundnut_tikka,
    top3: [
      { name: 'Collar Rot', confidence: 86 },
      { name: 'Stem Rot (Sclerotium)', confidence: 10 },
      { name: 'Root Rot', confidence: 4 }
    ],
    simple_summary: 'Rotting and black spore dust near soil collar. Soil culture test dispatched.',
    recommended_treatment: 'Drench soil with Carbendazim 2g/L or Trichoderma viride 10g/L.'
  },
  {
    id: '29',
    case_id: 'KVK-1029',
    farmer_name: 'M. Kotayya',
    farmer_phone: '+91 94411 77209',
    crop: 'Groundnut',
    disease: 'Tikka Leaf Spot',
    confidence: 84,
    severity: 'mild',
    affected_pct: 18,
    risk: 'low',
    village: 'Guntur',
    status: 'Pending Review',
    created_at: '2026-09-11T07:15:00Z',
    image_url: IMAGES.groundnut_tikka,
    heatmap_url: IMAGES.groundnut_tikka,
    top3: [
      { name: 'Tikka Leaf Spot', confidence: 84 },
      { name: 'Cercospora Spot', confidence: 11 },
      { name: 'Groundnut Rust', confidence: 5 }
    ],
    simple_summary: 'Early circular spots appearing on lower leaves after morning dew.',
    recommended_treatment: 'Mancozeb 75% WP @ 2g/L water.'
  },
  {
    id: '30',
    case_id: 'KVK-1030',
    farmer_name: 'Ch. Sambasiva Rao',
    farmer_phone: '+91 98499 11844',
    crop: 'Groundnut',
    disease: 'Groundnut Rosette Virus',
    confidence: 78,
    severity: 'moderate',
    affected_pct: 32,
    risk: 'moderate',
    village: 'Guntur',
    status: 'Overridden',
    created_at: '2026-09-10T11:50:00Z',
    image_url: IMAGES.groundnut_tikka,
    heatmap_url: IMAGES.groundnut_tikka,
    top3: [
      { name: 'Groundnut Rosette Virus', confidence: 78 },
      { name: 'Iron Deficiency', confidence: 14 },
      { name: 'Tikka Leaf Spot', confidence: 8 }
    ],
    simple_summary: 'Officer diagnosed Iron Chlorosis rather than virus. Advised foliar ferrous spray.',
    recommended_treatment: 'Ferrous sulfate 0.5% + Citric acid 0.1% spray.'
  },
  {
    id: '31',
    case_id: 'KVK-1031',
    farmer_name: 'T. Ramaiah',
    farmer_phone: '+91 99591 66320',
    crop: 'Groundnut',
    disease: 'Healthy Leaf',
    confidence: 94,
    severity: 'trace',
    affected_pct: 3,
    risk: 'low',
    village: 'Guntur',
    status: 'Confirmed',
    created_at: '2026-09-09T14:00:00Z',
    image_url: IMAGES.groundnut_healthy,
    heatmap_url: IMAGES.groundnut_healthy,
    top3: [
      { name: 'Healthy Leaf', confidence: 94 },
      { name: 'Thrips Scratches', confidence: 4 },
      { name: 'Early Tikka', confidence: 2 }
    ],
    simple_summary: 'Good crop stand. No serious pathology detected.',
    recommended_treatment: 'Keep field borders free from weeds.'
  },
  {
    id: '32',
    case_id: 'KVK-1032',
    farmer_name: 'Bharat Patel',
    farmer_phone: '+91 98259 44881',
    crop: 'Groundnut',
    disease: 'Late Leaf Spot',
    confidence: 87,
    severity: 'moderate',
    affected_pct: 42,
    risk: 'moderate',
    village: 'Junagadh',
    status: 'Pending Review',
    created_at: '2026-09-10T18:30:00Z',
    image_url: IMAGES.groundnut_tikka,
    heatmap_url: IMAGES.groundnut_tikka,
    top3: [
      { name: 'Late Leaf Spot', confidence: 87 },
      { name: 'Early Tikka', confidence: 9 },
      { name: 'Rust', confidence: 4 }
    ],
    simple_summary: 'Dark brown spots on leaf undersides without yellow border.',
    recommended_treatment: 'Propiconazole 25% EC @ 1ml/L water.'
  },

  // 33-40: SUGARCANE (Baramati & Bhimavaram)
  {
    id: '33',
    case_id: 'KVK-1033',
    farmer_name: 'Rajendra Jagtap',
    farmer_phone: '+91 98224 55100',
    crop: 'Sugarcane',
    disease: 'Red Rot',
    confidence: 92,
    severity: 'severe',
    affected_pct: 72,
    risk: 'high',
    village: 'Baramati',
    status: 'Pending Review',
    created_at: '2026-09-11T11:20:00Z',
    image_url: IMAGES.sugarcane_redrot,
    heatmap_url: IMAGES.sugarcane_redrot,
    top3: [
      { name: 'Red Rot', confidence: 92 },
      { name: 'Sugarcane Wilt', confidence: 6 },
      { name: 'Pokkah Boeng', confidence: 2 }
    ],
    simple_summary: 'Third and fourth leaves drying along midrib with sour alcohol smell in split cane.',
    recommended_treatment: 'Uproot and burn diseased clumps. Drench soil with Carbendazim 2g/L.'
  },
  {
    id: '34',
    case_id: 'KVK-1034',
    farmer_name: 'Tanaji Shinde',
    farmer_phone: '+91 97633 88410',
    crop: 'Sugarcane',
    disease: 'Sugarcane Smut',
    confidence: 89,
    severity: 'moderate',
    affected_pct: 45,
    risk: 'moderate',
    village: 'Baramati',
    status: 'Confirmed',
    created_at: '2026-09-10T09:40:00Z',
    image_url: IMAGES.sugarcane_smut,
    heatmap_url: IMAGES.sugarcane_smut,
    top3: [
      { name: 'Sugarcane Smut', confidence: 89 },
      { name: 'Grassy Shoot', confidence: 7 },
      { name: 'Red Rot', confidence: 4 }
    ],
    simple_summary: 'Black whip-like structure emerging from the top shoot containing dark powdery spores.',
    recommended_treatment: 'Cut whip in plastic bag to stop spore flight. Spray Propiconazole 1ml/L.'
  },
  {
    id: '35',
    case_id: 'KVK-1035',
    farmer_name: 'Hanumant Gaikwad',
    farmer_phone: '+91 98501 22390',
    crop: 'Sugarcane',
    disease: 'Healthy Cane',
    confidence: 98,
    severity: 'trace',
    affected_pct: 1,
    risk: 'low',
    village: 'Baramati',
    status: 'Confirmed',
    created_at: '2026-09-09T17:00:00Z',
    image_url: IMAGES.sugarcane_healthy,
    heatmap_url: IMAGES.sugarcane_healthy,
    top3: [
      { name: 'Healthy Cane', confidence: 98 },
      { name: 'Aphid Traces', confidence: 1 },
      { name: 'Early Rust', confidence: 1 }
    ],
    simple_summary: 'Thick stalks with lush green canopy. Free from fungal or bacterial infection.',
    recommended_treatment: 'Maintain earthing up and trash mulching.'
  },
  {
    id: '36',
    case_id: 'KVK-1036',
    farmer_name: 'Pandurang Bhosale',
    farmer_phone: '+91 94220 77199',
    crop: 'Sugarcane',
    disease: 'Pokkah Boeng',
    confidence: 84,
    severity: 'mild',
    affected_pct: 20,
    risk: 'moderate',
    village: 'Baramati',
    status: 'Pending Review',
    created_at: '2026-09-11T08:10:00Z',
    image_url: IMAGES.sugarcane_redrot,
    heatmap_url: IMAGES.sugarcane_redrot,
    top3: [
      { name: 'Pokkah Boeng', confidence: 84 },
      { name: 'Red Rot', confidence: 10 },
      { name: 'Sugarcane Wilt', confidence: 6 }
    ],
    simple_summary: 'Wrinkled and chlorotic patches at base of young leaf blades.',
    recommended_treatment: 'Copper Oxychloride 50% WP @ 2.5g/L water.'
  },
  {
    id: '37',
    case_id: 'KVK-1037',
    farmer_name: 'V. Ranga Rao',
    farmer_phone: '+91 98488 44019',
    crop: 'Sugarcane',
    disease: 'Red Rot',
    confidence: 93,
    severity: 'severe',
    affected_pct: 66,
    risk: 'high',
    village: 'Bhimavaram',
    status: 'Lab Test Requested',
    created_at: '2026-09-10T13:20:00Z',
    image_url: IMAGES.sugarcane_redrot,
    heatmap_url: IMAGES.sugarcane_redrot,
    top3: [
      { name: 'Red Rot', confidence: 93 },
      { name: 'Colletotrichum Blight', confidence: 5 },
      { name: 'Wilt', confidence: 2 }
    ],
    simple_summary: 'Internal stalk tissue shows red color with white patches. Stalk specimen sent to lab.',
    recommended_treatment: 'Drench root zone with Thiophanate Methyl @ 1.5g/L.'
  },
  {
    id: '38',
    case_id: 'KVK-1038',
    farmer_name: 'G. Satyanarayana',
    farmer_phone: '+91 94405 66120',
    crop: 'Sugarcane',
    disease: 'Rust',
    confidence: 82,
    severity: 'mild',
    affected_pct: 15,
    risk: 'low',
    village: 'Bhimavaram',
    status: 'Confirmed',
    created_at: '2026-09-08T15:45:00Z',
    image_url: IMAGES.sugarcane_smut,
    heatmap_url: IMAGES.sugarcane_smut,
    top3: [
      { name: 'Rust', confidence: 82 },
      { name: 'Yellow Leaf Disease', confidence: 12 },
      { name: 'Ring Spot', confidence: 6 }
    ],
    simple_summary: 'Small elongated brown spots on leaves with orange powdery spore dust.',
    recommended_treatment: 'Mancozeb 75% WP @ 2.5g/L water.'
  },
  {
    id: '39',
    case_id: 'KVK-1039',
    farmer_name: 'P. Veerabhadra Rao',
    farmer_phone: '+91 98490 22910',
    crop: 'Sugarcane',
    disease: 'Grassy Shoot',
    confidence: 76,
    severity: 'moderate',
    affected_pct: 28,
    risk: 'moderate',
    village: 'Bhimavaram',
    status: 'Overridden',
    created_at: '2026-09-09T11:15:00Z',
    image_url: IMAGES.sugarcane_smut,
    heatmap_url: IMAGES.sugarcane_smut,
    top3: [
      { name: 'Grassy Shoot', confidence: 76 },
      { name: 'Sugarcane Smut', confidence: 15 },
      { name: 'Stunt Disease', confidence: 9 }
    ],
    simple_summary: 'Officer adjusted advisory to control aphid vectors spreading the phytoplasma.',
    recommended_treatment: 'Spray Dimethoate 30% EC @ 1.5ml/L water.'
  },
  {
    id: '40',
    case_id: 'KVK-1040',
    farmer_name: 'Mahadev Jadhav',
    farmer_phone: '+91 98229 88301',
    crop: 'Sugarcane',
    disease: 'Healthy Cane',
    confidence: 96,
    severity: 'trace',
    affected_pct: 2,
    risk: 'low',
    village: 'Baramati',
    status: 'Confirmed',
    created_at: '2026-09-10T16:30:00Z',
    image_url: IMAGES.sugarcane_healthy,
    heatmap_url: IMAGES.sugarcane_healthy,
    top3: [
      { name: 'Healthy Cane', confidence: 96 },
      { name: 'Leaf Sunburn', confidence: 3 },
      { name: 'Minor Borer Hole', confidence: 1 }
    ],
    simple_summary: 'Strong cane stand with healthy dark green canopy.',
    recommended_treatment: 'Continue routine irrigation schedule.'
  }
];

// Helper to load cases from localStorage or initialize with SEED_CASES
function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CASES));
      return SEED_CASES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading officer cases from storage:', err);
    return SEED_CASES;
  }
}

function saveStorage(cases) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed saving officer cases to storage:', err);
  }
}

// ========================================================
// MOCK DATA SERVICE API
// Matches:
// - GET /cases
// - GET /stats
// - PATCH /cases/{id}/status
// ========================================================

/**
 * Simulates: GET /cases
 * Supports optional filters: { village, crop, severity, risk, status, search }
 */
export async function getCases(filters = {}) {
  // Simulated small network latency for realistic feel
  const cases = loadStorage();

  return cases.filter((c) => {
    if (filters.village && filters.village !== 'all' && c.village !== filters.village) {
      return false;
    }
    if (filters.crop && filters.crop !== 'all' && c.crop.toLowerCase() !== filters.crop.toLowerCase()) {
      return false;
    }
    if (filters.severity && filters.severity !== 'all' && c.severity !== filters.severity) {
      return false;
    }
    if (filters.risk && filters.risk !== 'all' && c.risk !== filters.risk) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && c.status !== filters.status) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = c.farmer_name.toLowerCase().includes(q);
      const matchId = c.case_id.toLowerCase().includes(q) || c.id === q;
      const matchDisease = c.disease.toLowerCase().includes(q);
      const matchCrop = c.crop.toLowerCase().includes(q);
      const matchVillage = c.village.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDisease && !matchCrop && !matchVillage) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Simulates: GET /cases/{id}
 */
export async function getCaseById(id) {
  const cases = loadStorage();
  const idStr = String(id).toLowerCase();
  return cases.find((c) => String(c.id).toLowerCase() === idStr || c.case_id.toLowerCase() === idStr) || null;
}

/**
 * Simulates: GET /stats
 * Returns breakdown: total, healthy, at_risk, infected, by_crop, by_village
 */
export async function getStats() {
  const cases = loadStorage();

  const total = cases.length;
  const healthy = cases.filter((c) => c.disease === 'Healthy Leaf' || c.disease === 'Healthy Cane' || c.severity === 'trace').length;
  const at_risk = cases.filter((c) => c.risk === 'moderate' || (c.risk === 'high' && c.severity !== 'severe')).length;
  const infected = cases.filter((c) => c.severity === 'severe' || (c.risk === 'high' && c.severity === 'moderate')).length;

  // Counts by status
  const pending = cases.filter((c) => c.status === 'Pending Review').length;
  const confirmed = cases.filter((c) => c.status === 'Confirmed').length;
  const overridden = cases.filter((c) => c.status === 'Overridden').length;
  const lab_requested = cases.filter((c) => c.status === 'Lab Test Requested').length;

  // Breakdown by Crop
  const by_crop = {};
  cases.forEach((c) => {
    if (!by_crop[c.crop]) {
      by_crop[c.crop] = { total: 0, healthy: 0, at_risk: 0, infected: 0 };
    }
    by_crop[c.crop].total += 1;
    if (c.disease.startsWith('Healthy') || c.severity === 'trace') {
      by_crop[c.crop].healthy += 1;
    } else if (c.severity === 'severe' || c.risk === 'high') {
      by_crop[c.crop].infected += 1;
    } else {
      by_crop[c.crop].at_risk += 1;
    }
  });

  return {
    total,
    healthy,
    at_risk,
    infected,
    pending,
    confirmed,
    overridden,
    lab_requested,
    by_crop
  };
}

/**
 * Simulates: PATCH /cases/{id}/status
 */
export async function updateCaseStatus(id, { status, notes, updatedDisease, labDetails }) {
  const cases = loadStorage();
  const index = cases.findIndex((c) => String(c.id) === String(id) || c.case_id === id);
  if (index === -1) return null;

  const current = cases[index];
  current.status = status;
  if (notes) current.officer_notes = notes;
  if (updatedDisease) current.disease = updatedDisease;
  if (labDetails) current.lab_details = labDetails;
  current.updated_at = new Date().toISOString();

  cases[index] = current;
  saveStorage(cases);
  return current;
}

/**
 * Reset to default 40 seed cases
 */
export function resetSeedCases() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CASES));
  return SEED_CASES;
}

export { VILLAGES };
