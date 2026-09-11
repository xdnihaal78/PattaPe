import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function CropCard({ crop, isSelected, onSelect, currentLang = 'en' }) {
  const primaryName = crop.names_i18n?.[currentLang] || crop.name;
  const secondaryName = currentLang !== 'en' ? crop.name : (crop.localName?.split(' ')[0] || '');

  return (
    <button
      type="button"
      onClick={() => onSelect(crop)}
      aria-pressed={isSelected}
      className={`relative w-full min-h-[58px] sm:min-h-[64px] p-3 sm:p-3.5 rounded-2xl transition-all text-left flex items-center justify-between shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-[0.98] ${
        isSelected
          ? 'bg-emerald-50/90 border-2 border-emerald-600 text-emerald-950 shadow-sm'
          : 'bg-white border border-slate-200 hover:border-emerald-400 text-slate-900 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Crop Icon / Emoji Container */}
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shadow-xs border shrink-0 ${
            isSelected
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          {crop.icon}
        </div>

        {/* Crop Name */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 m-0 leading-tight">
            {primaryName}
          </h3>
          {secondaryName && (
            <p className="text-xs font-bold text-emerald-800 m-0 mt-0.5">
              {secondaryName}
            </p>
          )}
        </div>
      </div>

      {/* Selected Indicator Checkmark */}
      <div className="ml-2 shrink-0">
        {isSelected ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100 stroke-[2.5]" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-slate-50" />
        )}
      </div>
    </button>
  );
}
