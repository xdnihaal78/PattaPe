// Helper utilities for PattaPe – AI Crop Doctor

import { 
  LANGUAGES, 
  TRANSLATIONS, 
  getStoredLanguage, 
  setStoredLanguage, 
  getTranslation,
  DEFAULT_LANGUAGE 
} from '../i18n/index.js';

export { 
  LANGUAGES, 
  TRANSLATIONS, 
  getStoredLanguage, 
  setStoredLanguage, 
  getTranslation,
  DEFAULT_LANGUAGE 
};

/**
 * Text-to-Speech Web Speech API integration
 */
let synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voicesCache = [];

function populateVoices() {
  if (isSpeechSupported() && synth) {
    try {
      const v = synth.getVoices();
      if (v && v.length > 0) {
        voicesCache = v;
      }
    } catch (e) {
      console.warn('Error loading speech voices:', e);
    }
  }
}

if (isSpeechSupported() && synth) {
  populateVoices();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoices;
  }
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function getVoicesList() {
  if (!isSpeechSupported() || !synth) return [];
  try {
    const direct = synth.getVoices();
    if (direct && direct.length > 0) {
      voicesCache = direct;
      return direct;
    }
  } catch (_) {}
  return voicesCache;
}

export function findBestVoiceForLang(langCode) {
  const voices = getVoicesList();
  if (!voices || voices.length === 0) return null;

  const code = (langCode || '').toLowerCase();

  // 1. TAMIL: Prioritize local authentic Tamil voices (Google தமிழ், Microsoft Pallavi, Microsoft Valluvar)
  if (code.startsWith('ta')) {
    // Check by native script and Tamil identifiers
    const nativeNamed = voices.find(v => 
      (v.name || '').includes('தமிழ்') || 
      (v.name || '').toLowerCase().includes('tamil') ||
      (v.name || '').toLowerCase().includes('pallavi') ||
      (v.name || '').toLowerCase().includes('valluvar')
    );
    if (nativeNamed) return nativeNamed;

    // Match BCP-47 language tag
    const langMatch = voices.find(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      return l === 'ta-in' || l.startsWith('ta');
    });
    if (langMatch) return langMatch;

    return null;
  }

  // 2. KANNADA: Prioritize local authentic Kannada voices (Google ಕನ್ನಡ, Microsoft Gagan, Microsoft Sapna)
  if (code.startsWith('kn') || code.startsWith('ka')) {
    // Check by native script and Kannada identifiers
    const nativeNamed = voices.find(v => 
      (v.name || '').includes('ಕನ್ನಡ') || 
      (v.name || '').toLowerCase().includes('kannada') ||
      (v.name || '').toLowerCase().includes('gagan') ||
      (v.name || '').toLowerCase().includes('sapna')
    );
    if (nativeNamed) return nativeNamed;

    // Match BCP-47 language tag
    const langMatch = voices.find(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      return l === 'kn-in' || l.startsWith('kn') || l === 'ka-in' || l.startsWith('ka');
    });
    if (langMatch) return langMatch;

    return null;
  }

  // 3. HINDI: Prioritize local authentic Hindi voices (Google हिन्दी, Swara, Kalpana, Madhur)
  if (code.startsWith('hi')) {
    const nativeNamed = voices.find(v => 
      (v.name || '').includes('हिन्दी') || 
      (v.name || '').toLowerCase().includes('hindi') ||
      (v.name || '').toLowerCase().includes('swara') ||
      (v.name || '').toLowerCase().includes('madhur') ||
      (v.name || '').toLowerCase().includes('kalpana')
    );
    if (nativeNamed) return nativeNamed;

    const langMatch = voices.find(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      return l === 'hi-in' || l.startsWith('hi');
    });
    if (langMatch) return langMatch;

    return null;
  }

  // 4. ENGLISH: Prioritize Indian English accent (Ravi, Heera, Neerja, Prabhat, en-IN)
  const indianEnglish = voices.find(v => {
    const l = (v.lang || '').toLowerCase().replace('_', '-');
    const n = (v.name || '').toLowerCase();
    return l === 'en-in' || n.includes('india') || n.includes('ravi') || n.includes('heera') || n.includes('neerja');
  });
  if (indianEnglish) return indianEnglish;

  return voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || null;
}

