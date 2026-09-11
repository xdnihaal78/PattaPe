import React from 'react';
import { Sprout } from 'lucide-react';

export default function CropDistributionChart({ cropStats, onCropSelect, selectedCrop = 'all' }) {
  // Built from 40 seed cases or live data
  const defaultCrops = [
    {
      id: 'Rice',
      name: 'Rice (धान)',
      icon: '🌾',
      total: 8,
      healthy: 2,
      at_risk: 3,
      infected: 3,
      topDisease: 'Rice Leaf Blast'
    },
    {
      id: 'Chilli',
      name: 'Chilli (मिर्च)',
      icon: '🌶️',
      total: 8,
      healthy: 2,
      at_risk: 2,
      infected: 4,
      topDisease: 'Chilli Leaf Curl'
    },
    {
      id: 'Banana',
      name: 'Banana (केला)',
      icon: '🍌',
      total: 8,
      healthy: 2,
      at_risk: 3,
      infected: 3,
      topDisease: 'Sigatoka Spot'
    },
    {
      id: 'Groundnut',
      name: 'Groundnut (मूंगफली)',
      icon: '🥜',
      total: 8,
      healthy: 2,
      at_risk: 3,
      infected: 3,
      topDisease: 'Tikka Disease'
    },
    {
      id: 'Sugarcane',
      name: 'Sugarcane (गन्ना)',
      icon: '🎋',
      total: 8,
      healthy: 2,
      at_risk: 3,
      infected: 3,
      topDisease: 'Red Rot'
    }
  ];

  const crops = defaultCrops.map((c) => {
    if (cropStats && cropStats[c.id]) {
      return {
        ...c,
        total: cropStats[c.id].total,
        healthy: cropStats[c.id].healthy,
        at_risk: cropStats[c.id].at_risk,
        infected: cropStats[c.id].infected
      };
    }
    return c;
  });

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-5 sm:p-6 space-y-5 flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-300">
              <Sprout className="w-6 h-6 text-emerald-800 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0">
                Cases by Crop
              </h3>
              <p className="text-sm font-semibold text-slate-500 m-0">
                Health condition across the 5 crops
              </p>
            </div>
          </div>

          <span className="text-xs font-black bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-300">
            5 Crops
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-3 pt-3 text-xs sm:text-sm font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
            <span>Healthy</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
            <span>At Risk</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600" />
            <span>Infected</span>
          </span>
        </div>
      </div>

      {/* Crop Progress Bars List */}
      <div className="space-y-4 pt-1">
        {crops.map((crop) => {
          const healthyPct = Math.round((crop.healthy / crop.total) * 100);
          const atRiskPct = Math.round((crop.at_risk / crop.total) * 100);
          const infectedPct = Math.max(0, 100 - healthyPct - atRiskPct);
          const isSelected = selectedCrop.toLowerCase() === crop.id.toLowerCase();

          return (
            <div
              key={crop.id}
              onClick={() => onCropSelect && onCropSelect(isSelected ? 'all' : crop.id)}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 shadow-md'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    {crop.icon}
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 m-0 leading-tight">
                      {crop.name}
                    </h4>
                    <span className="text-xs font-bold text-slate-500">
                      Main issue: <span className="text-red-700 font-black">{crop.topDisease}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-slate-900">
                    {crop.total} cases
                  </span>
                </div>
              </div>

              {/* Segmented Stacked Progress Bar */}
              <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden flex border border-slate-300 p-0.5">
                <div
                  title={`Healthy: ${crop.healthy} (${healthyPct}%)`}
                  className="bg-emerald-600 h-full rounded-l-full transition-all duration-500"
                  style={{ width: `${healthyPct}%` }}
                />
                <div
                  title={`At Risk: ${crop.at_risk} (${atRiskPct}%)`}
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{ width: `${atRiskPct}%` }}
                />
                <div
                  title={`Infected: ${crop.infected} (${infectedPct}%)`}
                  className="bg-red-600 h-full rounded-r-full transition-all duration-500"
                  style={{ width: `${infectedPct}%` }}
                />
              </div>

              {/* Breakdown numbers underneath in simple clear text */}
              <div className="flex items-center justify-between pt-2 text-xs sm:text-sm font-extrabold text-slate-600">
                <span className="text-emerald-800">Healthy: {crop.healthy}</span>
                <span className="text-amber-800">At Risk: {crop.at_risk}</span>
                <span className="text-red-800">Infected: {crop.infected}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer helper */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600">
        <span>Click any crop to filter the cases table</span>
        {selectedCrop !== 'all' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCropSelect && onCropSelect('all');
            }}
            className="font-black text-emerald-700 underline"
          >
            Show all crops
          </button>
        )}
      </div>

    </div>
  );
}
