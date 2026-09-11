import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getCaseById, 
  updateCaseStatus 
} from '../services/officerService';
import HeatmapViewer from '../components/officer/HeatmapViewer';
import TopPredictionsCard from '../components/officer/TopPredictionsCard';
import OfficerActionModals from '../components/officer/OfficerActionModals';
import RiskReasonsCard from '../components/officer/RiskReasonsCard';
import AIAdvisorySection from '../components/officer/AIAdvisorySection';
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
  ShieldAlert,
  Shield,
  Leaf,
  Brain,
  BarChart3,
  Gavel,
  Microscope,
  Percent,
  Activity,
  Info,
  TrendingUp
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────── */
/* HELPERS */
/* ─────────────────────────────────────────────────────────────────────────── */

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

function getCropIcon(cropName) {
  switch (cropName?.toLowerCase()) {
    case 'rice':      return '🌾';
    case 'chilli':    return '🌶️';
    case 'banana':    return '🍌';
    case 'groundnut': return '🥜';
    case 'sugarcane': return '🎋';
    default:          return '🌱';
  }
}

function SectionTitle({ icon: Icon, label, sub, accent = 'emerald' }) {
  const accentMap = {
    emerald: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    blue:    'bg-blue-100 border-blue-300 text-blue-800',
    violet:  'bg-violet-100 border-violet-300 text-violet-800',
    amber:   'bg-amber-100 border-amber-300 text-amber-800',
    rose:    'bg-rose-100 border-rose-300 text-rose-800',
    slate:   'bg-slate-100 border-slate-300 text-slate-800',
  };
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`p-2.5 rounded-2xl border ${accentMap[accent]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 m-0 leading-tight">{label}</h2>
        {sub && <p className="text-xs font-semibold text-slate-500 m-0">{sub}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* STATUS BADGE */
/* ─────────────────────────────────────────────────────────────────────────── */

function StatusBadge({ status }) {
  switch (status) {
    case 'Pending Review':
      return (
        <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 border-2 border-amber-400 px-4 py-2 rounded-2xl text-sm font-black shadow-sm">
          <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
          <span>Pending Review</span>
        </span>
      );
    case 'Confirmed':
      return (
        <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-950 border-2 border-emerald-400 px-4 py-2 rounded-2xl text-sm font-black shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Officer Confirmed</span>
        </span>
      );
    case 'Overridden':
      return (
        <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-950 border-2 border-purple-400 px-4 py-2 rounded-2xl text-sm font-black shadow-sm">
          <AlertTriangle className="w-4 h-4 text-purple-700" />
          <span>Diagnosis Overridden</span>
        </span>
      );
    case 'Lab Test Requested':
      return (
        <span className="inline-flex items-center gap-2 bg-rose-100 text-rose-950 border-2 border-rose-400 px-4 py-2 rounded-2xl text-sm font-black shadow-sm">
          <FlaskConical className="w-4 h-4 text-rose-700" />
          <span>Lab Test Requested</span>
        </span>
      );
    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* SEVERITY & RISK BADGES */
/* ─────────────────────────────────────────────────────────────────────────── */

function SeverityBadge({ severity }) {
  switch (severity?.toLowerCase()) {
    case 'severe':
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-950 border-2 border-red-400 font-black text-xs px-3 py-1.5 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 animate-pulse" />
          Severe
        </span>
      );
    case 'moderate':
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 border-2 border-amber-400 font-black text-xs px-3 py-1.5 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          Moderate
        </span>
      );
    case 'mild':
      return (
        <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-950 border-2 border-blue-400 font-black text-xs px-3 py-1.5 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
          Mild
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 border-2 border-emerald-400 font-black text-xs px-3 py-1.5 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
          Trace
        </span>
      );
  }
}

function RiskBadge({ risk }) {
  switch (risk?.toLowerCase()) {
    case 'high':
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-xl">
          <ShieldAlert className="w-3.5 h-3.5" />
          High Risk
        </span>
      );
    case 'moderate':
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white font-black text-xs px-3 py-1.5 rounded-xl">
          <Shield className="w-3.5 h-3.5" />
          Medium Risk
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5" />
          Low Risk
        </span>
      );
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* CONFIDENCE BAR */
/* ─────────────────────────────────────────────────────────────────────────── */

function ConfidenceBar({ value, colorClass = 'bg-emerald-600' }) {
  return (
    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${Math.max(value, 4)}%` }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* STAT CELL */
