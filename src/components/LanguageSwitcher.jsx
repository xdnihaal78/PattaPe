import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES, setStoredLanguage } from '../utils/helpers';

/**
 * LanguageSwitcher Component
 * Features:
 * - Clean, high-contrast trigger button with Globe icon & Chevron
 * - Supported languages: English, हिन्दी, தமிழ், ಕನ್ನಡ
 * - Easy to tap on mobile (minimum 44-48px touch target)
 * - Safe typography: does not clip or break with Indian scripts
 * - Persists choice to localStorage
 */
export default function LanguageSwitcher({ currentLang, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    setStoredLanguage(code);
    if (onLanguageChange) {
      onLanguageChange(code);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[40px] px-2.5 sm:px-3 py-1.5 bg-emerald-800/90 hover:bg-emerald-750 active:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 sm:gap-2 border border-emerald-500/80 shadow-xs transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label="Change Language / भाषा बदलें"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-emerald-300 shrink-0" />
        <span className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap">
          {selectedLangObj.label}
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-emerald-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1.5 w-60 sm:w-64 rounded-2xl shadow-xl bg-white border border-slate-200 ring-1 ring-black/5 z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
            <span>Select Language</span>
            <span>भाषा चुनें</span>
          </div>

          <div className="py-0.5 space-y-1">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left min-h-[44px] px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-black border border-emerald-300 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight text-slate-900">
                      {lang.nativeLabel || lang.label}
                    </span>
                    {lang.code !== 'en' && (
                      <span className="text-[11px] font-semibold text-slate-500 leading-tight">
                        {lang.label}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