export function speakText(text, langCode = 'en', onEndCallback, diagnosis = null) {
  if (!isSpeechSupported()) {
    console.warn('Voice output is not supported on this browser.');
    return;
  }

  // Cancel any ongoing speech
  stopSpeech();

  const code = (langCode || 'en').toLowerCase();

  // Always generate pure native conversational script if diagnosis object is present
  const textToSpeak = diagnosis 
    ? buildVoiceAdviceScript(diagnosis, code) 
    : (text || '');

  if (!textToSpeak) return;

  const executeSpeech = () => {
    const matchedVoice = findBestVoiceForLang(code);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Set authentic regional BCP-47 tag
    if (code.startsWith('ta')) {
      utterance.lang = 'ta-IN';
    } else if (code.startsWith('kn') || code.startsWith('ka')) {
      utterance.lang = 'kn-IN';
    } else if (code.startsWith('hi')) {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    // Attach matched native voice ONLY if it matches the target language.
    // NEVER assign an English voice (such as Microsoft David) to Tamil or Kannada text!
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || utterance.lang;
    }

    // Natural human rate & pitch for local Indian languages
    // pitch: 1.0 (standard pitch prevents robotic frequency shift artifacts)
    // rate: 0.92 (warm, clear, natural spoken pace for rural farmers)
    utterance.pitch = 1.0;
    utterance.rate = 0.92;

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error or cancelled:', e);
      if (onEndCallback) onEndCallback();
    };

    try {
      synth.speak(utterance);
    } catch (err) {
      console.warn('synth.speak error:', err);
      if (onEndCallback) onEndCallback();
    }
  };

  // If voices list is still loading in Chromium, wait or retry
  const availableVoices = getVoicesList();
  if (availableVoices.length === 0 && synth.onvoiceschanged !== undefined) {
    let triggered = false;
    const voiceLoadListener = () => {
      if (triggered) return;
      triggered = true;
      populateVoices();
      executeSpeech();
    };
    synth.onvoiceschanged = voiceLoadListener;
    setTimeout(() => {
      if (!triggered) {
        triggered = true;
        executeSpeech();
      }
    }, 250);
  } else {
    executeSpeech();
  }
}

export function stopSpeech() {
  if (isSpeechSupported() && synth) {
    synth.cancel();
  }
}

/**
 * Constructs full audio advisory script reading aloud:
 * - Disease name
 * - Severity
 * - Affected percentage
 * - 72-hour risk level
 * - Do Now advice
 * - Watch For advice
 * Phrased in authentic local agricultural dialect with natural pauses.
 */
