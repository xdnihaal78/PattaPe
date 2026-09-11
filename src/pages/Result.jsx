import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  PhoneCall, 
  Eye, 
  Flame, 
  CheckCircle2, 
  ArrowLeft, 
  Building2, 
  Clock, 
  ShieldAlert, 
  UserCheck 
} from 'lucide-react';
import SeverityCard from '../components/SeverityCard';
import RiskCard from '../components/RiskCard';
import AdvisoryAccordion from '../components/AdvisoryAccordion';
import AudioButton from '../components/AudioButton';
import { escalateToOfficer } from '../services/api';
import { TRANSLATIONS } from '../utils/helpers';

export default function Result({ diagnosis, selectedCrop, uploadedImage, currentLang }) {
  const navigate = useNavigate();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalatedTicket, setEscalatedTicket] = useState(null);
  const [isSubmittingEscalation, setIsSubmittingEscalation] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (!diagnosis) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-800">No Diagnosis Found</h2>
        <p className="text-base text-slate-600 font-bold">Please upload a leaf photo to analyze first.</p>
        <button
          onClick={() => navigate('/')}
          className="btn-touch px-6 py-3 bg-emerald-700 text-white rounded-2xl font-black text-lg"
        >
          Start Diagnosis
        </button>
      </div>
    );
  }

  // Construct TTS read string
  const speechText = currentLang === 'hi'
    ? `आपकी फसल ${diagnosis.cropName} में बीमारी ${diagnosis.localDiseaseName} पाई गई है। बीमारी का स्तर ${diagnosis.severity} है। 72 घंटे में मौसम के कारण फैलने का खतरा है। मुख्य उपाय: ${diagnosis.advisory.chemical[0]?.local || ''}`
    : `Diagnosis for ${diagnosis.cropName}: ${diagnosis.diseaseName}. Severity is ${diagnosis.severity}. Weather spread risk is ${diagnosis.weatherRisk.level}. Main action: ${diagnosis.advisory.chemical[0]?.detail || ''}`;

  const handleEscalateSubmit = async () => {
    setIsSubmittingEscalation(true);
    const res = await escalateToOfficer({
      cropId: diagnosis.cropName,
      disease: diagnosis.diseaseName
    });
    setIsSubmittingEscalation(false);
    setEscalatedTicket(res.ticketId);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 pb-28">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-touch px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-2xl font-black text-sm flex items-center gap-2 border-2 border-slate-400"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>New Scan</span>
        </button>

        <div className="inline-flex items-center gap-2 bg-emerald-900 text-white font-black px-4 py-2 rounded-2xl border-2 border-emerald-600">
          <FileText className="w-5 h-5 text-emerald-300" />
          <span>Diagnosis Report</span>
        </div>
      </div>

      {/* Main Diagnosis Banner */}
      <div className="bg-white rounded-3xl p-5 border-4 border-emerald-700 shadow-2xl space-y-4">
        
        {/* Visual Leaf & Heatmap View Toggle */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-950 aspect-video max-h-64 flex items-center justify-center">
          <img 
            src={uploadedImage || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'} 
            alt="Leaf Diagnosis" 
            className={`w-full h-full object-cover transition-filter duration-300 ${
              showHeatmap ? 'contrast-200 hue-rotate-180 brightness-90 saturate-200' : ''
            }`}
          />

          {/* Simulated AI Heatmap Spots */}
          {showHeatmap && (
            <div className="absolute inset-0 bg-red-600/30 backdrop-hue-rotate-90 pointer-events-none flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-red-500/50 animate-ping border-4 border-amber-300" />
              <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-amber-500/60 animate-pulse border-2 border-red-400" />
            </div>
          )}

          {/* Heatmap Toggle Button */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="absolute top-3 right-3 bg-slate-900/90 text-white font-extrabold text-xs px-3 py-2 rounded-xl backdrop-blur-md border border-slate-600 flex items-center gap-1.5 shadow-lg active:scale-95"
          >
            {showHeatmap ? <Eye className="w-4 h-4 text-emerald-400" /> : <Flame className="w-4 h-4 text-amber-400" />}
            <span>{showHeatmap ? 'Standard View' : 'AI Heatmap View'}</span>
          </button>
        </div>

        {/* Disease Title */}
        <div>
          <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">
            {diagnosis.cropName} Disease Found
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 m-0 leading-tight">
            {diagnosis.diseaseName}
          </h2>
          <p className="text-lg font-black text-emerald-800 m-0 mt-0.5">
            {diagnosis.localDiseaseName}
          </p>
          <span className="text-xs italic text-slate-500 font-semibold block mt-1">
            Scientific: {diagnosis.scientificName}
          </span>
        </div>

      </div>

      {/* Prominent Audio Speech Button */}
      <AudioButton textToRead={speechText} currentLang={currentLang} />

      {/* Severity & Affected Area Card */}
      <SeverityCard diagnosis={diagnosis} currentLang={currentLang} />

      {/* 72h Weather Spread Risk Card */}
      <RiskCard weatherRisk={diagnosis.weatherRisk} currentLang={currentLang} />

      {/* Integrated Pest Management (IPM) Advisory */}
      <AdvisoryAccordion advisory={diagnosis.advisory} currentLang={currentLang} />

      {/* Major Escalation Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowEscalateModal(true)}
          className="w-full btn-touch min-h-[64px] bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-black rounded-3xl p-4 text-xl flex items-center justify-center gap-3 shadow-2xl border-4 border-red-900 focus:ring-4 focus:ring-red-400"
        >
          <PhoneCall className="w-8 h-8 text-white stroke-[2.5] animate-bounce" />
          <span>{t.escalateBtn}</span>
        </button>
      </div>

      {/* Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border-4 border-red-700 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-6">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-8 h-8 text-red-700" />
                <h3 className="text-xl font-black text-slate-900 m-0">Agri Officer Escalation</h3>
              </div>
              <button 
                onClick={() => setShowEscalateModal(false)}
                className="text-slate-400 hover:text-slate-700 font-black text-2xl p-1"
              >
                ✕
              </button>
            </div>

            {escalatedTicket ? (
              <div className="bg-emerald-50 border-3 border-emerald-500 rounded-2xl p-5 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto stroke-[2.5]" />
                <h4 className="text-xl font-black text-emerald-950 m-0">{t.ticketSubmitted}</h4>
                <p className="text-base font-bold text-emerald-900 m-0">
                  Ticket ID: <span className="font-black bg-emerald-200 px-2 py-1 rounded">{escalatedTicket}</span>
                </p>
                <p className="text-sm font-semibold text-slate-700 m-0">
                  KVK Officer <span className="font-extrabold">{diagnosis.officerInfo.name}</span> has received your report. Callback within 2 hours.
                </p>
                <button
                  onClick={() => setShowEscalateModal(false)}
                  className="btn-touch w-full bg-emerald-700 text-white font-black rounded-xl p-3 text-base mt-2"
                >
                  Close & Back to Report
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Officer Card */}
                <div className="bg-slate-100 p-4 rounded-2xl border-2 border-slate-300 space-y-2">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-8 h-8 text-emerald-800" />
                    <div>
                      <h4 className="text-lg font-black text-slate-950 m-0">{diagnosis.officerInfo.name}</h4>
                      <p className="text-xs font-extrabold text-emerald-800 m-0">{diagnosis.officerInfo.designation}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-600 pt-2 border-t border-slate-200 space-y-1">
                    <p className="flex items-center gap-1.5 m-0">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>{diagnosis.officerInfo.center}</span>
                    </p>
                    <p className="flex items-center gap-1.5 m-0">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Hours: {diagnosis.officerInfo.availableHours}</span>
                    </p>
                  </div>
                </div>

                {/* Call Direct Hotline */}
                <a
                  href={`tel:${diagnosis.officerInfo.kisanHelpline}`}
                  className="w-full btn-touch bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-2xl p-3.5 text-lg flex items-center justify-center gap-3 shadow-lg border-2 border-emerald-900"
                >
                  <PhoneCall className="w-6 h-6 text-emerald-200" />
                  <span>Call Kisan Helpline (1800-180-1551)</span>
                </a>

                {/* Request Urgent Callback Ticket */}
                <button
                  type="button"
                  onClick={handleEscalateSubmit}
                  disabled={isSubmittingEscalation}
                  className="w-full btn-touch bg-slate-900 hover:bg-slate-950 text-white font-black rounded-2xl p-3.5 text-base flex items-center justify-center gap-2 border-2 border-slate-700"
                >
                  {isSubmittingEscalation ? 'Sending Ticket...' : 'Request Direct Officer Callback Ticket'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
