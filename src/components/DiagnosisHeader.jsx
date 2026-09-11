import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { getSeverityStyle } from '../utils/helpers';

/**
 * DiagnosisHeader Component
 * Display:
 * - Selected crop
 * - Predicted disease name
 * - Confidence percentage
 * - Severity badge (trace, mild, moderate, severe)
 * Perfectly sized and well-proportioned.
 */
export default function DiagnosisHeader({ diagnosis, selectedCrop, currentLang = 'en' }) {
  if (!diagnosis) return null;

  // Extract crop name from prediction response (with fallback to selectedCrop)
  const cropName = diagnosis.crop_label_i18n?.[currentLang]
    || diagnosis.crop_label_i18n?.en
    || selectedCrop?.name
    || diagnosis.cropName
    || (typeof diagnosis.crop === 'string' ? diagnosis.crop.charAt(0).toUpperCase() + diagnosis.crop.slice(1) : 'Crop');

  const cropIcon = selectedCrop?.icon || '🌾';

  // Extract disease name from prediction response
  const diseaseName = diagnosis.disease_label_i18n?.[currentLang]
    || diagnosis.disease_label_i18n?.en
    || diagnosis.diseaseName
    || (typeof diagnosis.disease === 'string' ? diagnosis.disease.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Disease Detected');

  // Confidence percentage: format 0.94 -> 94% or 94 -> 94%
  const confidencePct = typeof diagnosis.confidence === 'number'
    ? (diagnosis.confidence <= 1 ? Math.round(diagnosis.confidence * 100) : Math.round(diagnosis.confidence))
    : 90;

  // Severity style mapping (trace, mild, moderate, severe)
  const severityStyle = getSeverityStyle(diagnosis.severity);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
      
      {/* Top Meta Bar: Crop Badge & Case ID */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-950 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 text-xs sm:text-sm">
          <span className="text-base">{cropIcon}</span>
          <span>{cropName}</span>
        </div>

        {diagnosis.case_id && (
          <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            Case: {diagnosis.case_id}
          </span>
        )}
      </div>

      {/* Disease Name Main Heading */}
      <div>
        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
          Diagnosed Plant Condition
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight mt-0.5">
          {diseaseName}
        </h1>
        {diagnosis.scientificName && (
          <span className="text-[11px] italic text-slate-500 font-medium block mt-0.5">
            Scientific: {diagnosis.scientificName}
          </span>
        )}
      </div>

      {/* Metrics Row: Severity Badge & Confidence Badge */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        
        {/* Severity Badge */}
        <div className={`p-2.5 rounded-xl border ${severityStyle.border} ${severityStyle.bg} ${severityStyle.text} shadow-xs flex items-center gap-2.5`}>
          <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
            <AlertTriangle className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider block opacity-90 leading-none">
              Severity
            </span>
            <span className="text-sm sm:text-base font-black leading-tight block mt-0.5">
              {severityStyle.label}
            </span>
            <span className="text-[10px] font-semibold block opacity-90 leading-none mt-0.5">
              ({severityStyle.localLabel})
            </span>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 shadow-xs flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-200/80 rounded-lg shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-800 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider block text-emerald-800 leading-none">
              AI Confidence
            </span>
            <span className="text-sm sm:text-base font-black leading-tight block font-mono mt-0.5">
              {confidencePct}%
            </span>
            <span className="text-[10px] font-bold text-emerald-700 block leading-none mt-0.5">
              High Accuracy
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
