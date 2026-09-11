import React from 'react';
import { Percent, Activity } from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

/**
 * AffectedAreaCard Component
 * Displays:
 * - affected_pct prominently
 * - Clear text explaining how much of the leaf is affected
 * Full multi-language support (en, hi, ta, kn).
 */
export default function AffectedAreaCard({ affectedPct = 0, currentLang = 'en' }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const percentage = Math.min(Math.max(Math.round(affectedPct), 0), 100);

  const getSpreadInfo = (pct) => {
    if (pct <= 15) {
      return {
        badge: t.earlyStage || 'Early Stage',
        desc: t.earlyStageDesc || 'Minor surface coverage — Early stage containment possible',
        color: 'text-emerald-800 bg-emerald-100 border-emerald-300'
      };
    }
    if (pct <= 40) {
      return {
        badge: t.moderateSpread || 'Moderate',
        desc: t.moderateSpreadDesc || 'Moderate surface damage — Prompt treatment recommended',
        color: 'text-amber-900 bg-amber-100 border-amber-300'
      };
    }
    return {
      badge: t.highSpread || 'High Spread',
      desc: t.highSpreadDesc || 'Extensive damage detected — Urgent intervention required',
      color: 'text-red-900 bg-red-100 border-red-300'
    };
  };

  const info = getSpreadInfo(percentage);

  // Formatted statement for Indian languages
  const renderLeafStatement = () => {
    if (currentLang === 'hi') {
      return (
        <span>
          पत्ती का <span className="text-red-700 font-black">{percentage}%</span> हिस्सा प्रभावित है
        </span>
      );
    }
    if (currentLang === 'ta') {
      return (
        <span>
          இலையின் <span className="text-red-700 font-black">{percentage}%</span> பகுதி பாதிக்கப்பட்டுள்ளது
        </span>
      );
    }
    if (currentLang === 'kn') {
      return (
        <span>
          ಎಲೆಯ <span className="text-red-700 font-black">{percentage}%</span> ಭಾಗ ಹಾನಿಗೊಳಗಾಗಿದೆ
        </span>
      );
    }
    return (
      <span>
        <span className="text-red-700 font-black">{percentage}%</span> of the leaf is affected
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-50 rounded-lg border border-red-200/60">
            <Percent className="w-4 h-4 text-red-700 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 m-0 leading-tight">
              {t.affectedArea || 'Affected Leaf Area'}
            </h2>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
              {t.surfaceCoverage || 'Surface Lesion Coverage'}
            </span>
          </div>
        </div>

        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${info.color}`}>
          {info.badge}
        </span>
      </div>

      {/* Prominent Percentage Display & Explanatory Statement */}
      <div className="bg-slate-50/80 rounded-xl p-3 sm:p-4 border border-slate-200/80 text-center space-y-1.5">
        <div className="flex items-baseline justify-center">
          <span className="text-3xl sm:text-4xl font-black text-red-700 font-mono tracking-tight leading-none">
            {percentage}%
          </span>
        </div>

        <p className="text-sm sm:text-base font-bold text-slate-900 m-0 leading-tight">
          {renderLeafStatement()}
        </p>

        {/* Dynamic Progress Bar */}
        <div className="pt-1.5">
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden border border-slate-300/80 p-0.5 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 px-1">
            <span>0% ({t.clean || 'Clean'})</span>
            <span>50%</span>
            <span>100% ({t.total || 'Total'})</span>
          </div>
        </div>
      </div>

      {/* Clear Explanation Box */}
      <div className="bg-amber-50/60 p-2.5 sm:p-3 rounded-xl border border-amber-200/80 flex items-start gap-2">
        <Activity className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-semibold text-amber-950 m-0 leading-snug">
          {info.desc}
        </p>
      </div>

    </div>
  );
}