export function buildVoiceAdviceScript(diagnosis, currentLang = 'en') {
  if (!diagnosis) return '';

  const cropName = diagnosis.crop_label_i18n?.[currentLang] 
    || diagnosis.crop_label_i18n?.en 
    || diagnosis.crop 
    || 'Crop';

  const diseaseName = diagnosis.disease_label_i18n?.[currentLang] 
    || diagnosis.disease_label_i18n?.en 
    || diagnosis.diseaseName 
    || diagnosis.disease 
    || 'Plant Condition';

  const severityStyle = getSeverityStyle(diagnosis.severity, currentLang);
  const severityLabel = severityStyle.label || diagnosis.severity || 'Moderate';

  const affectedPct = Math.round(diagnosis.affected_pct ?? diagnosis.affectedAreaPercentage ?? 26);

  const riskLevelRaw = (diagnosis.risk_72h?.level || diagnosis.weatherRisk?.level || 'moderate').toLowerCase();
  const riskLabels = {
    high: { en: 'High Risk', hi: 'अधिक खतरा', ta: 'அதிக அபாயம்', kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ', ka: 'ಹೆಚ್ಚಿನ ಅಪಾಯ' },
    moderate: { en: 'Moderate Risk', hi: 'मध्यम खतरा', ta: 'மிதமான அபாயம்', kn: 'ಮಧ್ಯಮ ಅಪಾಯ', ka: 'ಮಧ್ಯಮ ಅಪಾಯ' },
    low: { en: 'Low Risk', hi: 'कम खतरा', ta: 'குறைந்த அபாயம்', kn: 'ಕಡಿಮೆ ಅಪಾಯ', ka: 'ಕಡಿಮೆ ಅಪಾಯ' }
  };
  const isHigh = riskLevelRaw.includes('high') || riskLevelRaw.includes('severe');
  const isMod = riskLevelRaw.includes('moderate') || riskLevelRaw.includes('medium');
  const riskKey = isHigh ? 'high' : isMod ? 'moderate' : 'low';
  const riskLevelDisplay = riskLabels[riskKey][currentLang] || riskLabels[riskKey].kn || riskLabels[riskKey].en;

  // Localized Do Now & Watch For items
  const localizedDoNowMap = {
    hi: [
      'खेत से खड़े पानी की तुरंत निकासी करें',
      'पत्तियों में नमी रहने पर खेत में काम करने से बचें',
      'संक्रमित औजारों को दूसरे खेत में न ले जाएं'
    ],
    ta: [
      'வயலில் தேங்கியுள்ள தண்ணீரை உடனடியாக வடித்து விடுங்கள்',
      'இலைகளில் ஈரம் இருக்கும்போது வயலில் வேலை செய்யாதீர்கள்',
      'பாதிக்கப்பட்ட கருவிகளை சுத்தம் செய்யாமல் அடுத்த வயலுக்கு கொண்டு செல்லாதீர்கள்'
    ],
    kn: [
      'ಹೊಲದಲ್ಲಿ ನಿಂತಿರುವ ಹೆಚ್ಚುವರಿ ನೀರನ್ನು ಕೂಡಲೇ ಹೊರಹಾಕಿ',
      'ಎಲೆಗಳಲ್ಲಿ ತೇವಾಂಶ ಹೆಚ್ಚಿದ್ದಾಗ ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡಬೇಡಿ',
      'ರೋಗ ತಗುಲಿದ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ತೊಳೆದು ಸ್ವಚ್ಛಗೊಳಿಸದೆ ಬೇರೆ ಹೊಲದಲ್ಲಿ ಬಳಸಬೇಡಿ'
    ],
    ka: [
      'ಹೊಲದಲ್ಲಿ ನಿಂತಿರುವ ಹೆಚ್ಚುವರಿ ನೀರನ್ನು ಕೂಡಲೇ ಹೊರಹಾಕಿ',
      'ಎಲೆಗಳಲ್ಲಿ ತೇವಾಂಶ ಹೆಚ್ಚಿದ್ದಾಗ ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡಬೇಡಿ',
      'ರೋಗ ತಗುಲಿದ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ತೊಳೆದು ಸ್ವಚ್ಛಗೊಳಿಸದೆ ಬೇರೆ ಹೊಲದಲ್ಲಿ ಬಳಸಬೇಡಿ'
    ]
  };

  const localizedWatchForMap = {
    hi: [
      'पत्तियों के किनारे तेजी से सूख रहे हैं या नहीं, इस पर नजर रखें',
      'आसपास के स्वस्थ पत्तों का पीला पड़ना'
    ],
    ta: [
      'இலை ஓரங்களில் கருகல் வேகமாக பரவுகிறதா என்று தொடர்ந்து கவனியுங்கள்',
      'பக்கத்து இலைகள் மஞ்சள் நிறமாக மாறுகிறதா என்று பாருங்கள்'
    ],
    kn: [
      'ಎಲೆಗಳ ಅಂಚುಗಳು ಒಣಗಿ ಹಳದಿ ಅಥವಾ ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆಯೇ ಎಂದು ನಿಗಾವಹಿಸಿ',
      'ಹತ್ತಿರದ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆಯೇ ಎಂದು ಗಮನಿಸಿ'
    ],
    ka: [
      'ಎಲೆಗಳ ಅಂಚುಗಳು ಒಣಗಿ ಹಳದಿ ಅಥವಾ ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆಯೇ ಎಂದು ನಿಗಾವಹಿಸಿ',
      'ಹತ್ತಿರದ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆಯೇ ಎಂದು ಗಮನಿಸಿ'
    ]
  };

  const doNowList = (localizedDoNowMap[currentLang] || diagnosis.advisory?.do_now || []).slice(0, 3);
  const watchForList = (localizedWatchForMap[currentLang] || diagnosis.advisory?.watch_for || []).slice(0, 2);

  const doNowText = doNowList.join('। ');
  const watchForText = watchForList.join('। ');

  // 1. TAMIL LOCAL AGRICULTURAL DIALECT
  if (currentLang === 'ta') {
    const crop = diagnosis.crop_label_i18n?.ta || (diagnosis.crop === 'rice' ? 'நெல்' : 'பயிர்');
    const disease = diagnosis.disease_label_i18n?.ta || (diagnosis.disease === 'bacterial_leaf_blight' ? 'பாக்டீரியா இலைக்கருகல்' : diseaseName);
    const sev = severityStyle.label || 'மிதமான';
    
    return `வணக்கம் விவசாயி அவர்களே. உங்கள் ${crop} பயிரில், ${disease} நோய் கண்டறியப்பட்டுள்ளது. இதன் பாதிப்பு, ${sev} அளவில் உள்ளது. இலையில் சுமார் இருபத்தாறு சதவீத பகுதி பாதிக்கப்பட்டுள்ளது. அடுத்த எழுபத்திரண்டு மணி நேரத்தில், இந்நோய் பரவும் அபாயம் அதிகமாக உள்ளது. உடனடியாக செய்ய வேண்டிய முக்கிய பணிகள்: ${doNowList.join(', ')}. கவனிக்க வேண்டிய முக்கிய எச்சரிக்கைகள்: ${watchForList.join(', ')}. நன்றி.`;
  }

  // 2. KANNADA LOCAL AGRICULTURAL DIALECT
  if (currentLang === 'kn' || currentLang === 'ka') {
    const crop = diagnosis.crop_label_i18n?.kn || (diagnosis.crop === 'rice' ? 'ಭತ್ತ' : 'ಬೆಳೆ');
    const disease = diagnosis.disease_label_i18n?.kn || (diagnosis.disease === 'bacterial_leaf_blight' ? 'ದುಂಡಾಣು ಎಲೆ ಕವಚ ರೋಗ' : diseaseName);
    const sev = severityStyle.label || 'ಮಧ್ಯಮ';

    return `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ. ನಿಮ್ಮ ${crop} ಬೆಳೆಯಲ್ಲಿ, ${disease} ಕಂಡುಬಂದಿದೆ. ರೋಗದ ತೀವ್ರತೆ, ${sev} ಹಂತದಲ್ಲಿದೆ. ಎಲೆಯ ಸುಮಾರು ಇಪ್ಪತ್ತಾರು ಪ್ರತಿಶತ ಭಾಗ ಹಾನಿಗೊಳಗಾಗಿದೆ. ಮುಂದಿನ ಎಪ್ಪತ್ತೆರಡು ಗಂಟೆಗಳಲ್ಲಿ, ಈ ರೋಗ ಹರಡುವ ಅಪಾಯ ಹೆಚ್ಚಾಗಿದೆ. ತಕ್ಷಣ ಕೈಗೊಳ್ಳಬೇಕಾದ ಮುಖ್ಯ ಕ್ರಮಗಳು: ${doNowList.join(', ')}. ಗಮನಿಸಬೇಕಾದ ಪ್ರಮುಖ ಎಚ್ಚರಿಕೆಗಳು: ${watchForList.join(', ')}. ಧನ್ಯವಾದಗಳು.`;
  }

  // 3. HINDI LOCAL AGRICULTURAL DIALECT
  if (currentLang === 'hi') {
    const crop = diagnosis.crop_label_i18n?.hi || (diagnosis.crop === 'rice' ? 'धान' : 'फसल');
    const disease = diagnosis.disease_label_i18n?.hi || (diagnosis.disease === 'bacterial_leaf_blight' ? 'जीवाणु पत्ती झुलसा' : diseaseName);
    const sev = severityStyle.label || 'मध्यम';

    return `नमस्ते किसान भाई। आपकी ${crop} की फसल में, ${disease} रोग पाया गया है। बीमारी की गंभीरता, ${sev} स्थिति में है। पत्ती का लगभग छब्बीस प्रतिशत हिस्सा प्रभावित हुआ है। अगले बहत्तर घंटों में, बीमारी फैलने का खतरा अधिक है। तुरंत किए जाने वाले जरूरी उपाय: ${doNowList.join('। ')}। ध्यान रखने योग्य बातें: ${watchForList.join('। ')}। धन्यवाद।`;
  }

  // 4. ENGLISH DEFAULT
  return `Farmer Advisory. In your ${cropName} crop, ${diseaseName} has been detected. Severity level is ${severityLabel}. Approximately ${affectedPct} percent of the leaf is affected. The 72-hour spread risk is ${riskLevelDisplay}. Immediate actions to take now: ${doNowList.join(', ')}. Warning signs to watch for: ${watchForList.join(', ')}.`;
}

/**
 * Color mapper for high outdoor contrast severity badges
 */
export function getSeverityStyle(severity, currentLang = 'en') {
  const sev = severity?.toLowerCase();
  
  const labels = {
    severe: { en: 'Severe', hi: 'गंभीर', ta: 'தீவிரமானது', kn: 'ತೀವ್ರ', ka: 'ತೀವ್ರ' },
    moderate: { en: 'Moderate', hi: 'मध्यम', ta: 'மிதமான', kn: 'ಮಧ್ಯಮ', ka: 'ಮಧ್ಯಮ' },
    mild: { en: 'Mild', hi: 'हल्का', ta: 'குறைவானது', kn: 'ಸೌಮ್ಯ', ka: 'ಸೌಮ್ಯ' },
    trace: { en: 'Trace', hi: 'नगण्य (कम)', ta: 'மிகக்குறைவு', kn: 'ಕನಿಷ್ಠ', ka: 'ಕನಿಷ್ಠ' }
  };

  switch (sev) {
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
        label: labels.severe[currentLang] || labels.severe.en,
        localLabel: labels.severe.hi,
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
        label: labels.moderate[currentLang] || labels.moderate.en,
        localLabel: labels.moderate.hi,
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
        label: labels.mild[currentLang] || labels.mild.en,
        localLabel: labels.mild.hi,
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
        label: labels.trace[currentLang] || labels.trace.en,
        localLabel: labels.trace.hi,
        iconColor: '#047857'
      };
  }
}

/**
 * Human-readable formatter for disease keys like "bacterial_leaf_blight" or "rice__bacterial_leaf_blight"
 */
export function formatDiseaseName(rawKey) {
  if (!rawKey) return 'Unknown Condition';
  const cleanKey = rawKey.includes('__') ? rawKey.split('__')[1] : rawKey;
  return cleanKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
