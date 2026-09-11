import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  Info
} from 'lucide-react';

export default function VillageOverviewTable({ 
  cases = [], 
  selectedVillage = 'all', 
  onSelectVillage 
}) {
  // Dynamically group and derive metrics from cases data
  const villageMap = {};

  cases.forEach((c) => {
    const vName = c.village || 'Unknown';
    if (!villageMap[vName]) {
      villageMap[vName] = {
        name: vName,
        total: 0,
        trace: 0,
        mild: 0,
        moderate: 0,
        severe: 0,
        highRisk: 0,
      };
    }

    const row = villageMap[vName];
    row.total += 1;

    const sev = (c.severity || '').toLowerCase();
    if (sev === 'trace') row.trace += 1;
    else if (sev === 'mild') row.mild += 1;
    else if (sev === 'moderate') row.moderate += 1;
    else if (sev === 'severe' || sev === 'critical') row.severe += 1;

    const risk = (c.risk || c.risk_72h?.level || '').toLowerCase();
    if (risk === 'high' || risk === 'critical') row.highRisk += 1;
  });

  const villageList = Object.values(villageMap).sort((a, b) => {
    // Sort primarily by highest severe + highRisk cases
    const scoreA = a.severe * 2 + a.highRisk * 2 + a.total;
    const scoreB = b.severe * 2 + b.highRisk * 2 + b.total;
    return scoreB - scoreA;
  });

  // Totals across all villages
  const totals = villageList.reduce(
    (acc, v) => {
      acc.total += v.total;
      acc.trace += v.trace;
      acc.mild += v.mild;
      acc.moderate += v.moderate;
      acc.severe += v.severe;
      acc.highRisk += v.highRisk;
      return acc;
    },
    { total: 0, trace: 0, mild: 0, moderate: 0, severe: 0, highRisk: 0 }
  );

  const flaggedVillagesCount = villageList.filter(
    (v) => v.severe >= 2 || v.highRisk >= 2
  ).length;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-300">
            <Building2 className="w-6 h-6 text-emerald-800" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight">
              Village Overview
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 m-0 mt-0.5">
              Aggregated surveillance data across all active village clusters
            </p>
          </div>
        </div>

        {/* Attention Summary Chip */}
        {flaggedVillagesCount > 0 && (
          <div className="inline-flex items-center gap-2 bg-amber-50 border-2 border-amber-300 text-amber-950 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-black shadow-sm self-start sm:self-auto">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{flaggedVillagesCount} Villages Need Attention</span>
          </div>
        )}
      </div>

      {/* Info Callout Banner */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Highlighted rows identify villages with <strong>multiple severe cases</strong> or <strong>multiple high-risk cases</strong> for prioritized inspection.
          </span>
        </div>
        {selectedVillage !== 'all' && onSelectVillage && (
          <button
            type="button"
            onClick={() => onSelectVillage('all')}
            className="text-xs font-black text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto whitespace-nowrap"
          >
            Clear village filter (Showing: {selectedVillage})
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-black text-slate-700 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Village Name</th>
              <th className="py-3.5 px-3 text-center">Total Cases</th>
              <th className="py-3.5 px-3 text-center">Trace</th>
              <th className="py-3.5 px-3 text-center">Mild</th>
              <th className="py-3.5 px-3 text-center">Moderate</th>
              <th className="py-3.5 px-3 text-center">Severe Cases</th>
              <th className="py-3.5 px-3 text-center">High Risk Cases</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Priority Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {villageList.map((v) => {
              const hasMultipleSevere = v.severe >= 2;
              const hasMultipleHighRisk = v.highRisk >= 2;
              const isHotspot = hasMultipleSevere && hasMultipleHighRisk;
              const isSelected = selectedVillage.toLowerCase() === v.name.toLowerCase();

              return (
                <tr
                  key={v.name}
                  onClick={() => onSelectVillage && onSelectVillage(v.name)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-50/90 ring-2 ring-emerald-500 ring-inset'
                      : isHotspot
                      ? 'bg-red-50/50 hover:bg-red-50'
                      : hasMultipleSevere || hasMultipleHighRisk
                      ? 'bg-amber-50/40 hover:bg-amber-50/80'
                      : 'hover:bg-slate-50'
                  }`}
                  title={onSelectVillage ? `Click to filter cases by ${v.name}` : undefined}
                >
                  {/* Village Name */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border shrink-0 ${
                        isHotspot 
                          ? 'bg-red-100 text-red-800 border-red-300' 
                          : hasMultipleSevere || hasMultipleHighRisk
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-950 text-base group-hover:text-emerald-800 transition">
                            {v.name}
                          </span>
                          {isSelected && (
                            <span className="text-[11px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                              Filtered
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-semibold block">
                          Cluster ID: CLU-{v.name.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Total Cases */}
                  <td className="py-4 px-3 text-center">
                    <span className="inline-flex items-center justify-center font-black text-base px-3 py-1 bg-slate-100 text-slate-900 rounded-xl border border-slate-300">
                      {v.total}
                    </span>
                  </td>

                  {/* Trace Cases */}
                  <td className="py-4 px-3 text-center">
                    <span className="inline-flex items-center justify-center font-bold text-sm px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                      {v.trace}
                    </span>
                  </td>

                  {/* Mild Cases */}
                  <td className="py-4 px-3 text-center">
                    <span className="inline-flex items-center justify-center font-bold text-sm px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                      {v.mild}
                    </span>
                  </td>

                  {/* Moderate Cases */}
                  <td className="py-4 px-3 text-center">
                    <span className="inline-flex items-center justify-center font-bold text-sm px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                      {v.moderate}
                    </span>
                  </td>

                  {/* Severe Cases (Highlighted if Multiple >= 2) */}
                  <td className="py-4 px-3 text-center">
                    {hasMultipleSevere ? (
                      <span className="inline-flex items-center gap-1.5 font-black text-sm px-3 py-1 bg-red-100 text-red-950 rounded-xl border-2 border-red-400 shadow-sm animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                        <span>{v.severe} Severe</span>
                      </span>
                    ) : v.severe > 0 ? (
                      <span className="inline-flex items-center justify-center font-bold text-sm px-2.5 py-1 bg-red-50 text-red-800 rounded-lg border border-red-200">
                        {v.severe}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold">0</span>
                    )}
                  </td>

                  {/* High Risk Cases (Highlighted if Multiple >= 2) */}
                  <td className="py-4 px-3 text-center">
                    {hasMultipleHighRisk ? (
                      <span className="inline-flex items-center gap-1.5 font-black text-sm px-3 py-1 bg-rose-600 text-white rounded-xl shadow-sm">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-200 shrink-0" />
                        <span>{v.highRisk} High Risk</span>
                      </span>
                    ) : v.highRisk > 0 ? (
                      <span className="inline-flex items-center justify-center font-bold text-sm px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
                        {v.highRisk}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold">0</span>
                    )}
                  </td>

                  {/* Priority Status Badge */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    {isHotspot ? (
                      <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm">
                        <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>High Attention</span>
                      </span>
                    ) : hasMultipleSevere ? (
                      <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-100" />
                        <span>Multiple Severe</span>
                      </span>
                    ) : hasMultipleHighRisk ? (
                      <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-100" />
                        <span>High Risk Focus</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Stable</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Total Summary */}
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-black text-xs sm:text-sm text-slate-900">
              <td className="py-3.5 px-4 sm:px-6 uppercase tracking-wider text-slate-700">
                Total Across Villages
              </td>
              <td className="py-3.5 px-3 text-center">
                <span className="px-2.5 py-1 bg-slate-200 text-slate-900 rounded-lg">
                  {totals.total}
                </span>
              </td>
              <td className="py-3.5 px-3 text-center text-emerald-900">
                {totals.trace}
              </td>
              <td className="py-3.5 px-3 text-center text-blue-900">
                {totals.mild}
              </td>
              <td className="py-3.5 px-3 text-center text-amber-900">
                {totals.moderate}
              </td>
              <td className="py-3.5 px-3 text-center">
                <span className="px-2 py-0.5 bg-red-100 text-red-900 rounded font-black">
                  {totals.severe}
                </span>
              </td>
              <td className="py-3.5 px-3 text-center">
                <span className="px-2 py-0.5 bg-rose-100 text-rose-900 rounded font-black">
                  {totals.highRisk}
                </span>
              </td>
              <td className="py-3.5 px-4 sm:px-6 text-right text-xs text-slate-500 font-bold">
                {villageList.length} Active Villages
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}
