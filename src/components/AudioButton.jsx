import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio } from 'lucide-react';
import { speakText, stopSpeech, isSpeechSupported, TRANSLATIONS } from '../utils/helpers';

export default function AudioButton({ textToRead, currentLang }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  useEffect(() => {
    // Stop speech when component unmounts or text changes
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
      className={`w-full btn-touch min-h-[64px] px-5 py-4 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-400 active:scale-95 ${
        isPlaying
          ? 'bg-amber-600 hover:bg-amber-700 text-white border-4 border-amber-800 animate-pulse'
          : 'bg-emerald-700 hover:bg-emerald-800 text-white border-4 border-emerald-900'
      }`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-8 h-8 text-white stroke-[2.5]" />
          <span>{t.stopAudio} (आवाज रोकें)</span>
        </>
      ) : (
        <>
          <Volume2 className="w-8 h-8 text-amber-300 stroke-[2.5]" />
          <span>{t.listenAdvice} 🔊</span>
        </>
      )}
    </button>
  );
}
