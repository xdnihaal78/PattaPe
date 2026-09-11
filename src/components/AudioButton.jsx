import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeech, isSpeechSupported, TRANSLATIONS } from '../utils/helpers';

export default function AudioButton({ textToRead, currentLang }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [textToRead]);

  const handleToggleAudio = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(textToRead, currentLang, () => {
        setIsPlaying(false);
      });
    }
  };

  if (!isSpeechSupported()) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggleAudio}
      className={`w-full min-h-[48px] px-4 py-2.5 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 active:scale-98 border-2 ${
        isPlaying
          ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-800 animate-pulse'
          : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
      }`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-5 h-5 text-white stroke-[2.5]" />
          <span>{t.stopAudio || 'Stop Audio'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 text-amber-300 stroke-[2.5]" />
          <span>{t.listenAdvice} 🔊</span>
        </>
      )}
    </button>
  );
}
