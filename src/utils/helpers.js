// Helper utilities for PattaPe – AI Crop Doctor

export const LANGUAGES = [
  { code: 'hi', label: 'हिन्दी (Hindi)', speechLang: 'hi-IN' },
  { code: 'en', label: 'English', speechLang: 'en-IN' },
  { code: 'mr', label: 'मराठी (Marathi)', speechLang: 'mr-IN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', speechLang: 'pa-IN' },
  { code: 'te', label: 'తెలుగు (Telugu)', speechLang: 'te-IN' }
];

export const TRANSLATIONS = {
  en: {
    appTitle: 'PattaPe – AI Crop Doctor',
    tagline: 'Instant Leaf Disease Diagnosis for Farmers',
    step1Title: 'Select Your Crop',
    step1Sub: 'Tap the crop you want to check today',
    step2Title: 'Take or Upload Leaf Photo',
    step2Sub: 'Ensure leaf is clear and well lit under sunlight',
    step3Title: 'Analyzing your crop...',
    step3Sub: 'This may take a few seconds',
    step4Title: 'Diagnosis Results',
    nextButton: 'Next: Take Photo',
    analyzeButton: 'Analyze Leaf Now',
    changeCrop: 'Change Crop',
    listenAdvice: 'Listen to Advice',
    stopAudio: 'Stop Audio',
    severity: 'Severity Level',
    affectedArea: 'Affected Leaf Area',
    weatherRisk: '72-Hour Weather Spread Risk',
    advisoryHeader: 'Step-by-step Treatment Plan',
    escalateBtn: 'Talk to Agri Officer Now',
    sampleLeaf: 'Or try with sample leaf photo',
    culturalTab: 'Organic & Practices',
    chemicalTab: 'Chemical Spray',
    preventionTab: 'Field Prevention',
    ticketSubmitted: 'Escalation Sent Successfully!',
    analyzingSteps: [
      { title: 'Checking leaf symptoms', detail: 'Scanning lesions, chlorosis & leaf surface' },
      { title: 'Identifying possible disease', detail: 'Matching against 50,000+ crop pathogen samples' },
      { title: 'Measuring affected area', detail: 'Calculating damage percentage and leaf coverage' },
      { title: 'Checking 72-hour spread risk', detail: 'Assessing weather, moisture & spore propagation' },
      { title: 'Preparing advice', detail: 'Generating verified ICAR & KVK treatment protocol' }
    ]
  },
  hi: {
    appTitle: 'पत्तापे – एआई फसल डॉक्टर',
    tagline: 'किसानों के लिए पत्ती बीमारी की त्वरित पहचान',
    step1Title: 'अपनी फसल चुनें',
    step1Sub: 'जिस फसल की जांच करनी है उस पर टैप करें',
    step2Title: 'बीमार पत्ती का फोटो लें या अपलोड करें',
    step2Sub: 'पत्ती साफ और अच्छी धूप में दिखनी चाहिए',
    step3Title: 'आपकी फसल का विश्लेषण हो रहा है...',
    step3Sub: 'कृपया कुछ सेकंड प्रतीक्षा करें',
    step4Title: 'जांच रिपोर्ट और उपचार',
    nextButton: 'आगे: फोटो खींचें',
    analyzeButton: 'पत्ती की जांच करें',
    changeCrop: 'फसल बदलें',
    listenAdvice: 'आवाज में सुनें (ऑडियो)',
    stopAudio: 'आवाज बंद करें',
    severity: 'बीमारी का स्तर (गंभीरता)',
    affectedArea: 'प्रभावित पत्ती का हिस्सा',
    weatherRisk: '७२ घंटे में फैलने का खतरा',
    advisoryHeader: 'उपचार और दवा की जानकारी',
    escalateBtn: 'कृषि अधिकारी से बात करें',
    sampleLeaf: 'या नमूना पत्ती फोटो से टेस्ट करें',
    culturalTab: 'जैविक व घरेलू उपाय',
    chemicalTab: 'रासायनिक दवा छिड़काव',
    preventionTab: 'बचाव और सावधानियां',
    ticketSubmitted: 'कृषि अधिकारी को सूचना भेजी गई!',
    analyzingSteps: [
      { title: 'Checking leaf symptoms', detail: 'पत्ती के लक्षणों और धब्बों की जांच' },
      { title: 'Identifying possible disease', detail: 'संभावित बीमारी और रोगाणु की पहचान' },
      { title: 'Measuring affected area', detail: 'प्रभावित पत्ती क्षेत्र का सटीक मापन' },
      { title: 'Checking 72-hour spread risk', detail: '72 घंटे में बीमारी फैलने का खतरा' },
      { title: 'Preparing advice', detail: 'सटीक उपचार और कृषि सलाह तैयार' }
    ]
  }
};

/**
 * Text-to-Speech Web Speech API integration
 */
let synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText(text, langCode = 'hi', onEndCallback) {
  if (!isSpeechSupported()) {
    alert('Voice output is not supported on this browser.');
    return;
  }

  // Cancel any ongoing speech
  synth.cancel();

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find matching language tag
  const langObj = LANGUAGES.find(l => l.code === langCode);
  utterance.lang = langObj ? langObj.speechLang : 'hi-IN';
  utterance.rate = 0.9; // Slightly slower for low digital literacy clarity
  utterance.pitch = 1.0;

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
  }

  synth.speak(utterance);
}

export function stopSpeech() {
  if (isSpeechSupported() && synth) {
    synth.cancel();
  }
}

/**
 * Color mapper for high outdoor contrast severity badges
 */
export function getSeverityStyle(severity) {
  switch (severity?.toLowerCase()) {
    case 'severe':
    case 'critical':
    case 'high':
      return {
        bg: 'bg-red-700',
        text: 'text-white',
        border: 'border-red-900',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-800',
        badgeBorder: 'border-red-300',
        label: 'Severe',
        localLabel: 'गंभीर',
        iconColor: '#B91C1C'
      };
    case 'moderate':
    case 'medium':
      return {
        bg: 'bg-amber-600',
        text: 'text-white',
        border: 'border-amber-800',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-900',
        badgeBorder: 'border-amber-300',
        label: 'Moderate',
        localLabel: 'मध्यम',
        iconColor: '#D97706'
      };
    case 'mild':
      return {
        bg: 'bg-lime-600',
        text: 'text-white',
        border: 'border-lime-800',
        badgeBg: 'bg-lime-100',
        badgeText: 'text-lime-900',
        badgeBorder: 'border-lime-300',
        label: 'Mild',
        localLabel: 'हल्का',
        iconColor: '#65A30D'
      };
    case 'trace':
    case 'low':
    default:
      return {
        bg: 'bg-emerald-700',
        text: 'text-white',
        border: 'border-emerald-900',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-900',
        badgeBorder: 'border-emerald-300',
        label: 'Trace',
        localLabel: 'नगण्य (कम)',
        iconColor: '#047857'
      };
  }
}
