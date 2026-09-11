import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function CropCard({ crop, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(crop)}
      aria-pressed={isSelected}
      className={`relative w-full btn-touch min-h-[72px] sm:min-h-[80px] p-4 rounded-2xl transition-all text-left flex items-center justify-between shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-400 active:scale-[0.98] ${
        isSelected
          ? 'bg-emerald-50 border-3 border-emerald-600 text-emerald-950 shadow-md ring-2 ring-emerald-500'
          : 'bg-white border-2 border-slate-300 hover:border-emerald-500 text-slate-900 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Crop Icon / Emoji Container */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-3xl sm:text-4xl shadow-inner border-2 shrink-0 ${
            isSelected
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          {crop.icon}
        </div>

        {/* Crop Name */}
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight">
            {crop.name}
          </h3>
          <p className="text-sm sm:text-base font-extrabold text-emerald-800 m-0 mt-0.5">
            {crop.localName}
          </p>
        </div>
      </div>

      {/* Selected Indicator Checkmark */}
      <div className="ml-3 shrink-0">
        {isSelected ? (
          <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600 fill-emerald-100 stroke-[3]" />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-slate-300 bg-slate-50" />
        )}
      </div>
    </button>
  );
}
