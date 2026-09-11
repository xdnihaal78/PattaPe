// Helper utilities for PattaPe – AI Crop Doctor

import { 
  LANGUAGES, 
  TRANSLATIONS, 
  getStoredLanguage, 
  setStoredLanguage, 
  getTranslation,
  DEFAULT_LANGUAGE 
} from '../i18n';

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

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText(text, langCode = 'en', onEndCallback) {
  if (!isSpeechSupported()) {
    console.warn('Voice output is not supported on this browser.');
    return;
  }

  // Cancel any ongoing speech
  synth.cancel();

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Strict BCP-47 speech language mapping requested by user
  const langSpeechMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    kn: 'ka-IN',
    ka: 'ka-IN'
  };

  const targetTag = langSpeechMap[langCode] || 'en-IN';
  utterance.lang = targetTag;
  utterance.rate = 0.88; // Accessible, comfortable pace for clarity
  utterance.pitch = 1.0;

  // Search available browser voices to pick the most authentic native voice
  if (synth.getVoices) {
    const voices = synth.getVoices();
    const matchedVoice = voices.find(v => 
      v.lang === targetTag || 
      v.lang === targetTag.replace('-', '_') ||
      (langCode === 'kn' && (v.lang.includes('kn') || v.lang.includes('ka'))) ||
      v.lang.startsWith(langCode)
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

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
 * Constructs full audio advisory script reading aloud:
 * - Disease name
 * - Severity
 * - Affected percentage
 * - 72-hour risk level
 * - Do Now advice
 * - Watch For advice
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
    high: { en: 'High Risk', hi: 'अधिक खतरा', ta: 'அதிக ஆபத்து', kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ', ka: 'ಹೆಚ್ಚಿನ ಅಪಾಯ' },
    moderate: { en: 'Moderate Risk', hi: 'मध्यम खतरा', ta: 'மிதமான ஆபத்து', kn: 'ಮಧ್ಯಮ ಅಪಾಯ', ka: 'ಮಧ್ಯಮ ಅಪಾಯ' },
    low: { en: 'Low Risk', hi: 'कम खतरा', ta: 'குறைந்த ஆபத்து', kn: 'ಕಡಿಮೆ ಅಪಾಯ', ka: 'ಕಡಿಮೆ ಅಪಾಯ' }
  };
  const isHigh = riskLevelRaw.includes('high') || riskLevelRaw.includes('severe');
  const isMod = riskLevelRaw.includes('moderate') || riskLevelRaw.includes('medium');
  const riskKey = isHigh ? 'high' : isMod ? 'moderate' : 'low';
  const riskLevelDisplay = riskLabels[riskKey][currentLang] || riskLabels[riskKey].kn || riskLabels[riskKey].en;

  // Localized Do Now & Watch For items
  const localizedDoNowMap = {
    hi: [
      'गीले खेतों में काम करने से बचें',
      'खेत से खड़े पानी की तुरंत निकासी करें',
      'संक्रमित औजारों को दूसरे खेत में न ले जाएं'
    ],
    ta: [
      'ஈரமான வயல்களில் வேலை செய்வதைத் தவிர்க்கவும்',
      'வயலில் தேங்கியுள்ள தண்ணீரை உடனடியாக வடிகட்டவும்',
      'பயன்படுத்திய கருவிகளை சுத்தப்படுத்தாமல் அடுத்த வயலில் பயன்படுத்த வேண்டாம்'
    ],
    kn: [
      'ತೇವಾಂಶವಿರುವ ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ',
      'ಹೊಲದಲ್ಲಿ ನಿಂತಿರುವ ಹೆಚ್ಚುವರಿ ನೀರನ್ನು ತಕ್ಷಣ ಹೊರಹಾಕಿ',
      'ಸೋಂಕು ತಗುಲಿದ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಹಾಗೆಯೇ ಬಳಸಬೇಡಿ'
    ],
    ka: [
      'ತೇವಾಂಶವಿರುವ ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ',
      'ಹೊಲದಲ್ಲಿ ನಿಂತಿರುವ ಹೆಚ್ಚುವರಿ ನೀರನ್ನು ತಕ್ಷಣ ಹೊರಹಾಕಿ',
      'ಸೋಂಕು ತಗುಲಿದ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಹಾಗೆಯೇ ಬಳಸಬೇಡಿ'
    ]
  };

  const localizedWatchForMap = {
    hi: [
      'पत्तियों पर घाव का तेजी से बढ़ना',
      'आसपास के स्वस्थ पत्तों का पीला पड़ना'
    ],
    ta: [
      'இலைகளில் சேதம் வேகமாக பரவுதல்',
      'அருகிலுள்ள இலைகள் மஞ்சள் நிறமாக மாறுதல்'
    ],
    kn: [
      'ಎಲೆಗಳ ಹಾನಿ ವೇಗವಾಗಿ ಹರಡುವುದು',
      'ಹತ್ತಿರದ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು'
    ],
    ka: [
      'ಎಲೆಗಳ ಹಾನಿ ವೇಗವಾಗಿ ಹರಡುವುದು',
      'ಹತ್ತಿರದ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು'
    ]
  };

  const doNowList = (localizedDoNowMap[currentLang] || diagnosis.advisory?.do_now || []).slice(0, 3);
  const watchForList = (localizedWatchForMap[currentLang] || diagnosis.advisory?.watch_for || []).slice(0, 2);

  const doNowText = doNowList.join('. ');
  const watchForText = watchForList.join('. ');

  if (currentLang === 'hi') {
    return `बीमारी का नाम: ${diseaseName}। बीमारी की गंभीरता: ${severityLabel}। पत्ती का प्रभावित हिस्सा: ${affectedPct} प्रतिशत। 72 घंटे का जोखिम स्तर: ${riskLevelDisplay}। तुरंत करने योग्य सलाह: ${doNowText}। ध्यान देने योग्य सलाह: ${watchForText}।`;
  }

  if (currentLang === 'ta') {
    return `நோய் பெயர்: ${diseaseName}. பாதிப்பு தீவிரம்: ${severityLabel}. பாதிக்கப்பட்ட சதவீதம்: ${affectedPct} சதவீதம். 72 மணி நேர ஆபத்து நிலை: ${riskLevelDisplay}. உடனடியாக செய்ய வேண்டியவை: ${doNowText}. கவனிக்க வேண்டிய எச்சரிக்கைகள்: ${watchForText}.`;
  }

  if (currentLang === 'kn' || currentLang === 'ka') {
    return `ರೋಗದ ಹೆಸರು: ${diseaseName}. ತೀವ್ರತೆಯ ಮಟ್ಟ: ${severityLabel}. ಹಾನಿಗೊಳಗಾದ ಶೇಕಡಾವಾರು: ${affectedPct} ಪ್ರತಿಶತ. 72 ಗಂಟೆಗಳ ಅಪಾಯದ ಮಟ್ಟ: ${riskLevelDisplay}. ತಕ್ಷಣ ಮಾಡಬೇಕಾದ ಕ್ರಮಗಳು: ${doNowText}. ಗಮನಿಸಬೇಕಾದ ಎಚ್ಚರಿಕೆಗಳು: ${watchForText}.`;
  }

  // Default: English
  return `Disease name: ${diseaseName}. Severity: ${severityLabel}. Affected percentage: ${affectedPct} percent. 72-hour risk level: ${riskLevelDisplay}. Do Now advice: ${doNowText}. Watch For advice: ${watchForText}.`;
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
