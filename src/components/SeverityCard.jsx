import React from 'react';
import { AlertTriangle, Percent, ShieldCheck, Layers } from 'lucide-react';
import { getSeverityStyle, TRANSLATIONS } from '../utils/helpers';

export default function SeverityCard({ diagnosis, currentLang }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const style = getSeverityStyle(diagnosis.severity);

  const confidencePct = diagnosis.confidence <= 1 
    ? Math.round(diagnosis.confidence * 100) 
    : diagnosis.confidence;

  const affectedPct = diagnosis.affected_pct ?? diagnosis.affectedAreaPercentage ?? 0;
  const summaryText = diagnosis.advisory?.what_it_is || (currentLang === 'hi' ? diagnosis.localSummary : diagnosis.summary);

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
            AI Accuracy / Confidence
          </span>
          <div className="inline-flex items-center gap-1 text-emerald-800 font-black text-lg bg-emerald-100 px-3 py-1 rounded-xl border-2 border-emerald-300 mt-1">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>{confidencePct}%</span>
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
            {affectedPct}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-5 rounded-full overflow-hidden border-2 border-slate-300 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-500 to-red-600"
            style={{ width: `${Math.min(affectedPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Top 3 Disease Candidates if available */}
      {Array.isArray(diagnosis.top3) && diagnosis.top3.length > 0 && (
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Top AI Predictions</span>
          </span>
          <div className="space-y-1.5">
            {diagnosis.top3.map((item, idx) => {
              const itemPct = item.confidence <= 1 ? Math.round(item.confidence * 100) : item.confidence;
              const formattedName = item.disease.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              return (
                <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-black">
                      {idx + 1}
                    </span>
                    <span>{formattedName}</span>
                  </span>
                  <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {itemPct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Box */}
      {summaryText && (
        <div className="bg-slate-100 p-3.5 rounded-2xl border-2 border-slate-300 text-slate-900 text-base font-extrabold leading-snug">
          {summaryText}
        </div>
      )}

    </div>
  );
}
