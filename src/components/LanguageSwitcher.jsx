import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { LANGUAGES } from '../utils/helpers';

export default function LanguageSwitcher({ currentLang, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-touch px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-2 border-2 border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-400"
        aria-label="Change Language"
      >
        <Globe className="w-6 h-6 text-emerald-200" />
        <span className="text-sm sm:text-base font-extrabold">{selectedLangObj.label.split(' ')[0]}</span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl bg-white border-2 border-emerald-600 ring-1 ring-black ring-opacity-5 z-50 p-2">
          <div className="text-xs font-black text-slate-500 uppercase tracking-wider px-3 py-1 mb-1 border-b border-slate-150">
            Select Language / भाषा चुनें
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left btn-touch px-4 py-3 rounded-xl font-bold flex items-center justify-between transition-colors ${
                currentLang === lang.code
                  ? 'bg-emerald-150 text-emerald-950 font-black border-2 border-emerald-600'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span className="text-base">{lang.label}</span>
              {currentLang === lang.code && (
                <Check className="w-6 h-6 text-emerald-700 font-extrabold" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
