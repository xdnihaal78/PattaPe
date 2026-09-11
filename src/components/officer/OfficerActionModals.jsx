import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FlaskConical, 
  Send, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  ClipboardCheck,
  UserCheck
} from 'lucide-react';

const CROP_DISEASES = {
  rice: [
    'Rice Leaf Blast',
    'Bacterial Leaf Blight',
    'Brown Spot',
    'Bacterial Leaf Streak',
    'Bacterial Panicle Blight',
    'Dead Heart (Stem Borer)',
    'Downy Mildew',
    'Rice Hispa Damage',
    'Tungro Virus',
    'Healthy Rice Leaf'
  ],
  chilli: [
    'Chilli Leaf Curl Virus',
    'Anthracnose / Fruit Rot',
    'Cercospora Leaf Spot',
    'Whitefly Infestation',
    'Yellowish Leaf',
    'Healthy Chilli Leaf'
  ],
  banana: [
    'Black Sigatoka',
    'Yellow Sigatoka',
    'Panama Disease (Fusarium Wilt)',
    'Moko Disease',
    'Bract Mosaic Virus',
    'Cordana Leaf Spot',
    'Pestalotiopsis',
    'Insect Pest Damage',
    'Healthy Banana Leaf'
  ],
  groundnut: [
    'Early Leaf Spot (Tikka)',
    'Late Leaf Spot',
    'Groundnut Rust',
    'Early Rust',
    'Nutritional Deficiency',
    'Healthy Groundnut Leaf'
  ],
  sugarcane: [
    'Red Rot',
    'Sugarcane Rust',
    'Sugarcane Mosaic Virus',
    'Yellow Leaf Disease',
    'Healthy Cane Leaf'
  ]
};

