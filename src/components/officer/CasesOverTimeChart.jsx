import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format ISO date string → "8 Sep", "9 Sep", etc. */
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-xl p-4 min-w-[160px]">
      <p className="text-sm font-black text-slate-900 mb-2.5 flex items-center gap-1.5">
        📅 <span>{label}</span>
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs font-bold py-0.5">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ background: entry.color }}
            />
            <span className="text-slate-600">{entry.name}</span>
          </span>
          <span className="font-black text-slate-900">{entry.value}</span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs font-black text-slate-900">
        <span>Total</span>
        <span>{total} cases</span>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * CasesOverTimeChart
 *
 * Props:
 *  cases – full array of case objects from getCases(); data is derived here.
 *           Each case must have: created_at (ISO string), severity, risk, disease.
 */
export default function CasesOverTimeChart({ cases = [] }) {
  // Aggregate cases by calendar date, counting Healthy / At Risk / Infected
  const chartData = useMemo(() => {
    const byDate = {};

    cases.forEach((c) => {
      const dateKey = fmtDate(c.created_at);
      if (!byDate[dateKey]) {
        byDate[dateKey] = { date: dateKey, _ts: new Date(c.created_at).setHours(0,0,0,0), Healthy: 0, 'At Risk': 0, Infected: 0 };
      }
      if (c.disease?.startsWith('Healthy') || c.severity === 'trace') {
        byDate[dateKey].Healthy += 1;
      } else if (c.severity === 'severe' || c.risk === 'high') {
        byDate[dateKey].Infected += 1;
      } else {
        byDate[dateKey]['At Risk'] += 1;
      }
    });

    // Sort chronologically
    return Object.values(byDate).sort((a, b) => a._ts - b._ts);
  }, [cases]);

  const totalCases = cases.length;
  const dateRange =
    chartData.length >= 2
      ? `${chartData[0].date} – ${chartData[chartData.length - 1].date}`
      : chartData[0]?.date ?? '—';

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-5 sm:p-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-100 rounded-2xl border border-blue-300">
            <TrendingUp className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-tight">
              Cases Over Time
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 m-0">
              Daily case volume across all active villages
            </p>
          </div>
        </div>
        <span className="text-xs font-black bg-blue-50 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200 whitespace-nowrap">
          {totalCases} total
        </span>
      </div>

      {/* Recharts Stacked Area Chart */}
      <div style={{ width: '100%', height: 268 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 6, right: 8, left: -22, bottom: 4 }}
          >
            <defs>
              <linearGradient id="gradHealthy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#059669" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="gradAtRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="gradInfected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
            <Legend
              iconType="circle"
              iconSize={9}
              wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 6 }}
              formatter={(value) => (
                <span style={{ color: '#475569' }}>{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="Healthy"
              stackId="a"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#gradHealthy)"
              dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="At Risk"
              stackId="a"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#gradAtRisk)"
              dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="Infected"
              stackId="a"
              stroke="#dc2626"
              strokeWidth={2}
              fill="url(#gradInfected)"
              dot={{ r: 3, fill: '#dc2626', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>Data range: {dateRange}</span>
        <span className="text-emerald-800 font-extrabold">
          {chartData.length} day{chartData.length !== 1 ? 's' : ''} of records
        </span>
      </div>

    </div>
  );
}