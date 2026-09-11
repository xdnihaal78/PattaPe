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
    step3Title: 'AI Doctor is Inspecting Leaf...',
    step3Sub: 'Analyzing spots, weather patterns, and spread risks',
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
    ticketSubmitted: 'Escalation Sent Successfully!'
  },
  hi: {
    appTitle: 'पत्तापे – एआई फसल डॉक्टर',
    tagline: 'किसानों के लिए पत्ती बीमारी की त्वरित पहचान',
    step1Title: 'अपनी फसल चुनें',
    step1Sub: 'जिस फसल की जांच करनी है उस पर टैप करें',
    step2Title: 'बीमार पत्ती का फोटो लें या अपलोड करें',
    step2Sub: 'पत्ती साफ और अच्छी धूप में दिखनी चाहिए',
    step3Title: 'एआई डॉक्टर पत्ती की जांच कर रहा है...',
    step3Sub: 'धब्बों, मौसम और फैलने के खतरे की जांच जारी है',
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
    ticketSubmitted: 'कृषि अधिकारी को सूचना भेजी गई!'
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
    case 'critical':
      return {
        bg: 'bg-red-700',
        text: 'text-white',
        border: 'border-red-900',
        label: 'CRITICAL / अत्यंत गंभीर',
        iconColor: '#991B1B'
      };
    case 'high':
      return {
        bg: 'bg-red-600',
        text: 'text-white',
        border: 'border-red-700',
        label: 'HIGH / गंभीर खतरा',
        iconColor: '#DC2626'
      };
    case 'moderate':
    case 'medium':
      return {
        bg: 'bg-amber-600',
        text: 'text-white',
        border: 'border-amber-700',
        label: 'MODERATE / मध्यम',
        iconColor: '#D97706'
      };
    case 'low':
    default:
      return {
        bg: 'bg-emerald-700',
        text: 'text-white',
        border: 'border-emerald-800',
        label: 'LOW / कम खतरा',
        iconColor: '#15803D'
      };
  }
}
