import React from 'react';
import { Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TopPredictionsCard({ 
  topPredictions = [], 
  currentConfirmedDisease,
  onSelectForOverride 
}) {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden p-5 space-y-4">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300">
            <Award className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 m-0">
              Top 3 Likely Crop Diseases
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 m-0">
              Alternative possibilities identified by the AI system
            </p>
          </div>
        </div>

        <span className="text-xs font-black bg-slate-100 text-slate-800 px-3 py-1 rounded-xl border border-slate-300">
          Ranked Top 3
        </span>
      </div>

      {/* 3 Candidates List */}
      <div className="space-y-3">
        {topPredictions.map((pred, index) => {
          const rank = pred.rank || index + 1;
          const diseaseName = pred.name || pred.diseaseName || 'Crop Disease';
          const confidence = pred.confidence || 50;
          const isPrimary = rank === 1;
          const isCurrentActive = currentConfirmedDisease 
            ? currentConfirmedDisease.toLowerCase() === diseaseName.toLowerCase()
            : isPrimary;

          return (
            <div
              key={rank}
              className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
                isCurrentActive
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-400'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              
              {/* Top: Rank, Disease Name, Probability */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                      isPrimary
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    #{rank}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-slate-950 m-0 leading-tight">
                        {diseaseName}
                      </h4>
                      {isCurrentActive && (
                        <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    {pred.scientificName && (
                      <p className="text-xs italic text-slate-500 font-semibold m-0 mt-0.5">
                        {pred.scientificName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Probability Score */}
                <div className="text-right shrink-0">
                  <span
                    className={`text-lg sm:text-xl font-black ${
                      isPrimary ? 'text-emerald-800' : 'text-slate-800'
                    }`}
                  >
                    {confidence}%
                  </span>
                  <span className="block text-xs font-bold text-slate-500">
                    Confidence
                  </span>
                </div>
              </div>

              {/* Visual Probability Bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPrimary
                      ? 'bg-emerald-600'
                      : confidence > 10
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${Math.max(confidence, 4)}%` }}
                />
              </div>

              {/* Distinguishing trait & Quick Override Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                {pred.distinguishingFeatures ? (
                  <p className="text-slate-600 font-medium m-0 flex-1">
                    <span className="font-extrabold text-slate-800">Note: </span>
                    {pred.distinguishingFeatures}
                  </p>
                ) : (
                  <p className="text-slate-500 font-medium m-0 flex-1">
                    Secondary diagnostic possibility
                  </p>
                )}

                {!isPrimary && onSelectForOverride && (
                  <button
                    type="button"
                    onClick={() => onSelectForOverride(pred)}
                    className="self-end sm:self-auto text-xs font-black text-purple-800 hover:text-purple-950 bg-purple-100 hover:bg-purple-200 border border-purple-300 px-3 py-1.5 rounded-xl flex items-center gap-1 transition shrink-0"
                    title="Choose this disease if AI was mistaken"
                  >
                    <span>Choose this disease</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
