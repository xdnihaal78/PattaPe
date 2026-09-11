import React from 'react';
import { ScanLine, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function FieldStatsCards({ stats, selectedFilter, onSelectFilter }) {
  // Use stats passed from officerService.getStats() or default fallbacks
  const totalCount = stats?.total ?? 40;
  const healthyCount = stats?.healthy ?? 10;
  const atRiskCount = stats?.at_risk ?? 15;
  const infectedCount = stats?.infected ?? 15;

  const cards = [
    {
      id: 'all',
      title: 'Total Scanned',
      count: totalCount,
      label: 'Total Scanned',
      sublabel: 'All farmer crop photo checks',
      badge: 'All 4 Villages',
      badgeStyle: 'bg-blue-100 text-blue-900 border-blue-300',
      icon: ScanLine,
      iconBg: 'bg-blue-600 text-white',
      borderStyle: selectedFilter === 'all' || !selectedFilter ? 'border-blue-500 ring-2 ring-blue-300' : 'border-slate-300',
      countColor: 'text-slate-900'
    },
    {
      id: 'healthy',
      title: 'Healthy',
      count: healthyCount,
      label: 'Healthy Crops',
      sublabel: 'No disease found / normal leaf',
      badge: 'Safe',
      badgeStyle: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-600 text-white',
      borderStyle: selectedFilter === 'healthy' ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-slate-300',
      countColor: 'text-emerald-800'
    },
    {
      id: 'at_risk',
      title: 'At Risk',
      count: atRiskCount,
      label: 'At Risk',
      sublabel: 'Mild symptoms or weather alert',
      badge: 'Watch Field',
      badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: AlertTriangle,
      iconBg: 'bg-amber-500 text-white',
      borderStyle: selectedFilter === 'at_risk' ? 'border-amber-500 ring-2 ring-amber-300' : 'border-slate-300',
      countColor: 'text-amber-800'
    },
    {
      id: 'infected',
      title: 'Infected',
      count: infectedCount,
      label: 'Infected',
      sublabel: 'Active crop disease detected',
      badge: 'Needs Action',
      badgeStyle: 'bg-red-100 text-red-900 border-red-300 animate-pulse',
      icon: ShieldAlert,
      iconBg: 'bg-red-600 text-white',
      borderStyle: selectedFilter === 'infected' ? 'border-red-500 ring-2 ring-red-300' : 'border-slate-300',
      countColor: 'text-red-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            className={`p-5 rounded-3xl border-2 transition-all shadow-md hover:shadow-xl cursor-pointer bg-white ${card.borderStyle} ${
              isSelected ? 'scale-[1.02] shadow-lg' : 'hover:-translate-y-0.5'
            }`}
          >
            {/* Top row: Icon & Status Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className={`p-3 rounded-2xl shadow-sm ${card.iconBg}`}>
                <Icon className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${card.badgeStyle}`}>
                {card.badge}
              </span>
            </div>

            {/* Large Prominent Number */}
            <div className="space-y-1">
              <p className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none ${card.countColor}`}>
                {card.count}
              </p>
              
              {/* Short descriptive label in clear text */}
              <h3 className="text-lg sm:text-xl font-black text-slate-900 m-0 pt-1 leading-snug">
                {card.label}
              </h3>
              
              <p className="text-sm font-semibold text-slate-500 m-0">
                {card.sublabel}
              </p>
            </div>

          </div>
        );
      })}
    </div>
  );
}
