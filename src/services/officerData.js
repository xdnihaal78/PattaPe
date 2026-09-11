// src/services/officerData.js
// Data store and mock service for PattaPe F2 Extension Officer Dashboard

const STORAGE_KEY = 'pattape_officer_cases_v1';

export const INITIAL_OFFICER_CASES = [
  {
    id: 'KVK-849201',
    farmerName: 'Ramesh Patel',
    farmerPhone: '+91 98234 11200',
    village: 'Bhimavaram',
    block: 'West Godavari',
    state: 'Andhra Pradesh',
    fieldAcreage: 3.5,
    cropId: 'rice',
    cropName: 'Rice',
    cropIcon: '🌾',
    submittedAt: '2026-09-11T08:30:00Z',
    status: 'pending', // 'pending' | 'confirmed' | 'overridden' | 'lab_requested'
    priority: 'Urgent',
    originalImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=1000&q=80',
    heatmapImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=1000&q=80',
    aiDiagnosis: {
      diseaseId: 'blast',
      diseaseName: 'Rice Leaf Blast',
      localDiseaseName: 'धान का ब्लास्ट रोग (Rice Blast)',
      scientificName: 'Magnaporthe oryzae',
      confidence: 93,
      severity: 'Critical',
      affectedAreaPercentage: 75,
      summary: 'Spindle-shaped lesions with gray-white centers and brownish-red borders on leaf blades.',
      symptoms: [
        'Spindle-shaped diamond lesions on leaf blades',
        'Ash-gray lesion centers with reddish-brown margins',
        'Coalescence of lesions causing extensive leaf desiccation',
        'Collar rot visible at junction of leaf blade and sheath'
      ]
    },
    topPredictions: [
      {
        rank: 1,
        diseaseName: 'Rice Leaf Blast',
        scientificName: 'Magnaporthe oryzae',
        confidence: 93,
        severity: 'Critical',
        distinguishingFeatures: 'Diamond/spindle shaped lesions with distinct gray centers; rapidly expands in cool high humidity.'
      },
      {
        rank: 2,
        diseaseName: 'Brown Spot',
        scientificName: 'Bipolaris oryzae',
        confidence: 5,
        severity: 'Moderate',
        distinguishingFeatures: 'Oval dark brown spots with yellow halos; typically uniform and smaller than blast.'
      },
      {
        rank: 3,
        diseaseName: 'Bacterial Leaf Blight',
        scientificName: 'Xanthomonas oryzae',
        confidence: 2,
        severity: 'High',
        distinguishingFeatures: 'Wavy margins starting from leaf tips moving downward along veins, bacterial ooze in morning.'
      }
    ],
    weatherRisk: {
      level: 'Critical Risk',
      riskScore: 92,
      humidity: '94%',
      tempRange: '21°C - 27°C',
      forecastText: 'Continuous night dew (>9h leaf wetness) will accelerate conidial germination within 48h.'
    },
    farmerAdvisory: {
      chemical: 'Tricyclazole 75% WP @ 0.6g/L water at first sign of spindle spots.',
      cultural: 'Drain standing water for 48h to lower microclimate humidity. Avoid excessive urea split.',
      prevention: 'Maintain field borders clean of weed hosts (Leersia hexandra).'
    },
    officerNotes: null,
    overrideDetails: null,
    labTestDetails: null,
    history: [
      {
        action: 'Case Created by Farmer Scan',
        timestamp: '2026-09-11T08:30:00Z',
        actor: 'Farmer Ramesh Patel via PattaPe Mobile'
      }
    ]
  },
  {
    id: 'KVK-731920',
    farmerName: 'Sunita Devi',
    farmerPhone: '+91 94150 88219',
    village: 'Guntur Rural',
    block: 'Guntur District',
    state: 'Andhra Pradesh',
    fieldAcreage: 2.0,
    cropId: 'chilli',
    cropName: 'Chilli',
    cropIcon: '🌶️',
    submittedAt: '2026-09-11T09:15:00Z',
    status: 'pending',
    priority: 'High',
    originalImage: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1000&q=80',
    heatmapImage: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1000&q=80',
    aiDiagnosis: {
      diseaseId: 'chilli_curl',
      diseaseName: 'Chilli Leaf Curl Virus',
      localDiseaseName: 'मिर्च का पर्ण कुंचन रोग (Leaf Curl)',
      scientificName: 'Begomovirus (Whitefly-transmitted)',
      confidence: 95,
      severity: 'High',
      affectedAreaPercentage: 62,
      summary: 'Upward curling of leaf margins, puckering of veins, and severe internodal shortening.',
      symptoms: [
        'Upward curling and thickening of leaf margins',
        'Vein enation and shortening of terminal internodes',
        'Stunted bush-like appearance of plants',
        'Noticeable whitefly (Bemisia tabaci) nymph colonies on leaf undersides'
      ]
    },
    topPredictions: [
      {
        rank: 1,
        diseaseName: 'Chilli Leaf Curl Virus',
        scientificName: 'Begomovirus',
        confidence: 95,
        severity: 'High',
        distinguishingFeatures: 'Upward cupping of leaves with pronounced vein thickening and bushy stunting.'
      },
      {
        rank: 2,
        diseaseName: 'Mite Damage (Downward Curling)',
        scientificName: 'Polyphagotarsonemus latus',
        confidence: 3,
        severity: 'Moderate',
        distinguishingFeatures: 'Downward curling of younger leaves with bronze underside sheen; no vein thickening.'
      },
      {
        rank: 3,
        diseaseName: 'Anthracnose / Fruit Rot',
        scientificName: 'Colletotrichum capsici',
        confidence: 2,
        severity: 'Moderate',
        distinguishingFeatures: 'Circular sunken necrotic spots with concentric rings; predominantly on pods rather than leaves.'
      }
    ],
    weatherRisk: {
      level: 'High Risk',
      riskScore: 82,
      humidity: '76%',
      tempRange: '28°C - 35°C',
      forecastText: 'Hot dry sunny afternoon temperatures will promote heavy whitefly vector flight activity.'
    },
    farmerAdvisory: {
      chemical: 'Spray Imidacloprid 17.8% SL @ 0.5 ml/L or Diafenthiuron 50% WP @ 1g/L water.',
      cultural: 'Install 15 yellow sticky cards per acre to monitor and mass trap vector populations.',
      prevention: 'Uproot severely infected stunt plants and burn them outside the field perimeter.'
    },
    officerNotes: null,
    overrideDetails: null,
    labTestDetails: null,
    history: [
      {
        action: 'Case Created by Farmer Scan',
        timestamp: '2026-09-11T09:15:00Z',
        actor: 'Farmer Sunita Devi via PattaPe Mobile'
      }
    ]
  },
  {
    id: 'KVK-652194',
    farmerName: 'Balwinder Singh',
    farmerPhone: '+91 98721 54320',
    village: 'Khanna Kalan',
    block: 'Ludhiana',
    state: 'Punjab',
    fieldAcreage: 5.0,
    cropId: 'rice',
    cropName: 'Rice',
    cropIcon: '🌾',
    submittedAt: '2026-09-10T14:20:00Z',
    status: 'confirmed',
    priority: 'Normal',
    originalImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=1000&q=80',
    heatmapImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=1000&q=80',
    aiDiagnosis: {
      diseaseId: 'brown_spot',
      diseaseName: 'Brown Spot of Rice',
      localDiseaseName: 'धान का भूरा धब्बा रोग',
      scientificName: 'Bipolaris oryzae',
      confidence: 89,
      severity: 'Moderate',
      affectedAreaPercentage: 40,
      summary: 'Round to oval brown spots with dark margins and yellowish halos distributed evenly across older leaves.',
      symptoms: [
        'Small circular to oval reddish-brown spots',
        'Yellowish halos encircling mature lesions',
        'Occurs predominantly in nutrient-deficient / potassium-low soils',
        'Grain discoloration observed on early panicles'
      ]
    },
    topPredictions: [
      {
        rank: 1,
        diseaseName: 'Brown Spot of Rice',
        scientificName: 'Bipolaris oryzae',
        confidence: 89,
        severity: 'Moderate',
        distinguishingFeatures: 'Evenly distributed circular spots with yellow halo; associated with potash deficiency.'
      },
      {
        rank: 2,
        diseaseName: 'Rice Leaf Blast',
        scientificName: 'Magnaporthe oryzae',
        confidence: 8,
        severity: 'Critical',
        distinguishingFeatures: 'Diamond spindle lesions with gray center; much faster necrotic spread.'
      },
      {
        rank: 3,
        diseaseName: 'Narrow Brown Leaf Spot',
        scientificName: 'Cercospora janseana',
        confidence: 3,
        severity: 'Low',
        distinguishingFeatures: 'Short, linear brown streaks parallel to leaf veins.'
      }
    ],
    weatherRisk: {
      level: 'Moderate Risk',
      riskScore: 58,
      humidity: '72%',
      tempRange: '25°C - 32°C',
      forecastText: 'Intermittent sunshine and showers. Foliar fertilizer and fungicide application recommended.'
    },
    farmerAdvisory: {
      chemical: 'Spray Mancozeb 75% WP @ 2.5 g/L or Propiconazole 25% EC @ 1 ml/L.',
      cultural: 'Apply supplementary Muriate of Potash (MOP) @ 20 kg/acre to boost plant tissue resistance.',
      prevention: 'Ensure balanced NPK fertilization in subsequent planting cycles.'
    },
    officerNotes: 'Confirmed diagnosis on field review. Soil test records show potash deficit. Advised MOP application alongside fungicide.',
    overrideDetails: null,
    labTestDetails: null,
    history: [
      {
        action: 'Case Created by Farmer Scan',
        timestamp: '2026-09-10T14:20:00Z',
        actor: 'Farmer Balwinder Singh via PattaPe Mobile'
      },
      {
        action: 'Diagnosis Confirmed by Officer',
        timestamp: '2026-09-10T16:45:00Z',
        actor: 'Dr. Ramesh Kumar (Sr. Extension Officer)'
      }
    ]
  },
  {
    id: 'KVK-591834',
    farmerName: 'Anand Shinde',
    farmerPhone: '+91 97654 33211',
    village: 'Baramati Rural',
    block: 'Pune District',
    state: 'Maharashtra',
    fieldAcreage: 4.2,
    cropId: 'sugarcane',
    cropName: 'Sugarcane',
    cropIcon: '🎋',
    submittedAt: '2026-09-10T11:00:00Z',
    status: 'lab_requested',
    priority: 'Critical',
    originalImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
    heatmapImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
    aiDiagnosis: {
      diseaseId: 'sugarcane_redrot',
      diseaseName: 'Sugarcane Red Rot',
      localDiseaseName: 'गन्ने का लाल सड़न रोग (Red Rot)',
      scientificName: 'Colletotrichum falcatum',
      confidence: 92,
      severity: 'Critical',
      affectedAreaPercentage: 72,
      summary: 'Third and fourth leaves showing yellowing and withering along midrib with internal stalk reddening.',
      symptoms: [
        'Discoloration of third and fourth leaves from top',
        'Dark reddish lesions with white transverse bands inside split canes',
        'Sour alcohol-like fermentation odor emanating from split stalk',
        'Midrib blood-red lesions with small black pycnidia dots'
      ]
    },
    topPredictions: [
      {
        rank: 1,
        diseaseName: 'Sugarcane Red Rot',
        scientificName: 'Colletotrichum falcatum',
        confidence: 92,
        severity: 'Critical',
        distinguishingFeatures: 'Internal reddening with distinct transverse white patches; alcoholic sour smell.'
      },
      {
        rank: 2,
        diseaseName: 'Sugarcane Wilt',
        scientificName: 'Fusarium sacchari',
        confidence: 6,
        severity: 'High',
        distinguishingFeatures: 'Stalk hollow inside with dirty diffuse reddish-purple coloring, no transverse white bands.'
      },
      {
        rank: 3,
        diseaseName: 'Pokkah Boeng',
        scientificName: 'Fusarium moniliforme',
        confidence: 2,
        severity: 'Moderate',
        distinguishingFeatures: 'Chlorotic patches and wrinkled distorted young spindle leaves.'
      }
    ],
    weatherRisk: {
      level: 'Critical Risk',
      riskScore: 89,
      humidity: '91%',
      tempRange: '27°C - 34°C',
      forecastText: 'Heavy rain runoff and waterlogged furrows will cause rapid spread through irrigation channels.'
    },
    farmerAdvisory: {
      chemical: 'Drench root zone with Carbendazim 50% WP @ 2g/L or Thiophanate Methyl 70% WP @ 1.5g/L.',
      cultural: 'Uproot the entire diseased clump and burn outside field boundaries.',
      prevention: 'Do not use setts from this infected field for next crop planting.'
    },
    officerNotes: 'High likelihood of Colletotrichum pathotype CF-08. Physical tissue sample collection ordered for culture isolation.',
    overrideDetails: null,
    labTestDetails: {
      labTicketId: 'LAB-REQ-4091',
      sampleType: 'Internal Stalk Tissue & Root Core',
      urgency: 'Urgent (24h turnaround)',
      labFacility: 'KVK Central Diagnostic Bio-Lab, Regional Agronomy Station',
      samplingInstructions: 'Collect 3 cane stalks showing initial midrib redness. Cut 15cm internode sections, wrap in sterile parafilm and cold pack.',
      dispatchedDate: '2026-09-10T13:30:00Z',
      officer: 'Dr. Ramesh Kumar'
    },
    history: [
      {
        action: 'Case Created by Farmer Scan',
        timestamp: '2026-09-10T11:00:00Z',
        actor: 'Farmer Anand Shinde via PattaPe Mobile'
      },
      {
        action: 'Lab Sample Collection Dispatched',
        timestamp: '2026-09-10T13:30:00Z',
        actor: 'Dr. Ramesh Kumar (Sr. Extension Officer)'
      }
    ]
  },
  {
    id: 'KVK-419082',
    farmerName: 'Muthusamy Selvan',
    farmerPhone: '+91 98421 90812',
    village: 'Thottiyam',
    block: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    fieldAcreage: 3.0,
    cropId: 'banana',
    cropName: 'Banana',
    cropIcon: '🍌',
    submittedAt: '2026-09-09T16:40:00Z',
    status: 'overridden',
    priority: 'Normal',
    originalImage: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1000&q=80',
    heatmapImage: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1000&q=80',
    aiDiagnosis: {
      diseaseId: 'banana_sigatoka',
      diseaseName: 'Banana Black Sigatoka',
      localDiseaseName: 'केले का ब्लैक सिगाटोका रोग',
      scientificName: 'Mycosphaerella fijiensis',
      confidence: 76,
      severity: 'High',
      affectedAreaPercentage: 48,
      summary: 'Narrow reddish-brown streaks parallel to leaf veins turning dark brown.',
      symptoms: [
        'Dark reddish-brown streaks on leaf undersides',
        'Elliptical spots with gray dry centers and black border',
        'Premature leaf collapse'
      ]
    },
    topPredictions: [
      {
        rank: 1,
        diseaseName: 'Banana Black Sigatoka',
        scientificName: 'Mycosphaerella fijiensis',
        confidence: 76,
        severity: 'High',
        distinguishingFeatures: 'Red-brown streaks initially on leaf underside, rapid coalescence.'
      },
      {
        rank: 2,
        diseaseName: 'Yellow Sigatoka Leaf Spot',
        scientificName: 'Pseudocercospora musae',
        confidence: 19,
        severity: 'Moderate',
        distinguishingFeatures: 'Initial light yellow streaks turning brown with bright yellow halo.'
      },
      {
        rank: 3,
        diseaseName: 'Cordana Leaf Spot',
        scientificName: 'Cordana musae',
        confidence: 5,
        severity: 'Low',
        distinguishingFeatures: 'Large oval spots with prominent concentric zonation at leaf edge.'
      }
    ],
    weatherRisk: {
      level: 'High Risk',
      riskScore: 81,
      humidity: '84%',
      tempRange: '26°C - 31°C',
      forecastText: 'Continuous leaf dew and tropical monsoon showers require immediate systemic fungicide.'
    },
    farmerAdvisory: {
      chemical: 'Propiconazole 25% EC @ 1 ml/L + mineral oil (10 ml/L).',
      cultural: 'De-leaf severely affected fronds (>50% necrotic area).',
      prevention: 'Maintain spacing for canopy aeration.'
    },
    officerNotes: 'Overrode AI prediction: Leaf symptoms exhibit classic Yellow Sigatoka (Pseudocercospora musae) with chlorotic bright yellow halo, not Black Sigatoka.',
    overrideDetails: {
      previousDisease: 'Banana Black Sigatoka',
      newDisease: 'Yellow Sigatoka Leaf Spot',
      newScientificName: 'Pseudocercospora musae',
      newSeverity: 'Moderate',
      reason: 'Visual inspection shows distinct yellow halo around streaks and lower tissue penetration, consistent with Yellow Sigatoka rather than Black Sigatoka.',
      updatedAdvice: 'Spray Mancozeb 75% WP @ 2.5g/L with 1% mineral oil. De-leafing can be restricted to dried tips only.',
      overriddenAt: '2026-09-10T09:20:00Z',
      officer: 'Dr. Sunita Verma'
    },
    labTestDetails: null,
    history: [
      {
        action: 'Case Created by Farmer Scan',
        timestamp: '2026-09-09T16:40:00Z',
        actor: 'Farmer Muthusamy Selvan via PattaPe Mobile'
      },
      {
        action: 'Diagnosis Overridden by Officer',
        timestamp: '2026-09-10T09:20:00Z',
        actor: 'Dr. Sunita Verma (Horticulture Specialist)'
      }
    ]
  },
  {
    id: 'KVK-382901',
    farmerName: 'Kishore Jadav',
    farmerPhone: '+91 94278 12390',
    village: 'Junagadh Rural',
    block: 'Saurashtra',
    state: 'Gujarat',
    fieldAcreage: 6.0,
    cropId: 'groundnut',
    cropName: 'Groundnut',
    cropIcon: '🥜',
    submittedAt: '2026-09-11T10:05:00Z',
    status: 'pending',
    priority: 'Normal',
    originalImage: 'https://images.unsplash.com/photo-1567080597797-6707812f8644?auto=format&fit=crop&w=1000&q=80',
    heatmapImage: 'https://images.unsplash.com/photo-1567080597797-6707812f8644?auto=format&fit=crop&w=1000&q=80',
    aiDiagnosis: {
      diseaseId: 'groundnut_tikka',
      diseaseName: 'Early Tikka Leaf Spot',
      localDiseaseName: 'मूंगफली का टिक्का रोग',
      scientificName: 'Cercospora arachidicola',
      confidence: 91,
      severity: 'Moderate',
      affectedAreaPercentage: 38,
      summary: 'Circular dark brown spots surrounded by prominent bright yellow haloes on upper leaf surfaces.',
      symptoms: [
        'Circular reddish-brown to black spots (1-10 mm diameter)',
        'Bright yellow chlorotic halos on upper leaf surface',
        'Leaf drop / early defoliation if left untreated',
        'Infection concentrated on 40-50 day old crop foliage'
      ]
    },
    topPredictions: [
      {
        rank: 1,
        diseaseName: 'Early Tikka Leaf Spot',
        scientificName: 'Cercospora arachidicola',
        confidence: 91,
        severity: 'Moderate',
        distinguishingFeatures: 'Prominent bright yellow halo around dark circular spots; appears earlier in season than late leaf spot.'
      },
      {
        rank: 2,
        diseaseName: 'Late Leaf Spot',
        scientificName: 'Phaeoisariopsis personata',
        confidence: 6,
        severity: 'High',
        distinguishingFeatures: 'Circular black spots on lower surface without prominent yellow halo.'
      },
      {
        rank: 3,
        diseaseName: 'Groundnut Rust',
        scientificName: 'Puccinia arachidis',
        confidence: 3,
        severity: 'Moderate',
        distinguishingFeatures: 'Orange-brown pustules on lower leaf surface discharging powdery urediniospores.'
      }
    ],
    weatherRisk: {
      level: 'Moderate Risk',
      riskScore: 62,
      humidity: '80%',
      tempRange: '24°C - 32°C',
      forecastText: 'Morning fog and high humidity. Recommend immediate morning spray.'
    },
    farmerAdvisory: {
      chemical: 'Spray Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2g/L water.',
      cultural: 'Maintain field weed-free; eliminate infected crop residue.',
      prevention: 'Next season adopt seed treatment with Trichoderma viride @ 10g/kg seed.'
    },
    officerNotes: null,
    overrideDetails: null,
    labTestDetails: null,
    history: [
      {
        action: 'Case Created by Farmer Scan',
        timestamp: '2026-09-11T10:05:00Z',
        actor: 'Farmer Kishore Jadav via PattaPe Mobile'
      }
    ]
  },
  {
    id: 'KVK-290184',
    farmerName: 'Gurpreet Kaur',
    farmerPhone: '+91 98144 65112',
    village: 'Moga West',
    block: 'Moga',
    state: 'Punjab',
    fieldAcreage: 4.0,
    cropId: 'rice',
    cropName: 'Rice',
    cropIcon: '🌾',
    submittedAt: '2026-09-11T11:45:00Z',
    status: 'pending',
    priority: 'Critical',
    originalImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=1000&q=80',
    heatmapImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=1000&q=80',
    aiDiagnosis: {
      diseaseId: 'bacterial_blight',
      diseaseName: 'Bacterial Leaf Blight',
      localDiseaseName: 'धान का जीवाणु झुलसा रोग (BLB)',
      scientificName: 'Xanthomonas oryzae pv. oryzae',
      confidence: 94,
      severity: 'Critical',
      affectedAreaPercentage: 68,
      summary: 'Water-soaked lesions beginning at leaf margins, turning yellow to straw-colored with wavy borders.',
      symptoms: [
        'Marginal water-soaked lesions near leaf tips',
        'Wavy, undulating lesion margins advancing down blade',
        'Straw-white desiccation of foliage ("Kresek" phase risk)',
        'Milky bacterial ooze droplets visible early morning'
      ]
    },
    topPredictions: [
      {
        rank: 1,
        diseaseName: 'Bacterial Leaf Blight',
        scientificName: 'Xanthomonas oryzae',
        confidence: 94,
        severity: 'Critical',
        distinguishingFeatures: 'Wavy margins starting at tip, bacterial ooze drops; no spindle center.'
      },
      {
        rank: 2,
        diseaseName: 'Rice Leaf Blast',
        scientificName: 'Magnaporthe oryzae',
        confidence: 4,
        severity: 'Critical',
        distinguishingFeatures: 'Spindle-shaped spots with gray center, fungal conidiophores.'
      },
      {
        rank: 3,
        diseaseName: 'Sheath Blight',
        scientificName: 'Rhizoctonia solani',
        confidence: 2,
        severity: 'High',
        distinguishingFeatures: 'Irregular oval spots with dark brown margins initiating at water line on leaf sheath.'
      }
    ],
    weatherRisk: {
      level: 'Critical Risk',
      riskScore: 94,
      humidity: '96%',
      tempRange: '26°C - 33°C',
      forecastText: 'Gale winds and thunderstorm rains forecast. BLB bacteria will spread mechanically through leaf abrasions.'
    },
    farmerAdvisory: {
      chemical: 'Spray Streptocycline 100ppm (1g in 10L water) + Copper Oxychloride 50% WP @ 2.5g/L.',
      cultural: 'Avoid field-to-field irrigation flow. Stop nitrogen top dressing immediately.',
      prevention: 'Cultivate resistant varieties like PR 126 or Improved Samba Mahsuri.'
    },
    officerNotes: null,
    overrideDetails: null,
    labTestDetails: null,
    history: [
      {
        action: 'Case Created by Farmer Scan',
        timestamp: '2026-09-11T11:45:00Z',
        actor: 'Farmer Gurpreet Kaur via PattaPe Mobile'
      }
    ]
  },
  {
    id: 'KVK-189230',
    farmerName: 'Venkat Rao',
    farmerPhone: '+91 99890 44521',
    village: 'Miryalaguda',
    block: 'Nalgonda',
    state: 'Telangana',
    fieldAcreage: 3.2,
    cropId: 'chilli',
    cropName: 'Chilli',
    cropIcon: '🌶️',
    submittedAt: '2026-09-08T15:10:00Z',
    status: 'confirmed',
    priority: 'Normal',
    originalImage: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1000&q=80',
    heatmapImage: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1000&q=80',
    aiDiagnosis: {
      diseaseId: 'anthracnose',
      diseaseName: 'Chilli Anthracnose / Dieback',
      localDiseaseName: 'मिर्च का फल सड़न / डाईबैक रोग',
      scientificName: 'Colletotrichum capsici',
      confidence: 90,
      severity: 'High',
      affectedAreaPercentage: 52,
      summary: 'Necrosis of tender twigs from tip downwards (dieback) and sunken circular lesions on maturing pods.',
      symptoms: [
        'Drying of twigs from top downwards with bleached appearance',
        'Sunken, water-soaked dark circular lesions with black acervuli rings',
        'Premature fruit drop and shriveling',
        'Salmon-pink conidial masses under humid conditions'
      ]
    },
    topPredictions: [
      {
        rank: 1,
        diseaseName: 'Chilli Anthracnose / Dieback',
        scientificName: 'Colletotrichum capsici',
        confidence: 90,
        severity: 'High',
        distinguishingFeatures: 'Sunken necrotic spots with concentric acervuli rings; twig dieback.'
      },
      {
        rank: 2,
        diseaseName: 'Cercospora Leaf Spot',
        scientificName: 'Cercospora capsici',
        confidence: 7,
        severity: 'Moderate',
        distinguishingFeatures: 'Circular "frogeye" spots with white center and prominent brown margin.'
      },
      {
        rank: 3,
        diseaseName: 'Bacterial Spot',
        scientificName: 'Xanthomonas campestris pv. vesicatoria',
        confidence: 3,
        severity: 'Moderate',
        distinguishingFeatures: 'Small dark water-soaked spots with raised corky texture on fruits.'
      }
    ],
    weatherRisk: {
      level: 'High Risk',
      riskScore: 78,
      humidity: '82%',
      tempRange: '28°C - 34°C',
      forecastText: 'Intermittent cloud cover and rain splashes favor rapid splash dispersal of fungal spores.'
    },
    farmerAdvisory: {
      chemical: 'Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top) @ 1 ml/L water.',
      cultural: 'Prune dead twigs 2 inches below infected portion and burn.',
      prevention: 'Seed treatment with Thiram @ 3g/kg seed before nursery sowing.'
    },
    officerNotes: 'Confirmed case. Farmer advised on timely fungicide rotation to prevent strobilurin resistance.',
    overrideDetails: null,
    labTestDetails: null,
    history: [
      {
        action: 'Case Created by Farmer Scan',
        timestamp: '2026-09-08T15:10:00Z',
        actor: 'Farmer Venkat Rao via PattaPe Mobile'
      },
      {
        action: 'Diagnosis Confirmed by Officer',
        timestamp: '2026-09-09T10:00:00Z',
        actor: 'Dr. Ramesh Kumar (Sr. Extension Officer)'
      }
    ]
  }
];

