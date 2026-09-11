import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FlaskConical, 
  Send, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';

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

  // Lab modal state
  const [sampleType, setSampleType] = useState('Leaf Tissue Sample');
  const [urgency, setUrgency] = useState('Urgent (24h)');
  const [samplingInstructions, setSamplingInstructions] = useState('');

  // Reset and prefill when modal opens
  useEffect(() => {
    if (!caseData) return;

    if (activeModal === 'confirm') {
      const disease = caseData.disease || caseData.aiDiagnosis?.diseaseName || 'Disease';
      setConfirmNotes(`Diagnosis confirmed by Extension Officer. Visual spots match ${disease}.`);
      setAdjustedDosage(caseData.recommended_treatment || caseData.farmerAdvisory?.chemical || '');
    }

    if (activeModal === 'override') {
      if (prefilledOverrideCandidate) {
        setNewDisease(prefilledOverrideCandidate.name || prefilledOverrideCandidate.diseaseName);
        setNewSeverity(prefilledOverrideCandidate.severity || 'moderate');
        setOverrideReason(`Inspection shows symptoms of ${prefilledOverrideCandidate.name || prefilledOverrideCandidate.diseaseName}.`);
      } else {
        const alt = caseData.top3?.[1] || caseData.topPredictions?.[1];
        setNewDisease(alt?.name || alt?.diseaseName || 'Brown Spot');
        setNewSeverity('moderate');
        setOverrideReason('Disease spots look different from primary AI prediction.');
      }
      setUpdatedAdvice('Spray copper-based fungicide @ 2g per liter of water.');
    }

    if (activeModal === 'lab') {
      setSampleType('Leaf Tissue Sample');
      setUrgency('Urgent (24h)');
      setSamplingInstructions(`Collect 5 fresh infected ${caseData.crop || 'crop'} leaves with active spots. Wrap in clean moisture pack.`);
    }
  }, [activeModal, caseData, prefilledOverrideCandidate]);

  if (!activeModal || !caseData) return null;

  const currentDiseaseName = caseData.disease || caseData.aiDiagnosis?.diseaseName || 'Crop Disease';
  const currentConfidence = caseData.confidence || caseData.aiDiagnosis?.confidence || 90;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl border-4 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        
        {/* ======================================================== */}
        {/* MODAL 1: CONFIRM DIAGNOSIS */}
        {/* ======================================================== */}
        {activeModal === 'confirm' && (
          <div className="border-emerald-700">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black m-0">Confirm AI Diagnosis</h3>
                  <p className="text-xs sm:text-sm text-emerald-200 font-semibold m-0">
                    Agree with the AI result and approve advice for farmer
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-emerald-200 hover:text-white font-black text-2xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Diagnosis Summary Banner */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-300 space-y-1">
                <span className="text-xs font-black uppercase text-emerald-800">
                  Detected Problem:
                </span>
                <h4 className="text-xl font-black text-slate-950 m-0">
                  {currentDiseaseName}
                </h4>
                <p className="text-sm font-semibold text-slate-600 m-0">
                  Crop: <span className="font-extrabold text-slate-900">{caseData.crop}</span> • AI Confidence: <span className="font-extrabold text-emerald-800">{currentConfidence}%</span>
                </p>
              </div>

              {/* Officer Note */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Officer Remarks for Farmer
                </label>
                <textarea
                  rows="3"
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  placeholder="Type any advice or notes for the farmer..."
                />
              </div>

              {/* Recommended Spray / Dosage */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Recommended Spray &amp; Dose
                </label>
                <textarea
                  rows="2"
                  value={adjustedDosage}
                  onChange={(e) => setAdjustedDosage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  placeholder="Chemical spray and amount per liter of water..."
                />
              </div>

              <div className="flex items-start gap-2 bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Confirming this case will mark it as Verified and notify {caseData.farmer_name || 'the farmer'}.
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
                  type="button"
                  onClick={() => onConfirmSubmit({ notes: confirmNotes, adjustedDosage })}
                  className="btn-touch px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-lg transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, Confirm Diagnosis</span>
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
                <div className="p-2 bg-purple-800 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black m-0">Change Disease Name</h3>
                  <p className="text-xs sm:text-sm text-purple-200 font-semibold m-0">
                    Correct the AI if it identified the wrong disease
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-purple-200 hover:text-white font-black text-2xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Previous Diagnosis Alert */}
              <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-300 flex items-start gap-2.5 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-amber-950 block">Current AI Guess:</span>
                  <p className="text-slate-800 font-bold m-0">
                    "{currentDiseaseName}" ({currentConfidence}% confidence)
                  </p>
                </div>
              </div>

              {/* Select or Type New Disease */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Correct Disease Name
                </label>
                <input
                  type="text"
                  value={newDisease}
                  onChange={(e) => setNewDisease(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  placeholder="Type the actual disease name..."
                />
                
                {/* Candidate Quick Pick Pills */}
                {caseData.top3 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="text-xs font-bold text-slate-500">Pick candidate:</span>
                    {caseData.top3.slice(1).map((pred) => (
                      <button
                        key={pred.name}
                        type="button"
                        onClick={() => setNewDisease(pred.name)}
                        className="text-xs font-black bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-lg transition"
                      >
                        {pred.name} ({pred.confidence}%)
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* New Severity Level */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Damage Level (Severity)
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-purple-600 rounded-xl text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="trace">Trace (Normal / Minimal)</option>
                  <option value="mild">Mild (Early Stage)</option>
                  <option value="moderate">Moderate (Spreading)</option>
                  <option value="severe">Severe (Heavy Damage)</option>
                </select>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Why are you changing it?
                </label>
                <textarea
                  rows="2"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  placeholder="e.g. Leaf spot looks round and has yellow ring, not blast..."
                />
              </div>

              {/* Advice */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  New Advice for Farmer
                </label>
                <textarea
                  rows="2"
                  value={updatedAdvice}
                  onChange={(e) => setUpdatedAdvice(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-purple-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  placeholder="Give new spray or remedy advice..."
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
                  <span>Save New Diagnosis</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: REQUEST LAB TEST */}
        {/* ======================================================== */}
        {activeModal === 'lab' && (
          <div className="border-rose-700">
            {/* Modal Header */}
            <div className="bg-rose-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-800 rounded-xl">
                  <FlaskConical className="w-6 h-6 text-rose-200" />
                </div>
                <div>
                  <h3 className="text-xl font-black m-0">Send Sample to Lab</h3>
                  <p className="text-xs sm:text-sm text-rose-200 font-semibold m-0">
                    Dispatch field scout to collect a plant leaf/stem sample
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-rose-200 hover:text-white font-black text-2xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Sample Type */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Sample Needed
                </label>
                <select
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-rose-600 rounded-xl text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="Leaf Tissue Sample">🍃 Fresh Leaf Sample</option>
                  <option value="Stem / Stalk Sample">🎋 Stem / Stalk Sample</option>
                  <option value="Root / Soil Sample">🌱 Root &amp; Soil Sample</option>
                  <option value="Insect Pest Sample">🐛 Insect / Whitefly Sample</option>
                </select>
              </div>

              {/* Urgency */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Speed Needed
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-rose-600 rounded-xl text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="Urgent (24h)">⚡ Urgent (Within 24 hours)</option>
                  <option value="High (48h)">High Priority (Within 48 hours)</option>
                  <option value="Standard (3-5 days)">Standard Routine (3 to 5 days)</option>
                </select>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Instructions for Field Scout
                </label>
                <textarea
                  rows="3"
                  value={samplingInstructions}
                  onChange={(e) => setSamplingInstructions(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 focus:border-rose-600 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none"
                  placeholder="e.g. Cut 5 diseased leaves, put in clean bag, take to KVK lab..."
                />
              </div>

              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-950 font-bold">
                Field scout will visit {caseData.farmer_name || 'farmer'}'s field in {caseData.village} to collect sample.
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
                  type="button"
                  onClick={() => onLabSubmit({
                    sampleType,
                    urgency,
                    samplingInstructions
                  })}
                  className="btn-touch px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-lg transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Lab Request</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
