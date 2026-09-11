import React from 'react';
import { AlertTriangle, Percent, ShieldCheck } from 'lucide-react';
import { getSeverityStyle, TRANSLATIONS } from '../utils/helpers';

export default function SeverityCard({ diagnosis, currentLang }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const style = getSeverityStyle(diagnosis.severity);

  return (
    <div className="bg-white rounded-3xl p-5 border-4 border-slate-300 shadow-xl space-y-4">
      
      {/* Top Header: Severity Badge & Confidence */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-slate-200">
        <div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            {t.severity}
          </span>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${style.bg} ${style.text} border-2 ${style.border} font-black text-base mt-1 shadow-md`}>
            <AlertTriangle className="w-5 h-5 fill-white text-current" />
            <span>{style.label}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            AI Accuracy
          </span>
          <div className="inline-flex items-center gap-1 text-emerald-800 font-black text-lg bg-emerald-100 px-3 py-1 rounded-xl border-2 border-emerald-300 mt-1">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>{diagnosis.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Affected Leaf Area % */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-base font-black text-slate-900 flex items-center gap-1.5">
            <Percent className="w-5 h-5 text-red-600" />
            <span>{t.affectedArea}</span>
          </span>
          <span className="text-xl font-black text-red-700 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
            {diagnosis.affectedAreaPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-5 rounded-full overflow-hidden border-2 border-slate-300 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-500 to-red-600"
            style={{ width: `${diagnosis.affectedAreaPercentage}%` }}
          />
        </div>
      </div>

      {/* Local Summary Box */}
      <div className="bg-slate-100 p-3.5 rounded-2xl border-2 border-slate-300 text-slate-900 text-base font-extrabold leading-snug">
        {currentLang === 'hi' ? diagnosis.localSummary : diagnosis.summary}
      </div>

    </div>
  );
}
