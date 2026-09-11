import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FlaskConical, 
  ChevronRight, 
  X, 
  MapPin, 
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Shield
} from 'lucide-react';


export default function OfficerCaseTable({
  cases,
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCrop,
  onCropChange,
  selectedSeverity,
  onSeverityChange,
  selectedRisk,
  onRiskChange,
  selectedVillage,
  onVillageChange,
  onResetFilters
}) {
  const navigate = useNavigate();

  // Simple Crop Icon Helper
  const getCropIcon = (cropName) => {
    switch (cropName?.toLowerCase()) {
      case 'rice': return '🌾';
      case 'chilli': return '🌶️';
      case 'banana': return '🍌';
      case 'groundnut': return '🥜';
      case 'sugarcane': return '🎋';
      default: return '🌱';
    }
  };

  // Simple Status Badge with clear words and icons
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 border-2 border-amber-400 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-2xs">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Pending Review</span>
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 border-2 border-emerald-400 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Confirmed</span>
          </span>
        );
      case 'Overridden':
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-950 border-2 border-purple-400 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-purple-700 shrink-0" />
            <span>Overridden</span>
          </span>
        );
      case 'Lab Test Requested':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-950 border-2 border-rose-400 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-2xs">
            <FlaskConical className="w-4 h-4 text-rose-700 shrink-0" />
            <span>Lab Test Requested</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-xl text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  // Severity indicator: trace, mild, moderate, severe
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-950 border-2 border-red-400 font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-red-600 shrink-0 animate-pulse" />
            <span>Severe Damage</span>
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 border-2 border-amber-400 font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span>Moderate</span>
          </span>
        );
      case 'mild':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-950 border-2 border-blue-400 font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <span>Mild (Early)</span>
          </span>
        );
      case 'trace':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 border-2 border-emerald-400 font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
            <span>Trace (Normal)</span>
          </span>
        );
    }
  };

  // Risk indicator: low, moderate, high
  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>High Risk</span>
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-2xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Medium Risk</span>
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Low Risk</span>
          </span>
        );
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedStatus !== 'all' || 
    selectedCrop !== 'all' || 
    selectedSeverity !== 'all' ||
    (selectedRisk && selectedRisk !== 'all') ||
    (selectedVillage && selectedVillage !== 'all');

  return (
    <div id="cases-section" className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden space-y-5 p-5 sm:p-6">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 m-0 tracking-tight">
              Recent Diagnosis Cases
            </h2>
            <span className="bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm px-3 py-1 rounded-full border border-emerald-300">
              {cases.length} cases shown
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600 m-0 mt-1">
            Tap or click any case below to see photos, heatmaps, and doctor advice
          </p>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="self-start lg:self-auto flex items-center gap-1.5 text-xs sm:text-sm font-black text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-300 px-3.5 py-2 rounded-xl transition"
          >
            <X className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* ── SIMPLE FILTER BAR ── */}
      <div className="space-y-4">

        {/* ROW 1: Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by farmer name, village, or disease…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ROW 2: Crop filter pill-buttons */}
        <div className="space-y-1.5">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">🌱 Filter by Crop</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all',        label: 'All Crops',  emoji: '🌱' },
              { value: 'Rice',       label: 'Rice',       emoji: '🌾' },
              { value: 'Chilli',     label: 'Chilli',     emoji: '🌶️' },
              { value: 'Banana',     label: 'Banana',     emoji: '🍌' },
              { value: 'Groundnut',  label: 'Groundnut',  emoji: '🥜' },
              { value: 'Sugarcane',  label: 'Sugarcane',  emoji: '🎋' },
            ].map(({ value, label, emoji }) => {
              const active = selectedCrop === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onCropChange(value)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-black border-2 transition
                    ${active
                      ? 'bg-emerald-700 border-emerald-700 text-white shadow-md'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-800 hover:bg-emerald-50'
                    }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 3: Severity filter pill-buttons */}
        <div className="space-y-1.5">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">🩺 Filter by Severity</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all',      label: 'All Levels', color: 'bg-white border-slate-300 text-slate-700 hover:border-slate-500',              activeColor: 'bg-slate-700 border-slate-700 text-white' },
              { value: 'trace',    label: '🟢 Trace',   color: 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50',              activeColor: 'bg-emerald-600 border-emerald-600 text-white' },
              { value: 'mild',     label: '🔵 Mild',    color: 'bg-white border-blue-300 text-blue-800 hover:bg-blue-50',                       activeColor: 'bg-blue-600 border-blue-600 text-white' },
              { value: 'moderate', label: '🟡 Moderate',color: 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50',                    activeColor: 'bg-amber-500 border-amber-500 text-white' },
              { value: 'severe',   label: '🔴 Severe',  color: 'bg-white border-red-300 text-red-800 hover:bg-red-50',                          activeColor: 'bg-red-600 border-red-600 text-white' },
            ].map(({ value, label, color, activeColor }) => {
              const active = selectedSeverity === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSeverityChange(value)}
                  className={`px-4 py-2 rounded-2xl text-sm font-black border-2 transition
                    ${active ? activeColor : color}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 4: Status filter pill-buttons */}
        <div className="space-y-1.5">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">📋 Filter by Status</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all',                 label: 'All Statuses',       activeColor: 'bg-slate-700 border-slate-700 text-white',   idleColor: 'bg-white border-slate-300 text-slate-700 hover:border-slate-500' },
              { value: 'Pending Review',       label: '⏳ Pending Review',  activeColor: 'bg-amber-500 border-amber-500 text-white',   idleColor: 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50' },
              { value: 'Confirmed',            label: '✅ Confirmed',        activeColor: 'bg-emerald-600 border-emerald-600 text-white',idleColor: 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50' },
              { value: 'Overridden',           label: '✏️ Overridden',       activeColor: 'bg-purple-600 border-purple-600 text-white', idleColor: 'bg-white border-purple-300 text-purple-800 hover:bg-purple-50' },
              { value: 'Lab Test Requested',   label: '🧪 Lab Requested',   activeColor: 'bg-rose-600 border-rose-600 text-white',     idleColor: 'bg-white border-rose-300 text-rose-800 hover:bg-rose-50' },
            ].map(({ value, label, activeColor, idleColor }) => {
              const active = selectedStatus === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onStatusChange(value)}
                  className={`px-4 py-2 rounded-2xl text-sm font-black border-2 transition
                    ${active ? activeColor : idleColor}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Cases Display: Desktop Table View (large text, no tiny text) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border-2 border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-sm font-black uppercase tracking-wider">
              <th className="py-4 px-4">Crop</th>
              <th className="py-4 px-4">Disease Found</th>
              <th className="py-4 px-4">Village</th>
              <th className="py-4 px-4">Severity</th>
              <th className="py-4 px-4">Risk Level</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 text-base">
            {cases.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-slate-600 font-bold">
                  <div className="max-w-sm mx-auto space-y-2">
                    <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-lg text-slate-900 font-black m-0">No cases found with these filters</p>
                    <p className="text-sm text-slate-500 m-0">Try clearing your search or picking "All Crops"</p>
                    <button
                      onClick={onResetFilters}
                      className="mt-2 text-sm font-black text-emerald-800 underline hover:text-emerald-950"
                    >
                      Clear all filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr 
                  key={c.id || c.case_id} 
                  onClick={() => navigate(`/officer/case/${c.id || c.case_id}`)}
                  className="hover:bg-emerald-50/40 transition cursor-pointer group"
                >
                  {/* Crop: Icon + Name */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 font-black text-base text-slate-900">
                      <span className="text-xl">{getCropIcon(c.crop)}</span>
                      <span>{c.crop}</span>
                    </div>
                  </td>

                  {/* Disease Found */}
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-black text-slate-950 text-base m-0 leading-tight group-hover:text-emerald-900 transition">
                        {c.disease}
                      </p>
                      <p className="text-xs font-bold text-slate-500 m-0 mt-0.5">
                        {c.farmer_name || 'Farmer'} • {c.confidence}% confidence • {formatDate(c.created_at)}
                      </p>
                    </div>
                  </td>

                  {/* Village */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{c.village}</span>
                    </span>
                  </td>

                  {/* Severity */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getSeverityBadge(c.severity)}
                  </td>

                  {/* Risk Level */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getRiskBadge(c.risk)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getStatusBadge(c.status)}
                  </td>

                  {/* Action Link: Clear friendly button */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-sm font-black text-white bg-emerald-700 hover:bg-emerald-800 group-hover:bg-emerald-800 px-4 py-2 rounded-xl shadow transition">
                      <span>Open Case</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cases Display: Mobile Card View (Easy touch targets, large text) */}
      <div className="block md:hidden space-y-3.5">
        {cases.length === 0 ? (
          <div className="text-center py-10 text-slate-600 font-bold bg-slate-50 rounded-2xl p-4">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-base text-slate-900 font-black m-0">No cases match your filters</p>
            <button
              onClick={onResetFilters}
              className="mt-2 text-sm font-black text-emerald-800 underline"
            >
              Show all cases
            </button>
          </div>
        ) : (
          cases.map((c) => (
            <div
              key={c.id || c.case_id}
              onClick={() => navigate(`/officer/case/${c.id || c.case_id}`)}
              className="p-4 rounded-3xl border-2 border-slate-300 bg-white hover:border-emerald-500 transition cursor-pointer space-y-3 shadow-md"
            >
              {/* Top Row: Crop & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl text-sm font-black text-slate-900">
                  <span>{getCropIcon(c.crop)}</span>
                  <span>{c.crop}</span>
                </div>
                {getStatusBadge(c.status)}
              </div>

              {/* Middle: Disease & Village */}
              <div>
                <h3 className="text-lg font-black text-slate-950 m-0 leading-tight">
                  {c.disease}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-500 m-0 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{c.village}</span>
                  <span>•</span>
                  <span>{c.farmer_name}</span>
                </p>
              </div>

              {/* Bottom: Severity & Risk Badges + Open Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(c.severity)}
                  {getRiskBadge(c.risk)}
                </div>

                <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-300">
                  <span>Open</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