/**
 * Load cases from localStorage or fallback to default
 */
export function getOfficerCases() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OFFICER_CASES));
      return INITIAL_OFFICER_CASES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load officer cases from storage:', err);
    return INITIAL_OFFICER_CASES;
  }
}

/**
 * Get case by ID
 */
export function getOfficerCaseById(id) {
  const cases = getOfficerCases();
  return cases.find((c) => c.id === id) || null;
}

/**
 * Save updated cases list to localStorage
 */
function saveCases(cases) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save officer cases:', err);
  }
}

/**
 * Calculate KPI summary statistics
 */
export function getOfficerStats() {
  const cases = getOfficerCases();
  const total = cases.length;
  const pending = cases.filter((c) => c.status === 'pending').length;
  const confirmed = cases.filter((c) => c.status === 'confirmed').length;
  const overridden = cases.filter((c) => c.status === 'overridden').length;
  const labRequested = cases.filter((c) => c.status === 'lab_requested').length;
  const critical = cases.filter((c) => c.aiDiagnosis.severity === 'Critical').length;

  return {
    total,
    pending,
    confirmed,
    overridden,
    labRequested,
    critical
  };
}

/**
 * Officer Action: Confirm Diagnosis
 */
export function confirmDiagnosis(caseId, notes = '', adjustedDosage = '') {
  const cases = getOfficerCases();
  const index = cases.findIndex((c) => c.id === caseId);
  if (index === -1) return null;

  const currentCase = cases[index];
  const now = new Date().toISOString();

  currentCase.status = 'confirmed';
  currentCase.officerNotes = notes || 'Diagnosis confirmed by Extension Officer based on visual symptomatology.';
  if (adjustedDosage) {
    currentCase.farmerAdvisory.chemical = adjustedDosage;
  }
  currentCase.history.push({
    action: 'Diagnosis Confirmed by Extension Officer',
    timestamp: now,
    actor: 'Dr. Ramesh Kumar (KVK Agronomist)',
    notes: notes || 'Confirmed AI identification'
  });

  cases[index] = currentCase;
  saveCases(cases);
  return currentCase;
}

