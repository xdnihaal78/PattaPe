import React, { useState } from 'react';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export const DAILY_TIMELINE = [
  { day: 'Mon', date: '5 Sep', total: 165, healthy: 110, atRisk: 35, infected: 20 },
  { day: 'Tue', date: '6 Sep', total: 182, healthy: 118, atRisk: 42, infected: 22 },
  { day: 'Wed', date: '7 Sep', total: 210, healthy: 135, atRisk: 48, infected: 27 },
  { day: 'Thu', date: '8 Sep', total: 245, healthy: 150, atRisk: 60, infected: 35, isPeak: true },
  { day: 'Fri', date: '9 Sep', total: 228, healthy: 142, atRisk: 54, infected: 32 },
  { day: 'Sat', date: '10 Sep', total: 198, healthy: 125, atRisk: 48, infected: 25 },
  { day: 'Sun', date: '11 Sep (Today)', total: 200, healthy: 114, atRisk: 55, infected: 31, isToday: true }
];

export default function CasesOverTimeChart() {
  const [hoveredIndex, setHoveredIndex] = useState(3); // default highlight peak day
  const maxVolume = 260;

  const activeDay = hoveredIndex !== null ? DAILY_TIMELINE[hoveredIndex] : DAILY_TIMELINE[6];

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-5 sm:p-6 space-y-5 flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl border border-blue-300">
              <TrendingUp className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 m-0">
                Cases Over Time
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 m-0">
                Daily diagnosis scan influx &amp; disease trajectory (Last 7 Days)
              </p>
            </div>
          </div>

          <span className="text-xs font-black bg-blue-50 text-blue-900 px-3 py-1 rounded-xl border border-blue-200">
            Avg: 204 Scans/Day
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-3 pt-3 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span>Healthy</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>At Risk</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span>Infected</span>
          </span>
        </div>
      </div>

      {/* Interactive Bar Chart Area */}
      <div className="space-y-2">
        
        {/* Active Day Detail Highlight Card */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-bold block">Selected Date:</span>
            <span className="text-sm font-black text-slate-900">
              {activeDay.day}, {activeDay.date} {activeDay.isPeak && <span className="text-red-600 font-black">(Weekly Influx Peak)</span>}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-slate-500 font-bold block text-[11px]">Total Volume</span>
              <span className="font-black text-slate-900 text-sm">{activeDay.total} scans</span>
            </div>
            <div className="text-right pl-2 border-l border-slate-300">
              <span className="text-emerald-800 font-black block text-[11px]">Healthy: {activeDay.healthy}</span>
              <span className="text-red-700 font-black block text-[11px]">Infected: {activeDay.infected}</span>
            </div>
          </div>
        </div>

        {/* 7 Vertical Bars */}
        <div className="h-56 pt-6 pb-2 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {DAILY_TIMELINE.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const totalHeight = (item.total / maxVolume) * 100;
            const healthyRatio = (item.healthy / item.total) * 100;
            const atRiskRatio = (item.atRisk / item.total) * 100;
            const infectedRatio = (item.infected / item.total) * 100;

            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredIndex(index)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Value tooltip pill above bar */}
                <div
                  className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded mb-1.5 transition-all ${
                    isHovered
                      ? 'bg-slate-900 text-white scale-110 shadow'
                      : 'text-slate-500 opacity-80'
                  }`}
                >
                  {item.total}
                </div>

                {/* Stacked Vertical Bar */}
                <div
                  className={`w-full max-w-[44px] rounded-t-xl overflow-hidden flex flex-col justify-end transition-all duration-300 border ${
                    isHovered
                      ? 'ring-2 ring-emerald-500 border-slate-900 shadow-lg scale-105'
                      : 'border-slate-300'
                  }`}
                  style={{ height: `${totalHeight}%` }}
                >
                  {/* Top segment: Infected (red) */}
                  <div
                    className="bg-red-600 transition-all"
                    style={{ height: `${infectedRatio}%` }}
                    title={`Infected: ${item.infected}`}
                  />
                  {/* Middle segment: At Risk (amber) */}
                  <div
                    className="bg-amber-500 transition-all"
                    style={{ height: `${atRiskRatio}%` }}
                    title={`At Risk: ${item.atRisk}`}
                  />
                  {/* Bottom segment: Healthy (emerald) */}
                  <div
                    className="bg-emerald-600 transition-all"
                    style={{ height: `${healthyRatio}%` }}
                    title={`Healthy: ${item.healthy}`}
                  />
                </div>

                {/* Day label */}
                <span
                  className={`text-xs mt-2 font-black transition-colors ${
                    isHovered ? 'text-emerald-900 underline' : 'text-slate-600'
                  }`}
                >
                  {item.day.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer Insight */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
        <span className="flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Peak influx on Thursday corresponded with rain front in Eastern blocks.</span>
        </span>
        <span className="text-emerald-800 font-extrabold hidden sm:inline">7-Day Total: 1,428</span>
      </div>

    </div>
  );
}
