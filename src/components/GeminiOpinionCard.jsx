import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Microscope, 
  ChevronDown, 
  ChevronUp, 
  Bot
} from 'lucide-react';
import { formatDiseaseName } from '../utils/helpers';

/**
 * GeminiSecondOpinionCard
 * Conforms to frozen CONTRACT.md schema:
 * gemini: {
 *   gemini_assessment: string,
 *   agreement: boolean,
 *   assessment_confidence: "high" | "medium" | "low" | "uncertain",
 *   visual_evidence: string[],
 *   possible_causes: string[],
 *   farmer_explanation: string,
 *   disagreement_reason: string | null
 * }
 */
export default function GeminiOpinionCard({ gemini, currentLang = 'en' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!gemini) return null;

  const {
    gemini_assessment,
    agreement,
    assessment_confidence = 'high',
    visual_evidence = [],
    possible_causes = [],
    farmer_explanation,
    disagreement_reason
  } = gemini;

  // Localized headers
  const isHindi = currentLang === 'hi';
  const isTamil = currentLang === 'ta';

  const titleText = isHindi 
    ? 'Gemini 2.5 AI द्वितीय राय' 
    : isTamil 
    ? 'Gemini 2.5 AI இரண்டாவது கருத்து' 
    : 'Gemini 2.5 Second Opinion';

  const subtitleText = isHindi
    ? 'मल्टीमॉडल दृश्य सत्यापन'
    : isTamil
    ? 'மல்டிமாடல் பார்வை சரிபார்ப்பு'
    : 'Multimodal Visual Validation';

  const agreementLabel = agreement
    ? (isHindi ? 'निदान की पुष्टि की गई' : isTamil ? 'கண்டறிதல் உறுதிசெய்யப்பட்டது' : 'Confirms Diagnosis')
    : (isHindi ? 'अलग राय' : isTamil ? 'வேறுபட்ட கருத்து' : 'Divergent Assessment');

  const confidenceLabel = assessment_confidence.toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-indigo-200/90 shadow-xs overflow-hidden transition-all">
      {/* Header Banner with Gradient Accent */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-3.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-200">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight">{titleText}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-400/25 border border-indigo-300/30 text-indigo-100">
                Flash-Lite
              </span>
            </div>
            <p className="text-[11px] text-indigo-200 font-medium m-0">{subtitleText}</p>
          </div>
        </div>

        {/* Agreement Status Pill */}
        <div 
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${
            agreement 
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' 
              : 'bg-amber-500/20 text-amber-200 border-amber-400/50'
          }`}
        >
          {agreement ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
          )}
          <span>{agreementLabel}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-3.5 space-y-3">
        {/* Assessment & Confidence Row */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Bot className="w-3.5 h-3.5 text-indigo-700" />
            <span className="font-semibold">{isHindi ? 'स्वतंत्र मूल्यांकन:' : 'Independent Read:'}</span>
            <span className="font-black text-slate-900">{formatDiseaseName(gemini_assessment)}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200">
            {confidenceLabel} {isHindi ? 'विश्वास' : 'CONFIDENCE'}
          </span>
        </div>

        {/* Farmer Plain-Language Explanation */}
        {farmer_explanation && (
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
            <p className="text-xs sm:text-sm font-medium text-indigo-950 leading-relaxed m-0">
              "{farmer_explanation}"
            </p>
          </div>
        )}

        {/* Disagreement Warning Alert if applicable */}
        {!agreement && disagreement_reason && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{isHindi ? 'विसंगति कारण:' : 'Disagreement Note:'}</span>{' '}
              <span>{disagreement_reason}</span>
            </div>
          </div>
        )}

        {/* Collapsible Evidence and Causes Toggle */}
        {(visual_evidence.length > 0 || possible_causes.length > 0) && (
          <div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-1.5 px-2 flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 border-t border-slate-100 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                {isHindi ? 'दृश्य प्रमाण और संभावित कारण देखें' : 'View Visual Evidence & Pathogen Causes'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {isExpanded && (
              <div className="pt-2.5 space-y-2.5 text-xs">
                {/* Visual Observations */}
                {visual_evidence.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                      <Eye className="w-3.5 h-3.5 text-indigo-700" />
                      <span>{isHindi ? 'दृश्य लक्षण देखे गए' : 'Observed Visual Evidence'}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1">
                      {visual_evidence.map((evidence, idx) => (
                        <li key={idx} className="leading-snug">{evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pathogen / Agronomic Causes */}
                {possible_causes.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                      <Microscope className="w-3.5 h-3.5 text-purple-700" />
                      <span>{isHindi ? 'संभावित जैविक कारण' : 'Plausible Pathological Causes'}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1">
                      {possible_causes.map((cause, idx) => (
                        <li key={idx} className="leading-snug">{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