/**
 * Officer Action: Override Diagnosis
 */
export function overrideDiagnosis(caseId, { newDisease, newScientificName, newSeverity, reason, updatedAdvice }) {
  const cases = getOfficerCases();
  const index = cases.findIndex((c) => c.id === caseId);
  if (index === -1) return null;

  const currentCase = cases[index];
  const now = new Date().toISOString();

  const previousDisease = currentCase.aiDiagnosis.diseaseName;

  currentCase.status = 'overridden';
  currentCase.overrideDetails = {
    previousDisease,
    newDisease: newDisease || 'Custom Diagnosed Condition',
    newScientificName: newScientificName || 'Identified by Extension Officer',
    newSeverity: newSeverity || currentCase.aiDiagnosis.severity,
    reason: reason || 'Officer identified distinct morphology contradicting AI prediction.',
    updatedAdvice: updatedAdvice || currentCase.farmerAdvisory.chemical,
    overriddenAt: now,
    officer: 'Dr. Ramesh Kumar (KVK Agronomist)'
  };

  // Update primary display fields
  currentCase.aiDiagnosis.diseaseName = newDisease;
  if (newScientificName) currentCase.aiDiagnosis.scientificName = newScientificName;
  if (newSeverity) currentCase.aiDiagnosis.severity = newSeverity;
  if (updatedAdvice) currentCase.farmerAdvisory.chemical = updatedAdvice;

  currentCase.officerNotes = `Override: ${reason}`;
  currentCase.history.push({
    action: `Diagnosis Overridden from "${previousDisease}" to "${newDisease}"`,
    timestamp: now,
    actor: 'Dr. Ramesh Kumar (KVK Agronomist)',
    notes: reason
  });

  cases[index] = currentCase;
  saveCases(cases);
  return currentCase;
}

