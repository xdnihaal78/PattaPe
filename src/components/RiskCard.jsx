import React from 'react';
import { CloudRain, AlertTriangle, Info } from 'lucide-react';

/**
 * RiskCard Component
 * Displays:
 * - Title: "72-Hour Spread Risk"
 * - risk_72h.level
 * - Human-friendly explanations for risk_72h.reasons
 * Scaled to balanced, clean, non-oversized dimensions.
 */
export default function RiskCard({ risk72h, weatherRisk, currentLang = 'en' }) {
  const risk = risk72h || weatherRisk;
  if (!risk) return null;

  const level = (risk.level || 'Moderate').toLowerCase();

  // Severity styling
  const isHighOrCritical = level.includes('high') || level.includes('critical') || level.includes('severe');
  const isModerate = level.includes('moderate') || level.includes('medium');

  const badgeStyle = isHighOrCritical
    ? 'bg-red-600 border-red-700 text-white'
    : isModerate
    ? 'bg-amber-600 border-amber-700 text-white'
    : 'bg-emerald-600 border-emerald-700 text-white';

  const levelDisplay = isHighOrCritical ? 'High Risk' : isModerate ? 'Moderate Risk' : 'Low Risk';
  const levelDisplayLocal = isHighOrCritical ? 'अधिक खतरा' : isModerate ? 'मध्यम खतरा' : 'कम खतरा';

  const formatReason = (token) => {
    if (!token || typeof token !== 'string') return '';

    const humidityMatch = token.match(/humidity_(\d+)pct/i);
    if (humidityMatch) {
      return currentLang === 'hi'
        ? `अधिक नमी (${humidityMatch[1]}%)`
        : `High humidity (${humidityMatch[1]}%)`;
    }

    const rainfallMatch = token.match(/rainfall(?:_forecast)?_(\d+)mm/i);
    if (rainfallMatch) {
      return currentLang === 'hi'
        ? `बारिश का अनुमान (${rainfallMatch[1]} मिमी)`
        : `Rainfall expected (${rainfallMatch[1]} mm)`;
    }

    const tempMatch = token.match(/temp(?:erature)?_(\d+)(?:c)?/i);
    if (tempMatch) {
      return currentLang === 'hi'
        ? `तापमान अनुकूल (${tempMatch[1]}°C)`
        : `Favorable temperature (${tempMatch[1]}°C)`;
    }

    if (token.toLowerCase().includes('susceptible_stage')) {
      return currentLang === 'hi'
        ? 'फसल अभी बीमारी के प्रति संवेदनशील विकास अवस्था में है'
        : 'Crop is in a susceptible growth stage';
    }

    if (token.toLowerCase().includes('dense_canopy')) {
      return currentLang === 'hi'
        ? 'घने पौधे होने से हवा और धूप का प्रवाह कम है'
        : 'Dense crop canopy restricting airflow';
    }

    if (token.toLowerCase().includes('waterlogging') || token.toLowerCase().includes('standing_water')) {
      return currentLang === 'hi'
        ? 'खेत में पानी जमा होने से जीवाणु फैलाव का खतरा'
        : 'Field standing water increasing infection risk';
    }

    return token
      .replace(/_/g, ' ')
      .replace(/pct/gi, '%')
      .replace(/(\d+)\s*mm/gi, '$1 mm')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const reasonsList = Array.isArray(risk.reasons) ? risk.reasons : [];

  return (
    <div className="bg-amber-50/70 rounded-2xl p-4 sm:p-5 border border-amber-300 shadow-sm space-y-3">
      
      {/* Title Header */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
            <CloudRain className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-amber-950 m-0 leading-tight">
              72-Hour Spread Risk
            </h2>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-800 block">
              {currentLang === 'hi' ? 'मौसम आधारित फैलाव पूर्वानुमान' : 'Weather & Spread Forecast'}
            </span>
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className={`px-2.5 py-1 rounded-lg border font-black text-xs uppercase shadow-xs shrink-0 ${badgeStyle}`}>
          <span>{levelDisplay}</span>
          <span className="block text-[9px] font-semibold opacity-90 lowercase leading-none">({levelDisplayLocal})</span>
        </div>
      </div>

      {/* Human-Friendly Explanations for Reasons */}
      {reasonsList.length > 0 ? (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
            Environmental Risk Triggers
          </span>
          <div className="space-y-1.5">
            {reasonsList.map((reasonToken, idx) => {
              const friendlyText = formatReason(reasonToken);
              return (
                <div 
                  key={idx} 
                  className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-xs flex items-center gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs sm:text-sm font-bold text-slate-800 m-0 leading-tight">
                    {friendlyText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-semibold text-slate-700 m-0 leading-snug">
            {currentLang === 'hi' && risk.localForecastText ? risk.localForecastText : (risk.forecastText || 'Normal weather conditions projected.')}
          </p>
        </div>
      )}

      {/* Weather metrics summary row */}
      {(risk.humidity || risk.tempRange) && (
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {risk.humidity && (
            <div className="bg-white/90 p-2 rounded-lg border border-amber-200/80 text-[11px] font-semibold text-slate-700">
              <span className="block text-slate-400 text-[10px]">Air Moisture</span>
              <span className="font-bold text-slate-900 text-xs">{risk.humidity}</span>
            </div>
          )}
          {risk.tempRange && (
            <div className="bg-white/90 p-2 rounded-lg border border-amber-200/80 text-[11px] font-semibold text-slate-700">
              <span className="block text-slate-400 text-[10px]">Temperature</span>
              <span className="font-bold text-slate-900 text-xs">{risk.tempRange}</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