/* ─────────────────────────────────────────────────────────────────────────── */

function StatCell({ icon: Icon, label, value, iconColor = 'text-slate-500', highlight = false }) {
  return (
    <div className={`flex flex-col gap-1 p-3.5 rounded-2xl border ${
      highlight ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-base sm:text-lg font-black ${highlight ? 'text-emerald-900' : 'text-slate-900'} leading-tight`}>
        {value}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ACTION BUTTONS SECTION */
/* ─────────────────────────────────────────────────────────────────────────── */

function OfficerActionConsole({ caseData, onAction }) {
  const isProcessed = caseData.status !== 'Pending Review';

  return (
    <div className="bg-slate-950 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden">
      {/* Console Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-900/50 rounded-2xl border border-emerald-700/30">
            <Gavel className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white m-0">
              Officer Validation
            </h3>
            <p className="text-xs font-semibold text-slate-400 m-0 mt-0.5">
              Your decision becomes the official record
            </p>
          </div>
        </div>
      </div>

      {/* Visual Officer Validation Loop Status */}
      {caseData.status === 'Confirmed' && (
        <div className="mx-5 mt-4 p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl flex items-start gap-3 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
              Validation Loop Complete: Confirmed
            </span>
            <p className="text-sm font-black text-white m-0 mt-0.5">
              Approved: {caseData.disease}
            </p>
            {caseData.officer_notes && (
              <p className="text-xs font-medium text-emerald-200/90 m-0 mt-1 italic">
                "{caseData.officer_notes}"
              </p>
            )}
            <span className="text-[11px] font-bold text-emerald-400/80 block mt-1.5">
              Official verification logged • Farmer notified
            </span>
          </div>
        </div>
      )}

      {caseData.status === 'Overridden' && (
        <div className="mx-5 mt-4 p-4 bg-purple-950/80 border-2 border-purple-500 rounded-2xl flex items-start gap-3 shadow-lg animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-purple-300 uppercase tracking-wider block">
              Validation Loop: Diagnosis Overridden
            </span>
            <p className="text-sm font-black text-white m-0 mt-0.5">
              Revised To: {caseData.disease} ({caseData.severity || 'moderate'})
            </p>
            {caseData.officer_notes && (
              <p className="text-xs font-medium text-purple-200/90 m-0 mt-1 italic">
                Reason: "{caseData.officer_notes}"
              </p>
            )}
            <span className="text-[11px] font-bold text-purple-400/80 block mt-1.5">
              Officer correction active • Overrides AI model prediction
            </span>
          </div>
        </div>
      )}

      {caseData.status === 'Lab Test Requested' && (
        <div className="mx-5 mt-4 p-4 bg-rose-950/80 border-2 border-rose-500 rounded-2xl flex items-start gap-3 shadow-lg animate-in fade-in">
          <FlaskConical className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-rose-300 uppercase tracking-wider block">
              Validation Loop: Lab Requisition Dispatched
            </span>
            <p className="text-sm font-black text-white m-0 mt-0.5">
              Specimen: {caseData.lab_details?.sampleType || 'Leaf Tissue Sample'}
            </p>
            <p className="text-xs font-semibold text-rose-200/90 m-0 mt-0.5">
              Tracking: <span className="font-mono font-bold text-white">{caseData.lab_details?.lab_id || 'LAB-REQ'}</span> • Priority: {caseData.lab_details?.urgency || 'Urgent'}
            </p>
            <span className="text-[11px] font-bold text-rose-400/80 block mt-1.5">
              Field scout assigned for sample collection
            </span>
          </div>
        </div>
      )}

      {caseData.status === 'Pending Review' && (
        <div className="mx-5 mt-4 p-3.5 bg-amber-950/50 border border-amber-500/50 rounded-2xl flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="text-xs font-black text-amber-400 block">Pending Extension Officer Review</span>
            <p className="text-xs font-semibold text-slate-300 m-0 mt-0.5">
              Review AI diagnosis and select one of the 3 actions below to certify this case.
            </p>
          </div>
        </div>
      )}

      {/* 3 Action Buttons */}
      <div className="p-5 space-y-3">
        {/* 1. Confirm */}
        <button
          id="btn-confirm-diagnosis"
          type="button"
          onClick={() => onAction('confirm')}
          className="group w-full btn-touch min-h-[64px] flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-900/30 hover:bg-emerald-600 hover:border-emerald-400 transition-all duration-200 text-left"
        >
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-600/50 group-hover:bg-white/20 flex items-center justify-center border border-emerald-500/30 transition-colors">
            <CheckCircle2 className="w-6 h-6 text-emerald-300 group-hover:text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-white">✅ Confirm Diagnosis</div>
            <div className="text-xs font-semibold text-emerald-300/80 group-hover:text-emerald-100 mt-0.5 line-clamp-1">
              AI is correct — approve and notify farmer
            </div>
          </div>
        </button>

        {/* 2. Override */}
        <button
          id="btn-override-diagnosis"
          type="button"
          onClick={() => onAction('override')}
          className="group w-full btn-touch min-h-[64px] flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-purple-500/40 bg-purple-900/20 hover:bg-purple-700 hover:border-purple-400 transition-all duration-200 text-left"
        >
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-purple-600/40 group-hover:bg-white/20 flex items-center justify-center border border-purple-500/30 transition-colors">
            <AlertTriangle className="w-6 h-6 text-purple-300 group-hover:text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-white">✏️ Override Diagnosis</div>
            <div className="text-xs font-semibold text-purple-300/80 group-hover:text-purple-100 mt-0.5 line-clamp-1">
              AI is wrong — enter the correct disease
            </div>
          </div>
        </button>

        {/* 3. Lab Test */}
        <button
          id="btn-request-lab"
          type="button"
          onClick={() => onAction('lab')}
          className="group w-full btn-touch min-h-[64px] flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-rose-500/40 bg-rose-900/20 hover:bg-rose-700 hover:border-rose-400 transition-all duration-200 text-left"
        >
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-rose-600/40 group-hover:bg-white/20 flex items-center justify-center border border-rose-500/30 transition-colors">
            <FlaskConical className="w-6 h-6 text-rose-300 group-hover:text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-white">🧪 Request Lab Test</div>
            <div className="text-xs font-semibold text-rose-300/80 group-hover:text-rose-100 mt-0.5 line-clamp-1">
              Uncertain — send for lab confirmation
            </div>
          </div>
        </button>
      </div>

      {/* Footer note */}
      <div className="px-5 pb-5">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 font-semibold m-0 leading-relaxed">
            Your validation is logged with a timestamp and your officer ID. This creates the official case record for {caseData.farmer_name || 'the farmer'}.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MAIN PAGE */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function OfficerCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [overridePrefill, setOverridePrefill] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const found = await getCaseById(id);
      setCaseData(found);
      setLoading(false);
    }
    load();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleConfirmSubmit = async ({ notes, adjustedDosage }) => {
    const updated = await updateCaseStatus(caseData.id || caseData.case_id, {
      status: 'Confirmed',
      notes: notes || 'Confirmed by officer',
      adjustedDosage,
    });
    if (updated) {
      setCaseData({ ...updated });
      setActiveModal(null);
      showToast('✅ Diagnosis confirmed — farmer notified.');
    }
  };

  const handleOverrideSubmit = async ({ newDisease, newSeverity, reason, updatedAdvice }) => {
    const updated = await updateCaseStatus(caseData.id || caseData.case_id, {
      status: 'Overridden',
      notes: reason,
      updatedDisease: newDisease,
      newSeverity,
      updatedAdvice,
    });
    if (updated) {
      setCaseData({ ...updated });
      setActiveModal(null);
      showToast(`✏️ Diagnosis updated to "${newDisease}"`);
    }
  };

  const handleLabSubmit = async ({ sampleType, urgency, samplingInstructions }) => {
    const labId = 'LAB-' + Math.floor(1000 + Math.random() * 9000);
    const updated = await updateCaseStatus(caseData.id || caseData.case_id, {
      status: 'Lab Test Requested',
      labDetails: {
        lab_id: labId, sampleType, urgency,
        samplingInstructions, date: new Date().toISOString(),
      },
    });
    if (updated) {
      setCaseData({ ...updated });
      setActiveModal(null);
      showToast(`🧪 Lab sample dispatched (Tracking: ${labId})`);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-bold">Loading case details…</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-black text-slate-800">Case Not Found</h2>
        <p className="text-base font-bold text-slate-600">
          Case #{id} does not exist in the database.
        </p>
        <button
          onClick={() => navigate('/officer')}
          className="btn-touch px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-black text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  /* ── Derived values ── */
  const displayImage = caseData.image_url || caseData.originalImage;
  const topPredictions = caseData.top3 || caseData.topPredictions || [];

  /* ────────────────────────────────────────────────────────────── */
  /* RENDER */
  /* ────────────────────────────────────────────────────────────── */
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-0">

      {/* ── TOAST ── */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-[60] bg-slate-900 text-white font-black text-sm px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HEADER BAR */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-slate-100/95 backdrop-blur-md py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-slate-200 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Back + Breadcrumb */}
          <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-500">
            <Link
              id="btn-back-to-dashboard"
              to="/officer"
              className="flex items-center gap-1.5 bg-white border-2 border-slate-300 hover:border-emerald-500 hover:text-emerald-800 px-3.5 py-2 rounded-xl shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-slate-400 hidden sm:inline">›</span>
            <span className="hidden sm:inline text-slate-700 font-black">
              {caseData.case_id || `Case #${caseData.id}`}
            </span>
          </div>

          {/* Case ID + Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-sm shadow-sm">
              <Leaf className="w-4 h-4 text-emerald-700" />
              <span className="font-black text-slate-900">{caseData.case_id || `Case #${caseData.id}`}</span>
            </div>
            <StatusBadge status={caseData.status} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FARMER INFO CARD */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-5 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
              {(caseData.farmer_name || 'F').charAt(0)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight">
                {caseData.farmer_name || 'Unknown Farmer'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-sm font-bold text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  {caseData.village}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(caseData.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: phone + crop + status pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {caseData.farmer_phone && (
              <a
                href={`tel:${caseData.farmer_phone}`}
                className="btn-touch px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold text-sm flex items-center gap-2 border border-slate-300 transition"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>{caseData.farmer_phone}</span>
              </a>
            )}
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-950 font-black px-4 py-2 rounded-2xl border-2 border-emerald-300">
              <span className="text-xl">{getCropIcon(caseData.crop)}</span>
              <span className="text-sm">{caseData.crop}</span>
            </div>
            <SeverityBadge severity={caseData.severity} />
            <RiskBadge risk={caseData.risk} />
          </div>
        </div>

        {/* Officer notes banner */}
        {caseData.officer_notes && (
          <div className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-2xl p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-purple-900 uppercase tracking-wider">Officer Note:</span>
              <p className="text-sm font-bold text-purple-950 m-0 mt-0.5">"{caseData.officer_notes}"</p>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TWO-COLUMN MAIN LAYOUT */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* ────────────────────────────────────────────────────── */}
        {/* LEFT: VISUAL + PREDICTIONS + RISK + ADVISORY          */}
        {/* ────────────────────────────────────────────────────── */}
        <div className="xl:col-span-7 space-y-6">

          {/* ── SECTION 1: CROP IMAGES ── */}
          <section>
            <SectionTitle
              icon={Leaf}
              label="Section 1 — Crop Images"
              sub="Original leaf photo and AI disease heatmap"
              accent="emerald"
            />
            <HeatmapViewer
              originalImage={displayImage}
              imageUrl={displayImage}
              heatmapUrl={caseData.heatmap_url}
              affectedAreaPercentage={caseData.affected_pct || 40}
              cropName={caseData.crop}
            />
          </section>

          {/* ── SECTION 3: RISK DETAILS ── */}
          <section>
            <SectionTitle
              icon={ShieldAlert}
              label="Section 3 — Risk Details"
              sub="Reasons contributing to the 72-hour risk level"
              accent="amber"
            />
            <RiskReasonsCard caseData={caseData} />
          </section>

          {/* ── SECTION 4: TOP 3 PREDICTIONS ── */}
          <section>
            <SectionTitle
              icon={BarChart3}
              label="Section 4 — Top 3 AI Predictions"
              sub="Alternative possibilities ranked by confidence"
              accent="violet"
            />
            <TopPredictionsCard
              topPredictions={topPredictions}
              currentConfirmedDisease={caseData.disease}
              onSelectForOverride={(candidate) => {
                setOverridePrefill(candidate);
                setActiveModal('override');
              }}
            />
          </section>

          {/* ── SECTION 5: AI ADVISORY ── */}
          <section>
            <SectionTitle
              icon={Brain}
              label="Section 5 — AI Advisory"
              sub="Expert guidance generated from the AI diagnosis"
              accent="slate"
            />
            <AIAdvisorySection caseData={caseData} />
          </section>

        </div>

        {/* ────────────────────────────────────────────────────── */}
        {/* RIGHT: DIAGNOSIS STATS + ACTION CONSOLE              */}
        {/* ────────────────────────────────────────────────────── */}
        <div className="xl:col-span-5 space-y-6">

          {/* ── SECTION 2: AI DIAGNOSIS ── */}
          <section>
            <SectionTitle
              icon={Microscope}
              label="Section 2 — AI Diagnosis"
              sub="Full breakdown of the AI detection result"
              accent="blue"
            />

            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
              {/* Diagnosis Hero */}
              <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                      AI Detected Disease
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-950 m-0 mt-1 leading-tight">
                      {caseData.disease}
                    </h3>
                  </div>
                  {/* Confidence Ring */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-300">
                    <span className="text-2xl font-black text-emerald-800 leading-none">
                      {caseData.confidence}%
                    </span>
                    <span className="text-xs font-bold text-emerald-600 mt-0.5">Confidence</span>
                  </div>
                </div>

                {/* Summary */}
                {caseData.simple_summary && (
                  <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 leading-relaxed">
                    {caseData.simple_summary}
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCell
                    icon={Leaf}
                    label="Crop"
                    value={`${getCropIcon(caseData.crop)} ${caseData.crop}`}
                    iconColor="text-emerald-600"
                  />
                  <StatCell
                    icon={Activity}
                    label="Severity"
                    value={<SeverityBadge severity={caseData.severity} />}
                    iconColor="text-red-500"
                  />
                  <StatCell
                    icon={Percent}
                    label="Leaf Affected"
                    value={`${caseData.affected_pct}%`}
                    iconColor="text-orange-500"
                    highlight={caseData.affected_pct >= 50}
                  />
                  <StatCell
                    icon={TrendingUp}
                    label="72h Risk"
                    value={<RiskBadge risk={caseData.risk} />}
                    iconColor="text-amber-500"
                  />
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">AI Confidence</span>
                    <span className="text-sm font-black text-emerald-800">{caseData.confidence}%</span>
                  </div>
                  <ConfidenceBar value={caseData.confidence} colorClass={
                    caseData.confidence >= 85 ? 'bg-emerald-600' :
                    caseData.confidence >= 65 ? 'bg-amber-500' : 'bg-red-500'
                  } />
                  <p className="text-xs text-slate-500 font-semibold">
                    {caseData.confidence >= 90
                      ? 'Very high confidence — AI result is reliable'
                      : caseData.confidence >= 75
                      ? 'Good confidence — verify with visual inspection'
                      : 'Lower confidence — officer judgment critical'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION 6: OFFICER VALIDATION ACTIONS ── */}
          <section className="xl:sticky xl:top-[88px]">
            <SectionTitle
              icon={Gavel}
              label="Section 6 — Officer Validation"
              sub="Choose your decision to update the official case record"
              accent="rose"
            />
            <OfficerActionConsole
              caseData={caseData}
              onAction={(type) => {
                if (type !== 'override') setOverridePrefill(null);
                setActiveModal(type);
              }}
            />
          </section>

        </div>
      </div>

      {/* ── MODALS ── */}
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
