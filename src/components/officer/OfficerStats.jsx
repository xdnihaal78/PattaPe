import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FlaskConical, 
  Flame, 
  TrendingUp,
  Activity
} from 'lucide-react';

export default function OfficerStats({ stats, activeStatusFilter, onStatusSelect }) {
  const statCards = [
    {
      id: 'all',
      title: 'Total Inflow',
      count: stats.total,
      subtitle: 'Recorded Cases',
      icon: ClipboardList,
      color: 'blue',
      cardBg: 'bg-white',
      borderColor: 'border-slate-300',
      iconBg: 'bg-blue-100 text-blue-800',
      badgeBg: 'bg-blue-50 text-blue-700'
    },
    {
      id: 'pending',
      title: 'Pending Review',
      count: stats.pending,
      subtitle: 'Requires Action',
      icon: Clock,
      color: 'amber',
      cardBg: 'bg-amber-50/50',
      borderColor: activeStatusFilter === 'pending' ? 'border-amber-600 ring-2 ring-amber-400' : 'border-amber-300',
      iconBg: 'bg-amber-500 text-white',
      badgeBg: 'bg-amber-100 text-amber-900 font-extrabold animate-pulse'
    },
    {
      id: 'confirmed',
      title: 'AI Confirmed',
      count: stats.confirmed,
      subtitle: 'Approved by Officer',
      icon: CheckCircle2,
      color: 'emerald',
      cardBg: 'bg-white',
      borderColor: activeStatusFilter === 'confirmed' ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-800',
      badgeBg: 'bg-emerald-50 text-emerald-700'
    },
    {
      id: 'overridden',
      title: 'Overridden',
      count: stats.overridden,
      subtitle: 'Reclassified by Officer',
      icon: AlertTriangle,
      color: 'purple',
      cardBg: 'bg-white',
      borderColor: activeStatusFilter === 'overridden' ? 'border-purple-600 ring-2 ring-purple-400' : 'border-purple-300',
      iconBg: 'bg-purple-100 text-purple-800',
      badgeBg: 'bg-purple-50 text-purple-700'
    },
    {
      id: 'lab_requested',
      title: 'Lab Dispatches',
      count: stats.labRequested,
      subtitle: 'Tissue & Culture Tests',
      icon: FlaskConical,
      color: 'rose',
      cardBg: 'bg-white',
      borderColor: activeStatusFilter === 'lab_requested' ? 'border-rose-600 ring-2 ring-rose-400' : 'border-rose-300',
      iconBg: 'bg-rose-100 text-rose-800',
      badgeBg: 'bg-rose-50 text-rose-700'
    }
  ];

  return (
    <div className="space-y-4">
      
      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeStatusFilter === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onStatusSelect(card.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${card.cardBg} ${card.borderColor} ${
                isSelected ? 'scale-[1.02] shadow-md' : 'hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                {card.id === 'pending' && card.count > 0 && (
                  <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">
                    Action
                  </span>
                )}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
                {card.count}
              </p>
              <p className="text-xs font-black text-slate-700 mt-1 m-0">
                {card.title}
              </p>
              <p className="text-[11px] font-medium text-slate-500 m-0">
                {card.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Surveillance Alert: Outbreak Cluster Warning Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white rounded-2xl p-3.5 sm:p-4 border-2 border-red-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 bg-red-600 rounded-xl shrink-0 shadow">
            <Flame className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500/80 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded">
                Surveillance Alert
              </span>
              <h4 className="text-sm sm:text-base font-black text-white m-0">
                High Risk Spore Outbreak Clusters Active
              </h4>
            </div>
            <p className="text-xs text-red-100 mt-0.5 m-0 font-medium">
              Elevated relative humidity (&gt;90%) in West Godavari &amp; Moga has triggered critical Rice Leaf Blast and BLB transmission alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-red-950/80 text-amber-300 px-3 py-1.5 rounded-xl border border-red-600">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>{stats.critical} Critical Cases Active</span>
          </span>
        </div>
      </div>

    </div>
  );
}
