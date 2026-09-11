import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  PhoneCall, 
  CheckCircle2, 
  ArrowLeft, 
  Building2, 
  Clock, 
  ShieldAlert, 
  UserCheck 
} from 'lucide-react';

import DiagnosisHeader from '../components/DiagnosisHeader';
import OtherDiagnosesCard from '../components/OtherDiagnosesCard';
import LeafHeatmap from '../components/LeafHeatmap';
import AffectedAreaCard from '../components/AffectedAreaCard';
import RiskCard from '../components/RiskCard';
import GeminiOpinionCard from '../components/GeminiOpinionCard';
import AdvisoryAccordion from '../components/AdvisoryAccordion';
import AudioButton from '../components/AudioButton';
import { escalateToOfficer } from '../services/api';
import { TRANSLATIONS, buildVoiceAdviceScript, stopSpeech } from '../utils/helpers';

export default function Result({ diagnosis, selectedCrop, uploadedImage, currentLang = 'en' }) {
  const navigate = useNavigate();
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalatedTicket, setEscalatedTicket] = useState(null);
  const [isSubmittingEscalation, setIsSubmittingEscalation] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Cleanup speech synthesis when leaving Result page
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (!diagnosis) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 text-center space-y-3">
        <h2 className="text-xl font-black text-slate-800">{t.noDiagnosisTitle || 'No Diagnosis Found'}</h2>
        <p className="text-sm text-slate-600 font-semibold">{t.noDiagnosisSub || 'Please upload a leaf photo to analyze first.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-base shadow-sm"
        >
          {t.startDiagnosis || 'Start Diagnosis'}
        </button>
      </div>
    );
  }

  // Voice output text covering: Disease name, Severity, Affected percentage, 72-hour risk level, Do Now advice, Watch For advice
  const voiceAdviceScript = buildVoiceAdviceScript(diagnosis, currentLang);

  const handleEscalateSubmit = async () => {
    setIsSubmittingEscalation(true);
    const res = await escalateToOfficer({
      cropId: diagnosis.crop || diagnosis.cropName,
      disease: diagnosis.disease || diagnosis.diseaseName,
      caseId: diagnosis.case_id
    });
    setIsSubmittingEscalation(false);
    setEscalatedTicket(res.ticketId || diagnosis.case_id);
  };

  const officer = diagnosis.officerInfo || {
    name: 'Dr. Sunita Verma',
    designation: currentLang === 'hi' ? 'वरिष्ठ कृषि विज्ञान केंद्र अधिकारी' : currentLang === 'ta' ? 'முதுநிலை வேளாண் அறிவியல் மைய அதிகாரி' : currentLang === 'kn' ? 'ಹಿರಿಯ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ ಅಧಿಕಾರಿ' : 'Senior Krishi Vigyan Kendra Officer',
    center: currentLang === 'hi' ? 'क्षेत्रीय कृषि अनुसंधान केंद्र' : currentLang === 'ta' ? 'மண்டல வேளாண் ஆராய்ச்சி நிலையம்' : currentLang === 'kn' ? 'ಪ್ರಾದೇಶಿಕ ಕೃಷಿ ಸಂಶೋಧನಾ ಕೇಂದ್ರ' : 'Regional Agriculture Research Station',
    phone: '+91 98765 88990',
    kisanHelpline: '1800-180-1551',
    availableHours: '9:00 AM - 5:00 PM'
  };

  const officerReceivedText = currentLang === 'hi'
    ? `केवीके अधिकारी ${officer.name} को आपकी रिपोर्ट मिल गई है। 2 घंटे में संपर्क होगा।`
    : currentLang === 'ta'
    ? `KVK அதிகாரி ${officer.name} உங்கள் அறிக்கையைப் பெற்றுள்ளார். 2 மணி நேரத்தில் அழைப்பார்.`
    : currentLang === 'kn'
    ? `KVK ಅಧಿಕಾರಿ ${officer.name} ನಿಮ್ಮ ವರದಿಯನ್ನು ಸ್ವೀಕರಿಸಿದ್ದಾರೆ. 2 ಗಂಟೆಗಳಲ್ಲಿ ಕರೆ ಮಾಡಲಿದ್ದಾರೆ.`
    : `KVK Officer ${officer.name} has received your report. Callback within 2 hours.`;

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto px-3.5 py-4 space-y-3.5 pb-20">
      
      {/* Top Navigation & Report Badge */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-all active:scale-95 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>{t.newScan || 'New Scan'}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 bg-emerald-900 text-white font-bold px-3 py-1 rounded-xl border border-emerald-700 text-xs shadow-xs">
          <FileText className="w-4 h-4 text-emerald-300" />
          <span>{t.diagnosisReport || 'Diagnosis Report'}</span>
        </div>
      </div>

      {/* 1. Diagnosis Header Component */}
      <DiagnosisHeader 
        diagnosis={diagnosis} 
        selectedCrop={selectedCrop} 
        currentLang={currentLang} 
      />

      {/* Secondary: Other Possible Diagnoses */}
      <OtherDiagnosesCard 
        top3={diagnosis.top3}
        mainDisease={diagnosis.disease}
        currentLang={currentLang}
      />

      {/* 2. Leaf Image & Heatmap Component */}
      <LeafHeatmap 
        uploadedImage={uploadedImage} 
        heatmapUrl={diagnosis.heatmap_url} 
        currentLang={currentLang}
      />

      {/* Voice Audio Listen Button */}
      <AudioButton 
        textToRead={voiceAdviceScript} 
        currentLang={currentLang} 
      />

      {/* 3. Affected Area Card Component */}
      <AffectedAreaCard 
        affectedPct={diagnosis.affected_pct ?? diagnosis.affectedAreaPercentage ?? 0} 
        currentLang={currentLang} 
      />

      {/* 4. 72-Hour Spread Risk Card Component */}
      <RiskCard 
        risk72h={diagnosis.risk_72h} 
        weatherRisk={diagnosis.weatherRisk} 
        currentLang={currentLang} 
      />

      {/* Multimodal Second Opinion: Gemini 2.5 Flash-Lite */}
      {diagnosis.gemini && (
        <GeminiOpinionCard 
          gemini={diagnosis.gemini} 
          currentLang={currentLang} 
        />
      )}

      {/* 5. Advisory Accordion Component */}
      <AdvisoryAccordion 
        advisory={diagnosis.advisory} 
        currentLang={currentLang} 
      />

      {/* Escalation Action Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowEscalateModal(true)}
          className="w-full min-h-[48px] bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-black rounded-2xl p-3 text-base flex items-center justify-center gap-2.5 shadow-lg border-2 border-red-800 focus:ring-2 focus:ring-red-400 transition-all active:scale-98"
        >
          <PhoneCall className="w-5 h-5 text-white stroke-[2.5] animate-bounce" />
          <span>{t.escalateBtn || 'Talk to Agri Officer Now'}</span>
        </button>
      </div>

      {/* Escalation Officer Contact Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 border-2 border-red-700 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-700" />
                <h3 className="text-lg font-black text-slate-900 m-0">{t.escalationModalTitle || 'Agri Officer Escalation'}</h3>
              </div>
              <button 
                onClick={() => setShowEscalateModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl p-1"
              >
                ✕
              </button>
            </div>

            {escalatedTicket ? (
              <div className="bg-emerald-50 border border-emerald-400 rounded-xl p-4 text-center space-y-2.5">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto stroke-[2.5]" />
                <h4 className="text-lg font-black text-emerald-950 m-0">{t.ticketSubmitted}</h4>
                <p className="text-sm font-bold text-emerald-900 m-0">
                  {t.ticketIdLabel || 'Ticket ID:'} <span className="font-black bg-emerald-200 px-2 py-0.5 rounded">{escalatedTicket}</span>
                </p>
                <p className="text-xs font-semibold text-slate-700 m-0">
                  {officerReceivedText}
                </p>
                <button
                  onClick={() => setShowEscalateModal(false)}
                  className="w-full bg-emerald-700 text-white font-bold rounded-xl p-2.5 text-sm mt-1"
                >
                  {t.closeBackReport || 'Close & Back to Report'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Officer Card */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-6 h-6 text-emerald-800" />
                    <div>
                      <h4 className="text-base font-black text-slate-950 m-0">{officer.name}</h4>
                      <p className="text-xs font-semibold text-emerald-800 m-0">{officer.designation}</p>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-600 pt-2 border-t border-slate-200 space-y-1">
                    <p className="flex items-center gap-1.5 m-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{officer.center}</span>
                    </p>
                    <p className="flex items-center gap-1.5 m-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentLang === 'hi' ? 'समय:' : currentLang === 'ta' ? 'நேரம்:' : currentLang === 'kn' ? 'ಸಮಯ:' : 'Hours:'} {officer.availableHours}</span>
                    </p>
                  </div>
                </div>

                {/* Call Direct Hotline */}
                <a
                  href={`tel:${officer.kisanHelpline}`}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl p-3 text-base flex items-center justify-center gap-2 shadow-md border border-emerald-900"
                >
                  <PhoneCall className="w-5 h-5 text-emerald-200" />
                  <span>{t.callHelpline || 'Call Kisan Helpline'} ({officer.kisanHelpline})</span>
                </a>

                {/* Request Urgent Callback Ticket */}
                <button
                  type="button"
                  onClick={handleEscalateSubmit}
                  disabled={isSubmittingEscalation}
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl p-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700"
                >
                  {isSubmittingEscalation ? (t.sendingTicket || 'Sending Ticket...') : (t.requestCallbackTicket || 'Request Direct Officer Callback Ticket')}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
