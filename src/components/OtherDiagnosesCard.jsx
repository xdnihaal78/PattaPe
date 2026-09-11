import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

/**
 * OtherDiagnosesCard Component
 * Displays remaining candidate diseases from top3 prediction array.
 * Full multi-language support (en, hi, ta, kn).
 */
export default function OtherDiagnosesCard({ top3, mainDisease, currentLang = 'en' }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (!Array.isArray(top3) || top3.length <= 1) {
    return null;
  }

  // Filter out the primary diagnosis (index 0 or matching mainDisease)
  const otherPredictions = top3.filter((item, idx) => {
    if (idx === 0) return false;
    if (mainDisease && item.disease === mainDisease) return false;
    return true;
  });

  if (otherPredictions.length === 0) {
    return null;
  }

  // Common crop disease name mappings (English, Hindi, Tamil, Kannada)
  const diseaseNameMap = {
    bacterial_leaf_streak: {
      en: 'Bacterial Leaf Streak',
      hi: 'जीवाणु पत्ती धारी',
      ta: 'பாக்டீரியா இலைக்கோடு நோய்',
      kn: 'ಬ್ಯಾಕ್ಟೀರಿಯಾ ಎಲೆ ಗೆರೆ ರೋಗ'
    },
    brown_spot: {
      en: 'Brown Spot',
      hi: 'भूरा धब्बा रोग',
      ta: 'பழுப்பு புள்ளி நோய்',
      kn: 'ಕಂದು ಚುಕ್ಕೆ ರೋಗ'
    },
    leaf_blast: {
      en: 'Rice Leaf Blast',
      hi: 'धान का ब्लास्ट रोग',
      ta: 'இலைக் கருகல் / பிளாஸ்ட்',
      kn: 'ಎಲೆ ಬೆಂಕಿ ರೋಗ'
    },
    bacterial_leaf_blight: {
      en: 'Bacterial Leaf Blight',
      hi: 'जीवाणु पत्ती झुलसा',
      ta: 'பாக்டீரியா இலைக்கருகல்',
      kn: 'ದುಂಡಾಣು ಎಲೆ ಕವಚ ರೋಗ'
    },
    sheath_blight: {
      en: 'Sheath Blight',
      hi: 'शीथ ब्लाइट रोग',
      ta: 'உறை அழுகல் நோய்',
      kn: 'ಹಾಳೆ ಕವಚ ರೋಗ'
    },
    false_smut: {
      en: 'False Smut',
      hi: 'झूठा कंडुआ',
      ta: 'பொய் கரிப்பூட்டை நோய்',
      kn: 'ಸುಳ್ಳು ಕಾಡಿಗೆ ರೋಗ'
    },
    leaf_curl: {
      en: 'Leaf Curl Virus',
      hi: 'पर्ण कुंचन रोग',
      ta: 'இலை சுருள் நச்சுயிரி',
      kn: 'ಎಲೆ ಮುರುಟು ರೋಗ'
    },
    anthracnose: {
      en: 'Anthracnose',
      hi: 'एंथ्रेक्नोज धब्बा',
      ta: 'ஆந்த்ராக்னோஸ் புள்ளி',
      kn: 'ಆಂಥ್ರಾಕ್ನೋಸ್ ರೋಗ'
    },
    sigatoka: {
      en: 'Sigatoka Leaf Spot',
      hi: 'सिगाटोका पत्ती धब्बा',
      ta: 'சிகாடோகா இலைப்புள்ளி',
      kn: 'ಸಿಗಾಟೋಕಾ ಎಲೆ ಚುಕ್ಕೆ'
    },
    tikka_leaf_spot: {
      en: 'Tikka Disease',
      hi: 'टिक्का रोग',
      ta: 'டிக்கா இலைப்புள்ளி நோய்',
      kn: 'ತಿಕ್ಕಾ ರೋಗ'
    },
    rust: {
      en: 'Leaf Rust',
      hi: 'गेरुआ / रतुआ रोग',
      ta: 'துரு நோய்',
      kn: 'ತುಕ್ಕು ರೋಗ'
    }
  };

  const formatDisease = (token) => {
    if (!token) return 'Other Plant Condition';
    const key = token.toLowerCase();
    if (diseaseNameMap[key]) {
      return diseaseNameMap[key][currentLang] || diseaseNameMap[key].en;
    }
    return token
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="bg-slate-50/90 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs space-y-2.5">
      
      {/* Header with toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left gap-2 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-200 rounded-lg text-slate-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800 m-0 leading-tight">
              {t.otherDiagnoses || 'Other Possible Diagnoses'}
            </h3>
            <span className="text-[10px] font-semibold text-slate-500 block leading-tight">
              {t.otherDiagnosesSub || 'Secondary conditions evaluated with low confidence'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[10px] font-bold bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md">
            {otherPredictions.length} {t.evaluated || 'evaluated'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-2 pt-1 border-t border-slate-200/60 animate-in fade-in duration-200">
          
          {otherPredictions.map((pred, idx) => {
            const rawConfidence = pred.confidence;
            const pct = typeof rawConfidence === 'number'
              ? (rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence))
              : 0;

            const displayPct = pct < 1 && rawConfidence > 0 ? '< 1%' : `${pct}%`;
            const barWidth = Math.max(pct, 2);

            return (
              <div 
                key={idx} 
                className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5"
              >
                {/* Disease Name & Confidence Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-mono font-bold text-slate-600 flex items-center justify-center shrink-0">
                      {idx + 2}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {formatDisease(pred.disease)}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    {displayPct} {t.match || 'match'}
                  </span>
                </div>

                {/* Simple Horizontal Confidence Indicator */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/80">
                  <div 
                    className="h-full bg-slate-400 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Reassurance Footer note */}
          <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 m-0 pt-0.5 italic leading-tight text-center sm:text-left">
            💡 {t.otherDiagnosesNote || 'Note: The primary diagnosis above is the most likely match.'}
          </p>

        </div>
      )}

    </div>
  );
}