/**
 * Officer Action: Request Lab Test
 */
export function requestLabTest(caseId, { sampleType, urgency, labFacility, samplingInstructions }) {
  const cases = getOfficerCases();
  const index = cases.findIndex((c) => c.id === caseId);
  if (index === -1) return null;

  const currentCase = cases[index];
  const now = new Date().toISOString();
  const labTicketId = 'LAB-REQ-' + Math.floor(1000 + Math.random() * 9000);

  currentCase.status = 'lab_requested';
  currentCase.labTestDetails = {
    labTicketId,
    sampleType: sampleType || 'Leaf Tissue Sample',
    urgency: urgency || 'Urgent (24h turnaround)',
    labFacility: labFacility || 'KVK Central Diagnostic Bio-Lab, Division 4',
    samplingInstructions: samplingInstructions || 'Collect fresh foliage samples with active margins; place in sterile moisture pack.',
    dispatchedDate: now,
    officer: 'Dr. Ramesh Kumar (KVK Agronomist)'
  };

  currentCase.history.push({
    action: `Field Lab Sample Dispatched (${labTicketId})`,
    timestamp: now,
    actor: 'Dr. Ramesh Kumar (KVK Agronomist)',
    notes: `${sampleType} dispatched to ${labFacility} with ${urgency} priority.`
  });

  cases[index] = currentCase;
  saveCases(cases);
  return currentCase;
}

/**
 * Reset data back to default initial seed
 */
export function resetOfficerData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OFFICER_CASES));
  return INITIAL_OFFICER_CASES;
}
