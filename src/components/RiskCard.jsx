import React from 'react';
import { CloudRain, AlertTriangle, Info } from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

/**
 * RiskCard Component
 * Displays:
 * - Title: "72-Hour Spread Risk"
 * - risk_72h.level
 * - Human-friendly explanations for risk_72h.reasons
 * Full multi-language support (en, hi, ta, kn).
 */
export default function RiskCard({ risk72h, weatherRisk, currentLang = 'en' }) {
  const risk = risk72h || weatherRisk;
  if (!risk) return null;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const level = (risk.level || 'Moderate').toLowerCase();

  const isHighOrCritical = level.includes('high') || level.includes('critical') || level.includes('severe');
  const isModerate = level.includes('moderate') || level.includes('medium');

  const badgeStyle = isHighOrCritical
    ? 'bg-red-600 border-red-700 text-white'
    : isModerate
    ? 'bg-amber-600 border-amber-700 text-white'
    : 'bg-emerald-600 border-emerald-700 text-white';

  const levelDisplay = isHighOrCritical 
    ? (t.highRisk || 'High Risk') 
    : isModerate 
    ? (t.moderateRisk || 'Moderate Risk') 
    : (t.lowRisk || 'Low Risk');

  const formatReason = (token) => {
    if (!token || typeof token !== 'string') return '';

    const humidityMatch = token.match(/humidity_(\d+)pct/i);
    if (humidityMatch) {
      const val = humidityMatch[1];
      if (currentLang === 'hi') return `अधिक नमी (${val}%) — रोगाणु बीजाणुओं के लिए अनुकूल`;
      if (currentLang === 'ta') return `அதிக ஈரப்பதம் (${val}%) — பூஞ்சை வித்துகள் வேகமாக பரவும்`;
      if (currentLang === 'kn') return `ಹೆಚ್ಚಿನ ತೇವಾಂಶ (${val}%) — ರೋಗಾಣು ಹರಡುವಿಕೆಗೆ ಅನುಕೂಲಕರ`;
      return `High relative humidity (${val}%) accelerating spore spread`;
    }

    const rainfallMatch = token.match(/rainfall(?:_forecast)?_(\d+)mm/i);
    if (rainfallMatch) {
      const val = rainfallMatch[1];
      if (currentLang === 'hi') return `बारिश का अनुमान (${val} मिमी) — पत्तियों पर पानी जमा होने से फैलाव संभव`;
      if (currentLang === 'ta') return `மழை பெய்ய வாய்ப்பு (${val} மி.மீ) — நீர் தேங்குவதால் நோய் தீவிரம் அடையும்`;
      if (currentLang === 'kn') return `ಮಳೆಯ ಮುನ್ಸೂಚನೆ (${val} ಮಿ.ಮೀ) — ಎಲೆಗಳ ಮೇಲೆ ನೀರು ನಿಲ್ಲುವುದರಿಂದ ಹರಡಬಹುದು`;
      return `Forecast showers (${val} mm) providing moisture for bacterial entry`;
    }

    const tempMatch = token.match(/temp(?:erature)?_(\d+)(?:c)?/i);
    if (tempMatch) {
      const val = tempMatch[1];
      if (currentLang === 'hi') return `अनुकूल तापमान (${val}°C)`;
      if (currentLang === 'ta') return `சாதகமான வெப்பநிலை (${val}°C)`;
      if (currentLang === 'kn') return `ಅನುಕೂಲಕರ ತಾಪಮಾನ (${val}°C)`;
      return `Optimal incubation temperature (${val}°C)`;
    }

    if (token.toLowerCase().includes('susceptible_stage')) {
      if (currentLang === 'hi') return 'फसल अभी बीमारी के प्रति संवेदनशील विकास अवस्था में है';
      if (currentLang === 'ta') return 'பயிர் நோய் தாக்கத்திற்கு எளிதில் உள்ளாகும் வளர்ச்சி நிலையில் உள்ளது';
      if (currentLang === 'kn') return 'ಬೆಳೆಯು ರೋಗ ತುತ್ತಾಗುವ ಸೂಕ್ಷ್ಮ ಬೆಳವಣಿಗೆಯ ಹಂತದಲ್ಲಿದೆ';
      return 'Crop is currently in a highly susceptible vegetative/tillering stage';
    }

    if (token.toLowerCase().includes('high_severity_present')) {
      if (currentLang === 'hi') return 'खेत में पहले से मौजूद सक्रिय घाव नए पत्तों को संक्रमित कर रहे हैं';
      if (currentLang === 'ta') return 'ஏற்கனவே உள்ள தீவிர புண்கள் புதிய இலைகளுக்கு பரவுகின்றன';
      if (currentLang === 'kn') return 'ಈಗಾಗಲೇ ಇರುವ ತೀವ್ರ ಹಾನಿಯು ಹೊಸ ಎಲೆಗಳಿಗೆ ಹರಡುತ್ತಿದೆ';
      return 'Existing active lesions serving as rapid inoculum source';
    }

    // Default formatting
    return token.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getRecommendation = () => {
    if (isHighOrCritical) {
      return t.weatherAdvisoryHigh || 'Fungicide/bactericide spray recommended within 24h before forecast showers.';
    }
    if (isModerate) {
      return t.weatherAdvisoryMod || 'Monitor field twice daily; hold off on overhead irrigation until conditions dry.';
    }
    return t.weatherAdvisoryLow || 'Weather conditions are unfavorable for rapid spore propagation. Continue regular inspection.';
  };

  const reasons = risk.reasons || [];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-200/60">
            <CloudRain className="w-4 h-4 text-blue-700 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 m-0 leading-tight">
              {t.weatherRisk || '72-Hour Spread Risk'}
            </h2>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
              {t.spreadRiskSub || 'Agrometeorological Disease Propagation'}
            </span>
          </div>
        </div>

        <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border shadow-xs ${badgeStyle}`}>
          {levelDisplay}
        </span>
      </div>

      {/* Explanatory Reasons List */}
      {reasons.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
            {t.riskFactors || 'Environmental Risk Factors Detected:'}
          </span>
          <ul className="space-y-1.5 m-0 p-0 list-none">
            {reasons.map((token, idx) => (
              <li 
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-800 flex items-start gap-2 leading-snug"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>{formatReason(token)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weather Action Advisory Note */}
      <div className="bg-blue-50/70 p-2.5 sm:p-3 rounded-xl border border-blue-200/80 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-semibold text-blue-950 m-0 leading-snug">
          {getRecommendation()}
        </p>
      </div>

    </div>
  );
}
