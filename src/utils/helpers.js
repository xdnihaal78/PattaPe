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
export function getSeverityStyle(severity, currentLang = 'en') {
  const sev = severity?.toLowerCase();
  
  const labels = {
    severe: { en: 'Severe', hi: 'गंभीर', ta: 'தீவிரமானது', kn: 'ತೀವ್ರ' },
    moderate: { en: 'Moderate', hi: 'मध्यम', ta: 'மிதமானது', kn: 'ಮಧ್ಯಮ' },
    mild: { en: 'Mild', hi: 'हल्का', ta: 'குறைவானது', kn: 'ಸೌಮ್ಯ' },
    trace: { en: 'Trace', hi: 'नगण्य (कम)', ta: 'மிகக்குறைவு', kn: 'ಕನಿಷ್ಠ' }
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
