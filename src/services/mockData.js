// Mock Data for PattaPe – AI Crop Doctor

export const MOCK_CROPS = [
  {
    id: 'rice',
    name: 'Rice',
    localName: 'धान (Rice)',
    icon: '🌾',
    popularIn: 'Punjab, UP, WB, AP, TN',
    sampleImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    diseases: ['blast', 'brown_spot']
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

export const MOCK_DIAGNOSES = {
  rice: {
    diseaseId: 'blast',
    diseaseName: 'Rice Leaf Blast',
    localDiseaseName: 'धान का ब्लास्ट रोग (Rice Blast)',
    scientificName: 'Magnaporthe oryzae',
    cropName: 'Rice',
    confidence: 93,
    severity: 'Critical',
    severityColor: '#991B1B',
    affectedAreaPercentage: 75,
    summary: 'Spindle-shaped lesions with gray centers on leaf blades.',
    localSummary: 'पत्तियों पर धुरी के आकार के धब्बे। फसल के नुकसान को रोकने के लिए तुरंत कदम उठाएं।',
    weatherRisk: {
      level: 'Critical Risk',
      riskScore: 90,
      humidity: '92%',
      tempRange: '20°C - 28°C',
      forecastText: 'High night moisture forecast will trigger rapid spore germination.',
      localForecastText: 'रात की नमी ब्लास्ट के जीवाणुओं को तेजी से बढ़ाएगी।'
    },
    advisory: {
      cultural: [
        {
          title: 'Drain excess standing water',
          detail: 'Allow paddy field soil to dry slightly for 2 days to suppress fungal moisture.',
          local: 'खेत से अतिरिक्त पानी निकालकर २ दिनों के लिए हल्का सुखाएं।'
        }
      ],
      chemical: [
        {
          title: 'Tricyclazole 75% WP',
          detail: 'Dissolve 0.6g per Liter of water. Spray at first sign of leaf spots.',
          local: 'ट्राइसाइक्लाजोल ०.६ ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।'
        }
      ],
      prevention: [
        {
          title: 'Avoid Excessive Nitrogen Fertilizer',
          detail: 'Split Urea doses into 3 equal parts rather than heavy single dose.',
          local: 'यूरिया का एक बार में अधिक प्रयोग न करें, किस्तों में दें।'
        }
      ]
    },
    officerInfo: {
      name: 'Dr. Sunita Verma',
      designation: 'Rice Crop Specialist',
      center: 'Regional Agriculture Research Station',
      phone: '+91 98765 88990',
      kisanHelpline: '1800-180-1551',
      availableHours: '9:00 AM - 5:00 PM'
    }
  },

  chilli: {
    diseaseId: 'chilli_curl',
    diseaseName: 'Chilli Leaf Curl Virus',
    localDiseaseName: 'मिर्च का पर्ण कुंचन रोग (Leaf Curl)',
    scientificName: 'Begomovirus',
    cropName: 'Chilli',
    confidence: 95,
    severity: 'High',
    severityColor: '#DC2626',
    affectedAreaPercentage: 62,
    summary: 'Leaves curling upwards, puckered texture, and stunted plant growth.',
    localSummary: 'पत्तियां ऊपर की ओर मुड़ रही हैं और पौधे का विकास रुक गया है।',
    weatherRisk: {
      level: 'High Risk',
      riskScore: 80,
      humidity: '78%',
      tempRange: '28°C - 35°C',
      forecastText: 'Hot dry weather favoring whitefly vector spread.',
      localForecastText: 'सूखा और गर्म मौसम सफेद मक्खी के फैलाव को बढ़ाएगा।'
    },
    advisory: {
      cultural: [
        {
          title: 'Yellow Sticky Traps',
          detail: 'Install 12 yellow sticky traps per acre to trap whiteflies.',
          local: 'सफेद मक्खी नियंत्रण के लिए पीले चिपचिपे कार्ड लगाएं।'
        }
      ],
      chemical: [
        {
          title: 'Imidacloprid 17.8% SL',
          detail: 'Spray 0.5 ml per Liter of water to control whitefly vector.',
          local: 'इमिडाक्लोप्रिड ०.५ मि.ली. प्रति लीटर पानी में मिलाकर स्प्रे करें।'
        }
      ],
      prevention: [
        {
          title: 'Remove infected plants',
          detail: 'Uproot severely crumpled plants early.',
          local: 'अत्यधिक खराब पौधों को उखाड़ कर नष्ट करें।'
        }
      ]
    },
    officerInfo: {
      name: 'Dr. Ramesh Kumar',
      designation: 'Senior Krishi Vigyan Kendra Officer',
      center: 'District KVK Agriculture Hub',
      phone: '+91 98765 43210',
      kisanHelpline: '1800-180-1551',
      availableHours: '8:00 AM - 6:00 PM'
    }
  },

  banana: {
    diseaseId: 'banana_sigatoka',
    diseaseName: 'Banana Sigatoka Leaf Spot',
    localDiseaseName: 'केले का सिगाटोका रोग (Sigatoka Spot)',
    scientificName: 'Mycosphaerella fijiensis',
    cropName: 'Banana',
    confidence: 91,
    severity: 'High',
    severityColor: '#DC2626',
    affectedAreaPercentage: 58,
    summary: 'Dark reddish-brown streaks parallel to leaf veins.',
    localSummary: 'पत्तियों पर लाल-भूरे रंग की धारियां दिख रही हैं।',
    weatherRisk: {
      level: 'High Risk',
      riskScore: 84,
      humidity: '85%',
      tempRange: '25°C - 30°C',
      forecastText: 'Continuous leaf wetness will increase streak multiplication.',
      localForecastText: 'पत्तियों पर पानी बना रहने से बीमारी फैलेगी।'
    },
    advisory: {
      cultural: [
        {
          title: 'Prune spotted leaves',
          detail: 'Cut off leaves with more than 50% spot area.',
          local: '५०% से अधिक खराब पत्तियों को काटकर हटाएं।'
        }
      ],
      chemical: [
        {
          title: 'Propiconazole 25% EC',
          detail: 'Spray 1 ml per Liter water mixed with 1 ml mineral oil.',
          local: 'प्रोपिकोनाज़ोल १ मि.ली. प्रति लीटर पानी में मिलाकर छिड़कें।'
        }
      ],
      prevention: [
        {
          title: 'Improve field drainage',
          detail: 'Avoid water stagnation around banana stem base.',
          local: 'तना के आसपास जलभराव न होने दें।'
        }
      ]
    },
    officerInfo: {
      name: 'Dr. Sunita Verma',
      designation: 'Horticulture Specialist',
      center: 'Regional KVK Station',
      phone: '+91 98765 88990',
      kisanHelpline: '1800-180-1551',
      availableHours: '9:00 AM - 5:00 PM'
    }
  },

  groundnut: {
    diseaseId: 'groundnut_tikka',
    diseaseName: 'Groundnut Tikka Disease',
    localDiseaseName: 'मूंगफली का टिक्का रोग (Tikka Disease)',
    scientificName: 'Cercospora arachidicola',
    cropName: 'Groundnut',
    confidence: 89,
    severity: 'Moderate',
    severityColor: '#D97706',
    affectedAreaPercentage: 45,
    summary: 'Circular dark spots surrounded by bright yellow halo on leaf surface.',
    localSummary: 'पत्तियों पर पीले घेरे के साथ गोल काले धब्बे दिखाई दे रहे हैं।',
    weatherRisk: {
      level: 'Moderate Risk',
      riskScore: 60,
      humidity: '80%',
      tempRange: '24°C - 31°C',
      forecastText: 'Moderate risk. Early morning spray recommended.',
      localForecastText: 'सुबह के समय फफूंदनाशी छिड़काव करें।'
    },
    advisory: {
      cultural: [
        {
          title: 'Crop Rotation',
          detail: 'Rotate groundnut crop with cereal crops like maize or sorghum.',
          local: 'फसल चक्र अपनाएं, मक्का या ज्वार के बाद मूंगफली बोएं।'
        }
      ],
      chemical: [
        {
          title: 'Mancozeb 75% WP',
          detail: 'Spray 2.5g per Liter of water.',
          local: 'मैनकोजेब २.५ ग्राम प्रति लीटर पानी में मिलाकर स्प्रे करें।'
        }
      ],
      prevention: [
        {
          title: 'Seed Treatment',
          detail: 'Treat seeds with Trichoderma harzianum before sowing.',
          local: 'बीज बोने से पहले बीजोपचार करें।'
        }
      ]
    },
    officerInfo: {
      name: 'Kisan Helpline Expert',
      designation: 'Agriculture Advisory Officer',
      center: 'Kishan Seva Kendra',
      phone: '+91 98765 12345',
      kisanHelpline: '1800-180-1551',
      availableHours: '24x7 Helpline'
    }
  },

  sugarcane: {
    diseaseId: 'sugarcane_redrot',
    diseaseName: 'Sugarcane Red Rot',
    localDiseaseName: 'गन्ने का लाल सड़न रोग (Red Rot)',
    scientificName: 'Colletotrichum falcatum',
    cropName: 'Sugarcane',
    confidence: 92,
    severity: 'Critical',
    severityColor: '#991B1B',
    affectedAreaPercentage: 70,
    summary: 'Reddening of internal stalk tissue with alcoholic sour odor.',
    localSummary: 'पत्तियों और तने में लाल रंग की धारियां। तुरंत बचाव करें।',
    weatherRisk: {
      level: 'Critical Risk',
      riskScore: 88,
      humidity: '90%',
      tempRange: '28°C - 34°C',
      forecastText: 'High waterlogging risk favors red rot spreading rapidly.',
      localForecastText: 'खेत में पानी रुकने से लाल सड़न रोग तेजी से फैलेगा।'
    },
    advisory: {
      cultural: [
        {
          title: 'Uproot infected clump',
          detail: 'Dig out entire infected cane clump and burn outside field.',
          local: 'संक्रमित गन्ने के थान को जड़ से उखाड़कर नष्ट करें।'
        }
      ],
      chemical: [
        {
          title: 'Carbendazim 50% WP',
          detail: 'Drench soil at cane base with 2g per Liter of water.',
          local: 'कार्बेन्डाजिम २ ग्राम प्रति लीटर पानी में घोलकर जड़ों में दें।'
        }
      ],
      prevention: [
        {
          title: 'Use Disease Resistant Varieties',
          detail: 'Plant disease resistant varieties like Co 0238 or Co 86032.',
          local: 'रोगरोधी किस्मों की बुवाई करें।'
        }
      ]
    },
    officerInfo: {
      name: 'Dr. Ramesh Kumar',
      designation: 'Sugarcane Disease Specialist',
      center: 'Sugarcane Research Institute',
      phone: '+91 98765 43210',
      kisanHelpline: '1800-180-1551',
      availableHours: '8:00 AM - 6:00 PM'
    }
  },

  default: {
    diseaseId: 'leaf_spot_general',
    diseaseName: 'Fungal Leaf Spot',
    localDiseaseName: 'पत्ती धब्बा रोग (Fungal Spot)',
    scientificName: 'Cercospora spp.',
    cropName: 'Crop Leaf',
    confidence: 88,
    severity: 'Moderate',
    severityColor: '#D97706',
    affectedAreaPercentage: 42,
    summary: 'Irregular brown spots detected on foliage.',
    localSummary: 'पत्तियों पर भूरे रंग के धब्बे दिख रहे हैं।',
    weatherRisk: {
      level: 'Moderate Risk',
      riskScore: 55,
      humidity: '75%',
      tempRange: '25°C - 32°C',
      forecastText: 'Moderate weather conditions. Keep monitoring field daily.',
      localForecastText: 'मौसम सामान्य है, लेकिन रोज फसल पर ध्यान दें।'
    },
    advisory: {
      cultural: [
        {
          title: 'Remove damaged leaves',
          detail: 'Pick off severely spotted leaves and keep soil surface clean.',
          local: 'खराब पत्तियों को काटकर साफ सफाई रखें।'
        }
      ],
      chemical: [
        {
          title: 'Copper Based Fungicide',
          detail: 'Apply 2g per Liter spray if spots spread across 20% foliage.',
          local: 'कॉपर फफूंदनाशी २ ग्राम प्रति लीटर पानी में स्प्रे करें।'
        }
      ],
      prevention: [
        {
          title: 'Maintain Field Sanitation',
          detail: 'Clear weeds surrounding field borders.',
          local: 'मेड़ों और खेत के आसपास खरपतवार नष्ट करें।'
        }
      ]
    },
    officerInfo: {
      name: 'Kisan Helpline Expert',
      designation: 'Agriculture Advisory Officer',
      center: 'Kishan Seva Kendra',
      phone: '+91 98765 12345',
      kisanHelpline: '1800-180-1551',
      availableHours: '24x7 Helpline'
    }
  }
};
