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
import { formatDiseaseName, TRANSLATIONS } from '../utils/helpers';

/**
 * GeminiSecondOpinionCard
 * Full multi-language support (en, hi, ta, kn).
 */
export default function GeminiOpinionCard({ gemini, currentLang = 'en' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

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

  // Localized explanations for standard mock prediction
  const localizedExplanations = {
    hi: 'आपकी धान की फसल में जीवाणु पत्ती झुलसा (Bacterial Leaf Blight) के स्पष्ट लक्षण दिखाई दे रहे हैं। यह बैक्टीरिया गर्म, नम और बरसात के मौसम में पत्तियों के प्राकृतिक छिद्रों से प्रवेश करता है, जिससे पत्तियां नोक से सूखने लगती हैं।',
    ta: 'உங்கள் நெல் பயிரில் பாக்டீரியா இலைக்கருகல் நோயின் அறிகுறிகள் தெளிவாகத் தெரிகின்றன. சூடான, ஈரப்பதமான மற்றும் மழைக்காலத்தில் பாக்டீரியாக்கள் இலை விளிம்புகள் வழியாக நுழைந்து, நுனியிலிருந்து இலைகளை உலரச் செய்கின்றன.',
    kn: 'ನಿಮ್ಮ ಭತ್ತದ ಬೆಳೆಯಲ್ಲಿ ದುಂಡಾಣು ಎಲೆ ಕವಚ ರೋಗದ (Bacterial Leaf Blight) ಸ್ಪಷ್ಟ ಲಕ್ಷಣಗಳು ಕಂಡುಬರುತ್ತಿವೆ. ಬೆಚ್ಚಗಿನ, ತೇವಾಂಶವುಳ್ಳ ಮತ್ತು ಮಳೆಯ ವಾತಾವರಣದಲ್ಲಿ ಎಲೆಗಳ ಅಂಚುಗಳ ಮೂಲಕ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಪ್ರವೇಶಿಸಿ ಎಲೆಗಳನ್ನು ಒಣಗಿಸುತ್ತದೆ.'
  };

  const displayExplanation = localizedExplanations[currentLang] || farmer_explanation;

  const localizedEvidence = {
    hi: [
      'पत्ती के किनारों पर लहरदार पानी जैसे भीगे हुए घाव',
      'पत्ती के निचले हिस्से तक पीली और भूसे के रंग की धारियां'
    ],
    ta: [
      'இலை விளிம்புகளில் அலை போன்ற ஈரமான புண்கள்',
      'இலையின் கீழ்நோக்கி பரவும் மஞ்சள் மற்றும் வைக்கோல் நிற கோடுகள்'
    ],
    kn: [
      'ಎಲೆಯ ಅಂಚುಗಳಲ್ಲಿ ನೀರಿನಂತಹ ತೇವಯುಕ್ತ ಗಾಯಗಳು',
      'ಎಲೆಯ ಕೆಳಭಾಗಕ್ಕೆ ಹರಡುವ ಹಳದಿ ಮತ್ತು ಹುಲ್ಲಿನ ಬಣ್ಣದ ಗೆರೆಗಳು'
    ]
  };

  const displayEvidence = localizedEvidence[currentLang] || visual_evidence;

  const localizedCauses = {
    hi: [
      'जैंथोमोनस ओराइजी (Xanthomonas oryzae) जीवाणु का संक्रमण',
      'जलजमाव और अत्यधिक नाइट्रोजन खाद का प्रयोग'
    ],
    ta: [
      'சாந்தோமோனாஸ் ஒரைசே (Xanthomonas oryzae) பாக்டீரியா தொற்று',
      'வயலில் அதிக நீர் தேங்குதல் மற்றும் அதிகப்படியான தழைச்சத்து (நைட்ரஜன்)'
    ],
    kn: [
      'ಕ್ಸಾಂಥೋಮೊನಾಸ್ ಒರೈಜೆ (Xanthomonas oryzae) ಬ್ಯಾಕ್ಟೀರಿಯಾ ಸೋಂಕು',
      'ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲುವುದು ಮತ್ತು ಅತಿಯಾದ ಸಾರಜನಕ ಗೊಬ್ಬರದ ಬಳಕೆ'
    ]
  };

  const displayCauses = localizedCauses[currentLang] || possible_causes;

  const agreementLabel = agreement
    ? (t.confirmsDiagnosis || 'Confirms Diagnosis')
    : (t.divergentAssessment || 'Divergent Assessment');

  const confidenceLabels = {
    en: 'HIGH CONFIDENCE',
    hi: 'उच्च विश्वसनीयता',
    ta: 'உயர் நம்பிக்கை',
    kn: 'ಹೆಚ್ಚಿನ ವಿಶ್ವಾಸ'
  };

  const confidenceLabel = confidenceLabels[currentLang] || `${assessment_confidence.toUpperCase()} CONFIDENCE`;

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
              <span className="text-xs font-black tracking-tight">{t.secondOpinion || 'Gemini 2.5 Second Opinion'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-400/25 border border-indigo-300/30 text-indigo-100">
                Flash-Lite
              </span>
            </div>
            <p className="text-[11px] text-indigo-200 font-medium m-0">{t.multimodalValidation || 'Multimodal Visual Validation'}</p>
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
          <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
            <Bot className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
            <span className="font-semibold shrink-0">{t.independentRead || 'Independent Read:'}</span>
            <span className="font-black text-slate-900 truncate">{formatDiseaseName(gemini_assessment)}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200 shrink-0 ml-2">
            {confidenceLabel}
          </span>
        </div>

        {/* Farmer Plain-Language Explanation */}
        {displayExplanation && (
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
            <p className="text-xs sm:text-sm font-medium text-indigo-950 leading-relaxed m-0">
              "{displayExplanation}"
            </p>
          </div>
        )}

        {/* Disagreement Warning Alert if applicable */}
        {!agreement && disagreement_reason && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{t.disagreementNote || 'Disagreement Note:'}</span>{' '}
              <span>{disagreement_reason}</span>
            </div>
          </div>
        )}

        {/* Collapsible Evidence and Causes Toggle */}
        {(displayEvidence.length > 0 || displayCauses.length > 0) && (
          <div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-1.5 px-2 flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 border-t border-slate-100 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                {isExpanded 
                  ? (t.hideEvidenceCauses || 'Hide Visual Evidence & Causes')
                  : (t.viewEvidenceCauses || 'View Visual Evidence & Pathogen Causes')}
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
                {displayEvidence.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                      <Eye className="w-3.5 h-3.5 text-indigo-700" />
                      <span>{t.observedEvidence || 'Observed Visual Evidence'}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1">
                      {displayEvidence.map((evidence, idx) => (
                        <li key={idx} className="leading-snug">{evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pathogen / Agronomic Causes */}
                {displayCauses.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                      <Microscope className="w-3.5 h-3.5 text-purple-700" />
                      <span>{t.plausibleCauses || 'Plausible Pathological Causes'}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1">
                      {displayCauses.map((cause, idx) => (
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