export default function OfficerActionModals({
  activeModal, // 'confirm' | 'override' | 'lab' | null
  onClose,
  caseData,
  onConfirmSubmit,
  onOverrideSubmit,
  onLabSubmit,
  prefilledOverrideCandidate = null
}) {
  // Confirm modal state
  const [confirmNotes, setConfirmNotes] = useState('');
  const [adjustedDosage, setAdjustedDosage] = useState('');

  // Override modal state
  const [newDisease, setNewDisease] = useState('');
  const [newSeverity, setNewSeverity] = useState('moderate');
  const [overrideReason, setOverrideReason] = useState('');
  const [updatedAdvice, setUpdatedAdvice] = useState('');

  // Lab modal state (with 2-step confirmation)
  const [labStep, setLabStep] = useState(1); // 1 = Configure, 2 = Confirmation Step
  const [sampleType, setSampleType] = useState('Leaf Tissue Sample');
  const [urgency, setUrgency] = useState('Urgent (24h)');
  const [samplingInstructions, setSamplingInstructions] = useState('');

  // Reset and prefill when modal opens
  useEffect(() => {
    if (!caseData) return;

    if (activeModal === 'confirm') {
      const disease = caseData.disease || caseData.aiDiagnosis?.diseaseName || 'Disease';
      setConfirmNotes(`Diagnosis confirmed by Extension Officer. Visual inspection matches ${disease}.`);
      setAdjustedDosage(caseData.recommended_treatment || caseData.farmerAdvisory?.chemical || 'Standard ICAR protocol dosage.');
    }

    if (activeModal === 'override') {
      if (prefilledOverrideCandidate) {
        setNewDisease(prefilledOverrideCandidate.disease || prefilledOverrideCandidate.name || prefilledOverrideCandidate.diseaseName || '');
        setNewSeverity(prefilledOverrideCandidate.severity || 'moderate');
        setOverrideReason(`Field inspection reveals distinctive symptoms of ${prefilledOverrideCandidate.disease || prefilledOverrideCandidate.name || 'alternative pathogen'}.`);
      } else {
        const alt = caseData.top3?.[1] || caseData.topPredictions?.[1];
        setNewDisease(alt?.disease || alt?.name || alt?.diseaseName || 'Brown Spot');
        setNewSeverity('moderate');
        setOverrideReason('Visual lesion morphology differs from primary AI prediction.');
      }
      setUpdatedAdvice('Apply recommended protective fungicide / bactericide spray as per revised diagnosis.');
    }

    if (activeModal === 'lab') {
      setLabStep(1);
      setSampleType('Leaf Tissue Sample');
      setUrgency('Urgent (24h)');
      setSamplingInstructions(`Collect 5 fresh infected ${caseData.crop || 'crop'} leaves with active lesion borders. Seal in breathable specimen envelope.`);
    }
  }, [activeModal, caseData, prefilledOverrideCandidate]);

  if (!activeModal || !caseData) return null;

  const currentDiseaseName = caseData.disease || caseData.aiDiagnosis?.diseaseName || 'Crop Disease';
  const currentConfidence = caseData.confidence || caseData.aiDiagnosis?.confidence || 90;
  const cropKey = caseData.crop?.toLowerCase();
  const availableDiseases = CROP_DISEASES[cropKey] || [];
  const topCandidates = (caseData.top3 || caseData.topPredictions || []).slice(0, 3);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl border-4 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        
        {/* ======================================================== */}
        {/* MODAL 1: CONFIRM DIAGNOSIS */}
        {/* ======================================================== */}
        {activeModal === 'confirm' && (
          <div className="border-emerald-600">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-700/80 rounded-2xl border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-xl font-black m-0">Confirm AI Diagnosis</h3>
                  <p className="text-xs sm:text-sm text-emerald-200 font-semibold m-0">
                    Officially validate and approve advisory for {caseData.farmer_name || 'farmer'}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-confirm-modal"
                onClick={onClose}
                className="text-emerald-200 hover:text-white font-black text-2xl p-1 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Diagnosis Summary Banner */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Verified Disease Diagnosis
                  </span>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                    {currentConfidence}% AI Confidence
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-950 m-0">
                  {currentDiseaseName}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 m-0 pt-0.5">
                  Crop: <span className="font-extrabold text-slate-900">{caseData.crop}</span> • Farmer: <span className="font-extrabold text-slate-900">{caseData.farmer_name}</span> ({caseData.village})
                </p>
              </div>

              {/* Officer Note */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Officer Remarks for Field Record
                </label>
                <textarea
                  id="input-confirm-notes"
                  rows="3"
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none transition"
                  placeholder="Notes validating the leaf symptoms match the AI prediction..."
                />
              </div>

              {/* Recommended Spray / Dosage */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Approved Treatment &amp; Dosage Instruction
                </label>
                <textarea
                  id="input-confirm-dosage"
                  rows="2"
                  value={adjustedDosage}
                  onChange={(e) => setAdjustedDosage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none transition"
                  placeholder="Dosage instructions for the farmer..."
                />
              </div>

              <div className="flex items-start gap-2 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Confirming this case immediately updates status to <strong className="font-black text-emerald-900">Confirmed</strong> and creates an official validation log with your officer ID.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-confirm-diagnosis"
                  type="button"
                  onClick={() => onConfirmSubmit({ notes: confirmNotes, adjustedDosage })}
                  className="btn-touch px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-lg transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Diagnosis</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: OVERRIDE / CHANGE DIAGNOSIS */}
        {/* ======================================================== */}
        {activeModal === 'override' && (
          <div className="border-purple-700">
            {/* Modal Header */}
            <div className="bg-purple-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-800/80 rounded-2xl border border-purple-600/30">
                  <AlertTriangle className="w-6 h-6 text-purple-200" />
                </div>
                <div>
                  <h3 className="text-xl font-black m-0">Override AI Diagnosis</h3>
                  <p className="text-xs sm:text-sm text-purple-200 font-semibold m-0">
                    Replace AI diagnosis with your expert clinical evaluation
                  </p>
                </div>
              </div>
              <button
                id="btn-close-override-modal"
                onClick={onClose}
                className="text-purple-200 hover:text-white font-black text-2xl p-1 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Current AI Result Callout */}
              <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-300 flex items-start gap-2.5 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-amber-950 block">Current AI Detection:</span>
                  <p className="text-slate-800 font-bold m-0">
                    "{currentDiseaseName}" ({currentConfidence}% confidence) on <span className="uppercase">{caseData.crop}</span>
                  </p>
                </div>
              </div>

              {/* Quick-Pick Candidate Chips */}
              {topCandidates.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider block">
                    Pick from AI Ranked Candidates:
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {topCandidates.map((cand, idx) => {
                      const name = cand.disease || cand.name || cand.diseaseName;
                      const rawConf = cand.confidence ?? cand.score ?? 0;
                      const conf = rawConf <= 1 && rawConf > 0 ? Math.round(rawConf * 100) : Math.round(rawConf);
                      const isSelected = newDisease.toLowerCase() === name.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewDisease(name)}
                          className={`text-xs font-black px-3 py-1.5 rounded-xl border transition ${
                            isSelected
                              ? 'bg-purple-700 text-white border-purple-800 shadow-sm'
                              : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          #{idx + 1} {name} ({conf}%)
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dropdown of Crop-specific Diseases */}
              {availableDiseases.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                    Choose Replacement Diagnosis for {caseData.crop}
                  </label>
                  <select
                    id="select-override-disease"
                    value={newDisease}
                    onChange={(e) => setNewDisease(e.target.value)}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-purple-600 rounded-xl text-sm font-bold text-slate-900 outline-none"
                  >
                    <option value="">-- Select from standard {caseData.crop} diseases --</option>
                    {availableDiseases.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Or type custom disease */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider block">
                  Or Type Custom Disease / Condition:
                </label>
                <input
                  id="input-override-custom-disease"
                  type="text"
                  value={newDisease}
                  onChange={(e) => setNewDisease(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  placeholder="Enter replacement disease name..."
                />
              </div>

              {/* New Severity Level */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Adjusted Severity Level
                </label>
                <select
                  id="select-override-severity"
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-purple-600 rounded-xl text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="trace">Trace (Minimal damage, non-threatening)</option>
                  <option value="mild">Mild (Early stage infection)</option>
                  <option value="moderate">Moderate (Spreading across canopy)</option>
                  <option value="severe">Severe (Critical damage, emergency action)</option>
                </select>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Clinical Reason for Override *
                </label>
                <textarea
                  id="input-override-reason"
                  rows="2"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  placeholder="Describe morphological or microscopic traits justifying the change..."
                />
              </div>

              {/* Revised Advice */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Revised Treatment Advice for Farmer
                </label>
                <textarea
                  id="input-override-advice"
                  rows="2"
                  value={updatedAdvice}
                  onChange={(e) => setUpdatedAdvice(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  placeholder="Enter updated dosage or corrective advice..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-override-diagnosis"
                  type="button"
                  disabled={!newDisease}
                  onClick={() => onOverrideSubmit({
                    newDisease,
                    newSeverity,
                    reason: overrideReason,
                    updatedAdvice
                  })}
                  className="btn-touch px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-lg transition disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>Apply Override Diagnosis</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: REQUEST LAB TEST (WITH CONFIRMATION STEP)      */}
        {/* ======================================================== */}
        {activeModal === 'lab' && (
          <div className="border-rose-700">
            {/* Modal Header */}
            <div className="bg-rose-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-800/80 rounded-2xl border border-rose-600/30">
                  <FlaskConical className="w-6 h-6 text-rose-200" />
                </div>
                <div>
                  <h3 className="text-xl font-black m-0">
                    {labStep === 1 ? 'Request Lab Confirmation' : 'Confirm Lab Test Dispatch'}
                  </h3>
                  <p className="text-xs sm:text-sm text-rose-200 font-semibold m-0">
                    {labStep === 1 ? 'Step 1 of 2: Configure sampling details' : 'Step 2 of 2: Review and verify order dispatch'}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-lab-modal"
                onClick={onClose}
                className="text-rose-200 hover:text-white font-black text-2xl p-1 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">

              {/* STEP 1: CONFIGURE LAB REQUEST */}
              {labStep === 1 && (
                <>
                  {/* Sample Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                      Sample Type Needed
                    </label>
                    <select
                      id="select-lab-sample-type"
                      value={sampleType}
                      onChange={(e) => setSampleType(e.target.value)}
                      className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-rose-600 rounded-xl text-sm font-bold text-slate-900 outline-none"
                    >
                      <option value="Leaf Tissue Sample">🍃 Fresh Leaf Tissue Sample (Active lesion spots)</option>
                      <option value="Stem / Stalk Sample">🎋 Stem / Stalk Cross-Section Sample</option>
                      <option value="Root / Soil Sample">🌱 Root &amp; Rhizosphere Soil Core Sample</option>
                      <option value="Insect Pest Sample">🐛 Insect Pest / Vector Specimen in Alcohol</option>
                    </select>
                  </div>

                  {/* Urgency */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                      Testing Urgency &amp; SLA
                    </label>
                    <select
                      id="select-lab-urgency"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full p-3 bg-slate-50 border-2 border-rose-600 rounded-xl text-sm font-bold text-slate-900 outline-none"
                    >
                      <option value="Urgent (24h)">⚡ Urgent — High Priority (24h turnaround for disease containment)</option>
                      <option value="High (48h)">🔶 High Priority (48h standard turnaround)</option>
                      <option value="Standard (3-5 days)">🔷 Routine Diagnostic Protocol (3–5 days)</option>
                    </select>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                      Instructions for Field Scout / Collector
                    </label>
                    <textarea
                      id="input-lab-instructions"
                      rows="3"
                      value={samplingInstructions}
                      onChange={(e) => setSamplingInstructions(e.target.value)}
                      className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-rose-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                      placeholder="e.g. Collect 5 fresh leaves with active lesions, avoid wet samples, store in cool container..."
                    />
                  </div>

                  <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-xs text-rose-950 font-bold space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-900 font-black">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Collection Location: {caseData.village}</span>
                    </div>
                    <p className="m-0 text-slate-700 font-semibold">
                      Field scout will be dispatched to {caseData.farmer_name}'s plot to collect the specimen.
                    </p>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-proceed-to-lab-confirm"
                      type="button"
                      onClick={() => setLabStep(2)}
                      className="btn-touch px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-lg transition"
                    >
                      <span>Review &amp; Confirm</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2: CONFIRMATION STEP (User Review & Verification) */}
              {labStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-900">
                      <ClipboardCheck className="w-5 h-5 text-rose-700" />
                      <span className="text-sm font-black uppercase tracking-wide">
                        Lab Dispatch Order Confirmation
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-rose-200">
                        <span className="text-slate-500 font-bold block">Target Farmer:</span>
                        <span className="font-black text-slate-900 text-sm">{caseData.farmer_name}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-rose-200">
                        <span className="text-slate-500 font-bold block">Village Location:</span>
                        <span className="font-black text-slate-900 text-sm">{caseData.village}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-rose-200">
                        <span className="text-slate-500 font-bold block">Specimen Type:</span>
                        <span className="font-black text-rose-900 text-sm">{sampleType}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-rose-200">
                        <span className="text-slate-500 font-bold block">Testing Priority:</span>
                        <span className="font-black text-rose-900 text-sm">{urgency}</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs">
                      <span className="text-slate-500 font-bold block mb-0.5">Collector Instructions:</span>
                      <p className="font-bold text-slate-900 m-0 leading-relaxed">
                        {samplingInstructions || 'Standard leaf specimen collection protocol.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-rose-100/60 p-2.5 rounded-xl border border-rose-200">
                      <UserCheck className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>Case status will update to <strong>Lab Test Requested</strong> upon submission.</span>
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      id="btn-back-to-lab-step1"
                      type="button"
                      onClick={() => setLabStep(1)}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-sm flex items-center gap-1.5 transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Edit</span>
                    </button>
                    <button
                      id="btn-submit-lab-request"
                      type="button"
                      onClick={() => onLabSubmit({
                        sampleType,
                        urgency,
                        samplingInstructions
                      })}
                      className="btn-touch px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-xl transition"
                    >
                      <Send className="w-4 h-4" />
                      <span>Confirm &amp; Dispatch Lab Request</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
