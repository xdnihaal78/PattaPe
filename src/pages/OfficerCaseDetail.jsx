import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getCaseById, 
  updateCaseStatus 
} from '../services/officerService';
import HeatmapViewer from '../components/officer/HeatmapViewer';
import TopPredictionsCard from '../components/officer/TopPredictionsCard';
import OfficerActionModals from '../components/officer/OfficerActionModals';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FlaskConical, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  Pill,
  ShieldAlert,
  Shield
} from 'lucide-react';

export default function OfficerCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'confirm' | 'override' | 'lab' | null
  const [overridePrefill, setOverridePrefill] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function load() {
      const found = await getCaseById(id);
      setCaseData(found);
    }
    load();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Action Handlers using updateCaseStatus (matching PATCH /cases/{id}/status)
  const handleConfirmSubmit = async ({ notes, adjustedDosage }) => {
    const updated = await updateCaseStatus(caseData.id || caseData.case_id, {
      status: 'Confirmed',
      notes: notes || 'Confirmed by officer',
      adjustedDosage
    });
    if (updated) {
      setCaseData({ ...updated });
      setActiveModal(null);
      showToast('Diagnosis confirmed successfully!');
    }
  };

  const handleOverrideSubmit = async ({ newDisease, newSeverity, reason, updatedAdvice }) => {
    const updated = await updateCaseStatus(caseData.id || caseData.case_id, {
      status: 'Overridden',
      notes: reason,
      updatedDisease: newDisease,
      newSeverity,
      updatedAdvice
    });
    if (updated) {
      setCaseData({ ...updated });
      setActiveModal(null);
      showToast(`Disease updated to "${newDisease}"!`);
    }
  };

  const handleLabSubmit = async ({ sampleType, urgency, samplingInstructions }) => {
    const labId = 'LAB-' + Math.floor(1000 + Math.random() * 9000);
    const updated = await updateCaseStatus(caseData.id || caseData.case_id, {
      status: 'Lab Test Requested',
      labDetails: {
        lab_id: labId,
        sampleType,
        urgency,
        samplingInstructions,
        date: new Date().toISOString()
      }
    });
    if (updated) {
      setCaseData({ ...updated });
      setActiveModal(null);
      showToast(`Sample sent to lab (Tracking: ${labId})`);
    }
  };

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-black text-slate-800">Case Not Found</h2>
        <p className="text-base font-bold text-slate-600">The requested case ticket #{id} does not exist.</p>
        <button
          onClick={() => navigate('/officer')}
          className="btn-touch px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-black text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = () => {
    switch (caseData.status) {
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 border-2 border-amber-400 px-4 py-2 rounded-2xl text-sm sm:text-base font-black shadow-sm">
            <Clock className="w-5 h-5 text-amber-700" />
            <span>Pending Review</span>
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-950 border-2 border-emerald-400 px-4 py-2 rounded-2xl text-sm sm:text-base font-black shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>Officer Confirmed</span>
          </span>
        );
      case 'Overridden':
        return (
          <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-950 border-2 border-purple-400 px-4 py-2 rounded-2xl text-sm sm:text-base font-black shadow-sm">
            <AlertTriangle className="w-5 h-5 text-purple-700" />
            <span>Overridden</span>
          </span>
        );
      case 'Lab Test Requested':
        return (
          <span className="inline-flex items-center gap-2 bg-rose-100 text-rose-950 border-2 border-rose-400 px-4 py-2 rounded-2xl text-sm sm:text-base font-black shadow-sm">
            <FlaskConical className="w-5 h-5 text-rose-700" />
            <span>Lab Test Requested</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-950 border-2 border-red-400 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-red-600 shrink-0 animate-pulse" />
            <span>Severe Damage</span>
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 border-2 border-amber-400 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span>Moderate Damage</span>
          </span>
        );
      case 'mild':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-950 border-2 border-blue-400 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <span>Mild (Early Stage)</span>
          </span>
        );
      case 'trace':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 border-2 border-emerald-400 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
            <span>Trace (Normal)</span>
          </span>
        );
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow-2xs">
            <ShieldAlert className="w-4 h-4" />
            <span>High Weather Risk</span>
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow-2xs">
            <Shield className="w-4 h-4" />
            <span>Medium Risk</span>
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Low Risk (Safe)</span>
          </span>
        );
    }
  };

  const getCropIcon = (cropName) => {
    switch (cropName?.toLowerCase()) {
      case 'rice': return '🌾';
      case 'chilli': return '🌶️';
      case 'banana': return '🍌';
      case 'groundnut': return '🥜';
      case 'sugarcane': return '🎋';
      default: return '🌱';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white font-black text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-500">
          <Link to="/officer" className="hover:text-emerald-800 flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-xl shadow-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-black">{caseData.case_id || `Case #${caseData.id}`}</span>
        </div>

        {/* Current Status Badge */}
        <div className="self-start sm:self-auto">
          {getStatusBadge()}
        </div>
      </div>

      {/* Farmer & Field Info Card in Simple Clear Text */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-md p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          
          {/* Farmer Primary Details */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
              {(caseData.farmer_name || 'F').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 m-0">
                  {caseData.farmer_name || 'Local Farmer'}
                </h2>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-slate-600 m-0 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Village: <strong className="text-slate-900">{caseData.village}</strong></span>
              </p>
            </div>
          </div>

          {/* Contact, Crop & Submission Info */}
          <div className="flex flex-wrap items-center gap-3">
            
            {caseData.farmer_phone && (
              <a
                href={`tel:${caseData.farmer_phone}`}
                className="btn-touch px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold text-sm flex items-center gap-2 border border-slate-300 transition"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>{caseData.farmer_phone}</span>
              </a>
            )}

            {/* Crop Tag */}
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-950 font-black px-4 py-2.5 rounded-2xl border-2 border-emerald-300 text-base">
              <span className="text-2xl">{getCropIcon(caseData.crop)}</span>
              <span>{caseData.crop} Crop</span>
            </div>

            {/* Date Tag */}
            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 font-bold px-3.5 py-2 rounded-2xl border border-slate-200 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{formatDate(caseData.created_at || caseData.submittedAt)}</span>
            </div>

          </div>

        </div>

        {/* Severity & Risk Highlights in simple visual badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className="text-xs sm:text-sm font-black text-slate-600">Health Assessment:</span>
          {getSeverityBadge(caseData.severity)}
          {getRiskBadge(caseData.risk)}
          <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold border border-slate-300">
            {caseData.affected_pct}% Leaf Area Affected
          </span>
        </div>

        {/* Officer Note Banner if present */}
        {caseData.officer_notes && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-4 space-y-1">
            <span className="text-xs font-black uppercase text-purple-900">Officer Recorded Note:</span>
            <p className="text-sm sm:text-base font-bold text-purple-950 m-0">"{caseData.officer_notes}"</p>
          </div>
        )}

      </div>

      {/* Main Workstation 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: VISUAL INSPECTION & TOP 3 (7 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Heatmap & Leaf Visual Inspector */}
          <HeatmapViewer
            originalImage={caseData.image_url || caseData.originalImage}
            imageUrl={caseData.image_url}
            affectedAreaPercentage={caseData.affected_pct || 40}
            cropName={caseData.crop}
          />

          {/* Top 3 Predictions Comparison Card */}
          <TopPredictionsCard
            topPredictions={caseData.top3 || caseData.topPredictions}
            currentConfirmedDisease={caseData.disease}
            onSelectForOverride={(candidate) => {
              setOverridePrefill(candidate);
              setActiveModal('override');
            }}
          />

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: DIAGNOSIS REVIEW & ACTION CONSOLE (5 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Primary AI Diagnosis Card in Clear Words */}
          <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-5 sm:p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs sm:text-sm font-black text-emerald-800 uppercase tracking-wider">
                AI Detected Disease
              </span>
              <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-950 font-black px-3 py-1 rounded-xl text-xs sm:text-sm border border-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{caseData.confidence}% Confidence</span>
              </div>
            </div>

            {/* Disease Heading */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 m-0 leading-tight">
                {caseData.disease}
              </h3>
            </div>

            {/* Simple Description */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {caseData.simple_summary || 'Disease symptoms detected on leaf surface. Review visual highlights on the left.'}
            </div>

          </div>

          {/* Treatment Advice in Simple Words */}
          <div className="bg-emerald-50 rounded-3xl border-2 border-emerald-300 shadow-md p-5 sm:p-6 space-y-3">
            <h4 className="text-sm font-black text-emerald-950 uppercase tracking-wider m-0 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-800" />
              <span>Recommended Farmer Treatment</span>
            </h4>
            
            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 text-sm sm:text-base font-bold text-slate-900">
              {caseData.recommended_treatment || 'Apply broad-spectrum copper fungicide @ 2g per liter of water.'}
            </div>
          </div>

          {/* ======================================================== */}
          {/* OFFICER ACTION BUTTONS (Clear and Simple) */}
          {/* ======================================================== */}
          <div className="bg-slate-900 text-white rounded-3xl border-2 border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4">
            <div>
              <h4 className="text-lg sm:text-xl font-black text-white m-0">
                Officer Actions
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold m-0 mt-0.5">
                Choose what to do with this farmer's scan
              </p>
            </div>

            {/* 3 Main Action Buttons in Clear, Simple Words */}
            <div className="space-y-3 pt-1">
              
              {/* Button 1: Agree / Confirm */}
              <button
                type="button"
                onClick={() => setActiveModal('confirm')}
                className="w-full btn-touch min-h-[56px] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black rounded-2xl p-3.5 text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg border border-emerald-400 transition"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                <span>✅ Agree with AI Diagnosis</span>
              </button>

              {/* Button 2: Override / Change Disease */}
              <button
                type="button"
                onClick={() => {
                  setOverridePrefill(null);
                  setActiveModal('override');
                }}
                className="w-full btn-touch min-h-[56px] bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-black rounded-2xl p-3.5 text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg border border-purple-500 transition"
              >
                <AlertTriangle className="w-6 h-6 text-purple-200" />
                <span>✏️ Change Disease Name</span>
              </button>

              {/* Button 3: Send to Lab */}
              <button
                type="button"
                onClick={() => setActiveModal('lab')}
                className="w-full btn-touch min-h-[56px] bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white font-black rounded-2xl p-3.5 text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg border border-rose-500 transition"
              >
                <FlaskConical className="w-6 h-6 text-rose-200" />
                <span>🧪 Send Sample to Lab</span>
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Action Modals */}
      <OfficerActionModals
        activeModal={activeModal}
        onClose={() => {
          setActiveModal(null);
          setOverridePrefill(null);
        }}
        caseData={caseData}
        onConfirmSubmit={handleConfirmSubmit}
        onOverrideSubmit={handleOverrideSubmit}
        onLabSubmit={handleLabSubmit}
        prefilledOverrideCandidate={overridePrefill}
      />

    </div>
  );
}
