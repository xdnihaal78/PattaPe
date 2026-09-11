import translationsData from '../locales/i18n.json';

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', speechLang: 'en-IN' },
  { code: 'hi', label: 'हिन्दी', nativeLabel: 'हिन्दी (Hindi)', speechLang: 'hi-IN' },
  { code: 'ta', label: 'தமிழ்', nativeLabel: 'தமிழ் (Tamil)', speechLang: 'ta-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ', nativeLabel: 'ಕನ್ನಡ (Kannada)', speechLang: 'ka-IN' }
];

export const DEFAULT_LANGUAGE = 'en';

if (translationsData && translationsData.kn && !translationsData.ka) {
  translationsData.ka = translationsData.kn;
}

export const TRANSLATIONS = translationsData;

const STORAGE_KEY = 'pattape_language';

/**
 * Get the persisted language from localStorage or fallback to DEFAULT_LANGUAGE
 */
export function getStoredLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
  } catch (e) {
    console.warn('Could not read language from localStorage:', e);
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Persist the chosen language code to localStorage
 */
export function setStoredLanguage(langCode) {
  try {
    if (LANGUAGES.some(l => l.code === langCode)) {
      localStorage.setItem(STORAGE_KEY, langCode);
    }
  } catch (e) {
    console.warn('Could not save language to localStorage:', e);
  }
}

/**
 * Safely get translation dictionary for given language code with fallback to English
 */
export function getTranslation(langCode = DEFAULT_LANGUAGE) {
  return TRANSLATIONS[langCode] || TRANSLATIONS[DEFAULT_LANGUAGE] || {};
}
