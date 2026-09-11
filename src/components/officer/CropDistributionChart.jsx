import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Sprout } from 'lucide-react';

// Crop meta: icons & display names
const CROP_META = {
  Rice:      { icon: '🌾' },
  Chilli:    { icon: '🌶️' },
  Banana:    { icon: '🍌' },
  Groundnut: { icon: '🥜' },
  Sugarcane: { icon: '🎋' },
};

const CROP_ORDER = ['Rice', 'Chilli', 'Banana', 'Groundnut', 'Sugarcane'];

// Custom rich tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  const meta = CROP_META[label] || {};
  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-xl p-4 min-w-[160px]">
      <p className="text-base font-black text-slate-900 mb-2 flex items-center gap-1.5">
        <span>{meta.icon}</span>
        <span>{label}</span>
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-sm font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: entry.fill }} />
            <span className="text-slate-600">{entry.name}</span>
          </span>
          <span className="font-black text-slate-900">{entry.value}</span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
        <span>Total</span>
        <span>{total} cases</span>
      </div>
    </div>
  );
}

// X-axis tick with emoji above crop name
function CropTick({ x, y, payload }) {
  const meta = CROP_META[payload.value] || {};
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="middle" fontSize={18}>
        {meta.icon || '🌱'}
      </text>
      <text x={0} y={22} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">
        {payload.value}
      </text>
    </g>
  );
}

export default function CropDistributionChart({ cropStats, onCropSelect, selectedCrop = 'all' }) {
  // Derive chart data dynamically from the stats.by_crop object
  const chartData = CROP_ORDER.map((crop) => {
    const s = cropStats?.[crop] || { total: 0, healthy: 0, at_risk: 0, infected: 0 };
    return {
      name: crop,
      Healthy:   s.healthy,
      'At Risk': s.at_risk,
      Infected:  s.infected,
    };
  });

  const totalCases = chartData.reduce((s, d) => s + d.Healthy + d['At Risk'] + d.Infected, 0);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-5 sm:p-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-100 rounded-2xl border border-emerald-300">
            <Sprout className="w-5 h-5 text-emerald-800 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight">
              Cases by Crop
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 m-0">
              Disease breakdown across 5 monitored crops
            </p>
          </div>
        </div>
        <span className="text-xs font-black bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 whitespace-nowrap">
          {totalCases} total
        </span>
      </div>

      {/* Recharts Stacked Bar Chart */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 28 }}
            barCategoryGap="28%"
            onClick={(data) => {
              if (data && data.activeLabel && onCropSelect) {
                const clicked = data.activeLabel;
                onCropSelect(selectedCrop === clicked ? 'all' : clicked);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={<CropTick />}
              tickLine={false}
              axisLine={false}
              interval={0}
              height={48}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 8 }} />
            <Legend
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 4 }}
              formatter={(value) => (
                <span style={{ color: '#475569' }}>{value}</span>
              )}
            />
            <Bar dataKey="Healthy"  stackId="a" fill="#059669" />
            <Bar dataKey="At Risk"  stackId="a" fill="#f59e0b" />
            <Bar dataKey="Infected" stackId="a" fill="#dc2626" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => {
                const isSelected = selectedCrop === entry.name;
                return (
                  <Cell
                    key={i}
                    stroke={isSelected ? '#0f172a' : 'transparent'}
                    strokeWidth={isSelected ? 2 : 0}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>Click a bar to filter the cases table below</span>
        {selectedCrop !== 'all' && (
          <button
            onClick={() => onCropSelect && onCropSelect('all')}
            className="font-black text-emerald-700 underline"
          >
            Show all crops
          </button>
        )}
      </div>

    </div>
  );
}

