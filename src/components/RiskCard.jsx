import React from 'react';
import { CloudRain, Thermometer, Wind, AlertCircle } from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

export default function RiskCard({ weatherRisk, currentLang }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (!weatherRisk) return null;

  return (
    <div className="bg-amber-50 rounded-3xl p-5 border-4 border-amber-400 shadow-xl space-y-3">
      
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow">
            <CloudRain className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-950 m-0 leading-tight">
              {t.weatherRisk}
            </h3>
            <span className="text-xs font-bold text-amber-800">72-Hour Weather Forecast</span>
          </div>
        </div>

        <span className="bg-red-600 text-white text-sm font-black px-3 py-1.5 rounded-xl border-2 border-red-700 shadow">
          {weatherRisk.level}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        
        {/* Humidity Box */}
        <div className="bg-white p-3 rounded-2xl border-2 border-amber-300 flex items-center gap-3">
          <CloudRain className="w-7 h-7 text-blue-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-500 block">Humidity (नमी)</span>
            <span className="text-sm font-black text-slate-900 leading-tight block">{weatherRisk.humidity}</span>
          </div>
        </div>

        {/* Temperature Box */}
        <div className="bg-white p-3 rounded-2xl border-2 border-amber-300 flex items-center gap-3">
          <Thermometer className="w-7 h-7 text-orange-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-500 block">Temperature</span>
            <span className="text-sm font-black text-slate-900 leading-tight block">{weatherRisk.tempRange}</span>
          </div>
        </div>

      </div>

      {/* Forecast Alert Text */}
      <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-400 flex items-start gap-2.5">
        <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-base font-extrabold text-amber-950 m-0 leading-snug">
          {currentLang === 'hi' ? weatherRisk.localForecastText : weatherRisk.forecastText}
        </p>
      </div>

    </div>
  );
}
