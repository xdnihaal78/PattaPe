import React, { useState, useEffect } from 'react';
import { Volume2, Square, VolumeX } from 'lucide-react';
import { speakText, stopSpeech, isSpeechSupported, TRANSLATIONS } from '../utils/helpers';

export default function AudioButton({ textToRead, currentLang = 'en', diagnosis = null }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Cleanup speech synthesis on unmount, page hide, or beforeunload
  useEffect(() => {
    const handleLeave = () => {
      stopSpeech();
    };

    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('pagehide', handleLeave);

    return () => {
      stopSpeech();
      window.removeEventListener('beforeunload', handleLeave);
      window.removeEventListener('pagehide', handleLeave);
    };
  }, []);

  // Stop speech if language or diagnosis script changes while speaking
  useEffect(() => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    }
  }, [textToRead, currentLang]);

  const handleToggleAudio = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(textToRead, currentLang, () => {
        setIsPlaying(false);
      }, diagnosis);
    }
  };

  if (!isSpeechSupported()) {
    return null;
  }

  // Localized subtitles and titles for diverse farmers
  const localizedSubtitles = {
    hi: isPlaying ? 'बोलना बंद करें' : 'सलाह सुनें (Audio Advice)',
    ta: isPlaying ? 'நிறுத்தவும்' : 'ஆலோசனை கேட்கவும் (Audio Advice)',
    kn: isPlaying ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'ಸಲಹೆ ಆಲಿಸಿ (Audio Advice)',
    ka: isPlaying ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'ಸಲಹೆ ಆಲಿಸಿ (Audio Advice)',
    en: isPlaying ? 'Tap to pause narration' : 'Audio narration for farmers'
  };

  const localizedTitles = {
    hi: isPlaying ? 'Stop Speaking' : 'Listen to Advice',
    ta: isPlaying ? 'Stop Speaking' : 'Listen to Advice',
    kn: isPlaying ? 'Stop Speaking' : 'Listen to Advice',
    ka: isPlaying ? 'Stop Speaking' : 'Listen to Advice',
    en: isPlaying ? 'Stop Speaking' : 'Listen to Advice'
  };

  const secondaryLabel = localizedSubtitles[currentLang] || localizedSubtitles.en;
  const primaryTitle = localizedTitles[currentLang] || localizedTitles.en;

  const currentBadge = currentLang === 'hi' 
    ? 'hi-IN' 
    : currentLang === 'ta' 
    ? 'ta-IN' 
    : (currentLang === 'kn' || currentLang === 'ka') 
    ? 'ka-IN' 
    : 'en-IN';

  return (
    <div className="w-full">
      <button
        type="button"
        id="btn-listen-advice"
        onClick={handleToggleAudio}
        aria-label={isPlaying ? 'Stop Speaking advice' : 'Listen to Advice aloud'}
        aria-pressed={isPlaying}
        className={`w-full min-h-[56px] px-5 py-3.5 rounded-2xl flex items-center justify-between transition-all duration-200 shadow-md active:scale-98 focus:outline-none focus:ring-4 border-2 ${
          isPlaying
            ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white border-amber-800 focus:ring-amber-300 ring-2 ring-amber-300 ring-offset-1'
            : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border-emerald-900 focus:ring-emerald-300'
        }`}
      >
        {/* Left icon with accessible pulse indicator */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isPlaying ? 'bg-amber-800/60 text-white' : 'bg-emerald-900/50 text-amber-300'
          }`}>
            {isPlaying ? (
              <Square className="w-5 h-5 fill-current stroke-[2.5]" />
            ) : (
              <Volume2 className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>

          <div className="text-left flex flex-col justify-center">
            <span className="font-black text-base sm:text-lg leading-tight tracking-tight flex items-center gap-2">
              <span>{primaryTitle}</span>
              {currentLang === 'ta' && !isPlaying && (
                <span className="text-xs bg-emerald-800/90 text-emerald-200 px-2 py-0.5 rounded-md font-bold">தமிழ்</span>
              )}
              {(currentLang === 'kn' || currentLang === 'ka') && !isPlaying && (
                <span className="text-xs bg-emerald-800/90 text-emerald-200 px-2 py-0.5 rounded-md font-bold">ಕನ್ನಡ</span>
              )}
            </span>
            <span className="text-xs font-semibold opacity-90 leading-tight">
              {secondaryLabel}
            </span>
          </div>
        </div>

        {/* Right audio wave status indicator */}
        <div className="flex items-center gap-1.5 pl-2">
          {isPlaying ? (
            <div className="flex items-end gap-1 h-5 px-1">
              <span className="w-1 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-4" />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_0.2s_infinite] h-5" />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.9s_ease-in-out_0.4s_infinite] h-3" />
              <span className="w-1 bg-white rounded-full animate-[bounce_0.7s_ease-in-out_0.1s_infinite] h-5" />
            </div>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-800/80 text-emerald-100 border border-emerald-600/60 tracking-wider uppercase">
              {currentBadge}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
