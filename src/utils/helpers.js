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

  // 1. TAMIL: Prioritize local Natural neural voices (Pallavi, Valluvar, Google தமிழ்)
  if (code.startsWith('ta')) {
    const naturalVoice = voices.find(v => 
      ((v.lang || '').toLowerCase().startsWith('ta') || (v.name || '').toLowerCase().includes('tamil') || (v.name || '').includes('தமிழ்')) &&
      (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
    );
    if (naturalVoice) return naturalVoice;

    return voices.find(v => (v.lang || '').toLowerCase() === 'ta-in' || (v.lang || '').toLowerCase() === 'ta_in')
      || voices.find(v => (v.lang || '').toLowerCase().startsWith('ta'))
      || voices.find(v => (v.name || '').toLowerCase().includes('tamil') || (v.name || '').includes('தமிழ்') || (v.name || '').toLowerCase().includes('pallavi') || (v.name || '').toLowerCase().includes('valluvar'))
      || null;
  }

  // 2. KANNADA: Prioritize local Natural neural voices (Gagan, Sapna, Google ಕನ್ನಡ)
  if (code.startsWith('kn') || code.startsWith('ka')) {
    const naturalVoice = voices.find(v => 
      ((v.lang || '').toLowerCase().startsWith('kn') || (v.lang || '').toLowerCase().startsWith('ka') || (v.name || '').toLowerCase().includes('kannada') || (v.name || '').includes('ಕನ್ನಡ')) &&
      (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
    );
    if (naturalVoice) return naturalVoice;

    return voices.find(v => (v.lang || '').toLowerCase() === 'kn-in' || (v.lang || '').toLowerCase() === 'kn_in' || (v.lang || '').toLowerCase() === 'ka-in')
      || voices.find(v => (v.lang || '').toLowerCase().startsWith('kn') || (v.lang || '').toLowerCase().startsWith('ka'))
      || voices.find(v => (v.name || '').toLowerCase().includes('kannada') || (v.name || '').includes('ಕನ್ನಡ') || (v.name || '').toLowerCase().includes('gagan') || (v.name || '').toLowerCase().includes('sapna'))
      || null;
  }

  // 3. HINDI: Prioritize local Natural voices (Swara, Kalpana, Google हिन्दी)
  if (code.startsWith('hi')) {
    const naturalVoice = voices.find(v => 
      ((v.lang || '').toLowerCase().startsWith('hi') || (v.name || '').toLowerCase().includes('hindi') || (v.name || '').includes('हिन्दी')) &&
      (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
    );
    if (naturalVoice) return naturalVoice;

    return voices.find(v => (v.lang || '').toLowerCase() === 'hi-in' || (v.lang || '').toLowerCase() === 'hi_in')
      || voices.find(v => (v.lang || '').toLowerCase().startsWith('hi'))
      || voices.find(v => (v.name || '').toLowerCase().includes('hindi') || (v.name || '').includes('हिन्दी'))
      || null;
  }

  // 4. ENGLISH: Prioritize Indian English accent (Neerja, Prabhat, Ravi, en-IN)
  const indianEnglishNatural = voices.find(v => 
    (v.lang || '').toLowerCase().includes('in') && 
    (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
  );
  if (indianEnglishNatural) return indianEnglishNatural;

  return voices.find(v => (v.lang || '').toLowerCase() === 'en-in' || (v.lang || '').toLowerCase() === 'en_in')
    || voices.find(v => (v.lang || '').toLowerCase().startsWith('en'))
    || null;
}

export function speakText(text, langCode = 'en', onEndCallback, diagnosis = null) {
  if (!isSpeechSupported()) {
    console.warn('Voice output is not supported on this browser.');
    return;
  }

  // Cancel any ongoing speech
  synth.cancel();

  if (!text && !diagnosis) return;

  const code = (langCode || 'en').toLowerCase();
  const matchedVoice = findBestVoiceForLang(code);
  const hasNativeVoice = Boolean(matchedVoice);

  let textToSpeak = text;

  // If the browser lacks a native Indic voice for Tamil or Kannada,
  // use phonetic transliteration tuned for Indian accent synthesizers
  if (!hasNativeVoice && diagnosis && (code.startsWith('ta') || code.startsWith('kn') || code.startsWith('ka'))) {
    textToSpeak = buildVoiceAdviceScript(diagnosis, code, true);
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);

  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang;
  } else {
    // If no native voice, use authentic Indian English voice for natural South Asian cadence
    const allVoices = getVoicesList();
    const indianVoice = allVoices.find(v => 
      ((v.lang || '').toLowerCase().includes('in') || (v.name || '').toLowerCase().includes('india')) &&
      (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
    ) || allVoices.find(v => 
      (v.lang || '').toLowerCase().includes('in') || 
      (v.name || '').toLowerCase().includes('india') ||
      (v.lang || '').toLowerCase().startsWith('en')
    );

    if (indianVoice) {
      utterance.voice = indianVoice;
      utterance.lang = indianVoice.lang;
    } else {
      utterance.lang = code.startsWith('ta') ? 'ta-IN' : (code.startsWith('kn') || code.startsWith('ka')) ? 'kn-IN' : 'en-IN';
    }
  }

  // Tuned parameters for warm, natural local agricultural cadence
  if (code.startsWith('ta') || code.startsWith('kn') || code.startsWith('ka')) {
    utterance.rate = 0.83; // Steady, respectful, unhurried local rhythm
    utterance.pitch = 0.94; // Warm, natural chest tone
  } else if (code.startsWith('hi')) {
    utterance.rate = 0.85;
    utterance.pitch = 0.96;
  } else {
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
  }

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e.error);
      onEndCallback();
    };
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
 * Phrased in authentic local agricultural dialect with natural pauses.
 */
export function buildVoiceAdviceScript(diagnosis, currentLang = 'en', phonetic = false) {
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
      'வயலில் தேங்கியுள்ள தண்ணீரை உடனே வடித்து விடுங்கள்',
      'ஈரம் இருக்கும்போது வயலில் வேலை செய்யாதீர்கள்',
      'பாதிக்கப்பட்ட செடிகளை தொட்ட கருவிகளை சுத்தம் செய்யாமல் அடுத்த வயலுக்கு கொண்டு செல்ல வேண்டாம்'
    ],
    kn: [
      'ಹೊಲದಲ್ಲಿ ನಿಂತಿರುವ ಹೆಚ್ಚುವರಿ ನೀರನ್ನು ಕೂಡಲೇ ಹೊರಹಾಕಿ',
      'ತೇವಾಂಶ ಹೆಚ್ಚಿದ್ದಾಗ ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡಬೇಡಿ',
      'ರೋಗ ತಗುಲಿದ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸದೆ ಬೇರೆ ಹೊಲದಲ್ಲಿ ಬಳಸಬೇಡಿ'
    ],
    ka: [
      'ಹೊಲದಲ್ಲಿ ನಿಂತಿರುವ ಹೆಚ್ಚುವರಿ ನೀರನ್ನು ಕೂಡಲೇ ಹೊರಹಾಕಿ',
      'ತೇವಾಂಶ ಹೆಚ್ಚಿದ್ದಾಗ ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡಬೇಡಿ',
      'ರೋಗ ತಗುಲಿದ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸದೆ ಬೇರೆ ಹೊಲದಲ್ಲಿ ಬಳಸಬೇಡಿ'
    ]
  };

  const localizedWatchForMap = {
    hi: [
      'पत्तियों पर घाव का तेजी से बढ़ना',
      'आसपास के स्वस्थ पत्तों का पीला पड़ना'
    ],
    ta: [
      'இலை ஓரங்களில் சேதம் வேகமாக பரவுகிறதா என்று கவனியுங்கள்',
      'பக்கத்து இலைகள் மஞ்சள் நிறமாக மாறுகிறதா என்று பாருங்கள்'
    ],
    kn: [
      'ಎಲೆಗಳ ಅಂಚುಗಳು ವೇಗವಾಗಿ ಒಣಗುತ್ತಿವೆಯೇ ಎಂದು ನಿಗಾವಹಿಸಿ',
      'ಹತ್ತಿರದ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆಯೇ ಎಂದು ಗಮನಿಸಿ'
    ],
    ka: [
      'ಎಲೆಗಳ ಅಂಚುಗಳು ವೇಗವಾಗಿ ಒಣಗುತ್ತಿವೆಯೇ ಎಂದು ನಿಗಾವಹಿಸಿ',
      'ಹತ್ತಿರದ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆಯೇ ಎಂದು ಗಮನಿಸಿ'
    ]
  };

  const doNowList = (localizedDoNowMap[currentLang] || diagnosis.advisory?.do_now || []).slice(0, 3);
  const watchForList = (localizedWatchForMap[currentLang] || diagnosis.advisory?.watch_for || []).slice(0, 2);

  const doNowText = doNowList.join(', ');
  const watchForText = watchForList.join(', ');

  // Spoken number words in Indian languages for natural dialect (prevents robotic English number reading)
  const numberWords = {
    ta: 'இருபத்தாறு',
    kn: 'ಇಪ್ಪತ್ತಾರು',
    hi: 'छब्बीस'
  };

  if (currentLang === 'hi') {
    if (phonetic) {
      return `Kisan bhai, fasal mein beemari ka naam hai, ${diseaseName}. Beemari ki gambheerata, ${severityLabel} sthiti mein hai. Patti ka chhabbees pratishat hissa, prabhavit paya gaya hai. Agle bahattar ghanton mein, beemari phailne ka jokhim, ${riskLevelDisplay} hai. Turant karne yogya zaroori salah: ${doNowText}. Khas dhyan rakhne yogya baatein: ${watchForText}.`;
    }
    return `किसान भाई, फसल में बीमारी का नाम है, ${diseaseName}। बीमारी की गंभीरता, ${severityLabel} स्थिति में है। पत्ती का छब्बीस प्रतिशत हिस्सा, प्रभावित पाया गया है। अगले बहत्तर घंटों में, बीमारी फैलने का खतरा, ${riskLevelDisplay} है। तुरंत किए जाने वाले जरूरी उपाय: ${doNowText}। खास ध्यान रखने योग्य बातें: ${watchForText}।`;
  }

  if (currentLang === 'ta') {
    if (phonetic) {
      return `Vivasayi thozhare, payiril kandariya-patta noi peyar, ${diseaseName}. Paadhippin theeviram, ${severityLabel} nilaiyil ulladhu. Ilaiyin ${numberWords.ta} sadhavidham paadhikka-pattulladhu. Adutha yezhuvathi-rendu mani nerathil, noi paravum aabathu, ${riskLevelDisplay} aagavum. Udanaadiyaga seiya vendiya kramangal: ${doNowText}. Neengal kavanikka vendiyavai: ${watchForText}.`;
    }
    return `விவசாய தோழரே, பயிரில் கண்டறியப்பட்ட நோய் பெயர், ${diseaseName}. பாதிப்பின் தீவிரம், ${severityLabel} நிலையில் உள்ளது. இலையின் ${numberWords.ta} சதவீத பகுதி, பாதிக்கப்பட்டுள்ளது. அடுத்த எழுபத்திரண்டு மணி நேரத்தில், நோய் பரவும் ஆபத்து, ${riskLevelDisplay} ஆகும். உடனடியாக செய்ய வேண்டிய முக்கிய நடவடிக்கைகள்: ${doNowText}. நீங்கள் கவனிக்க வேண்டிய எச்சரிக்கைகள்: ${watchForText}.`;
  }

  if (currentLang === 'kn' || currentLang === 'ka') {
    if (phonetic) {
      return `Raitha bandhuve, beleyalli kandu-bandha rogadha hesaru, ${diseaseName}. Rogadha theevrathe, ${severityLabel} hanthadallide. Eleyina ${numberWords.kn} prathishatha bhaaga, haanigolagaagide. Mundina eppatth-eradu ghantegalalli, roga haraduva aapaadha, ${riskLevelDisplay} aagide. Thaksgana kaigollabekadha mukhyavaadha kramagalu: ${doNowText}. Neevu eccharikeyinda nigaavahisabekadha vishayagalu: ${watchForText}.`;
    }
    return `ರೈತ ಬಂಧುವೇ, ಬೆಳೆಯಲ್ಲಿ ಕಂಡುಬಂದ ರೋಗದ ಹೆಸರು, ${diseaseName}. ರೋಗದ ತೀವ್ರತೆ, ${severityLabel} ಹಂತದಲ್ಲಿದೆ. ಎಲೆಯ ${numberWords.kn} ಪ್ರತಿಶತ ಭಾಗ, ಹಾನಿಗೊಳಗಾಗಿದೆ. ಮುಂದಿನ ಎಪ್ಪತ್ತೆರಡು ಗಂಟೆಗಳಲ್ಲಿ, ರೋಗ ಹರಡುವ ಅಪಾಯ, ${riskLevelDisplay} ಆಗಿದೆ. ತಕ್ಷಣ ಕೈಗೊಳ್ಳಬೇಕಾದ ಮುಖ್ಯ ಕ್ರಮಗಳು: ${doNowText}. ನೀವು ಎಚ್ಚರಿಕೆಯಿಂದ ನಿಗಾವಹಿಸಬೇಕಾದ ವಿಷಯಗಳು: ${watchForText}.`;
  }

  // Default: English
  return `Disease name: ${diseaseName}. Severity level: ${severityLabel}. Affected area: ${affectedPct} percent of the leaf is affected. 72-hour risk level: ${riskLevelDisplay}. Immediate actions to take now: ${doNowText}. Warning signs to watch for: ${watchForText}.`;
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
