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
  Calendar,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Loader2,
  Eye
} from 'lucide-react';
import { VILLAGES } from '../../services/officerService';

export default function DiagnosisCasesTable({
  cases = [],
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  selectedStatus = 'all',
  onStatusChange,
  selectedCrop = 'all',
  onCropChange,
  selectedSeverity = 'all',
  onSeverityChange,
  selectedRisk = 'all',
  onRiskChange,
  selectedVillage = 'all',
  onVillageChange,
  onResetFilters
}) {
  const navigate = useNavigate();

  // Crop Icon Helper
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

  // Severity visual chips: trace, mild, moderate, severe
  const getSeverityChip = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 border border-red-300 font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 animate-pulse" />
            <span>Severe</span>
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>Moderate</span>
          </span>
        );
      case 'mild':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 border border-blue-300 font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <span>Mild</span>
          </span>
        );
      case 'trace':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <span>Trace</span>
          </span>
        );
    }
  };

  // 72h Risk badges: low, moderate, high
  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>High Risk</span>
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-xs">
            <Shield className="w-4 h-4 shrink-0" />
            <span>Moderate</span>
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Low Risk</span>
          </span>
        );
    }
  };

  // Status visual badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-xl text-xs sm:text-sm font-black shadow-xs">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Pending Review</span>
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl text-xs sm:text-sm font-black shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Confirmed</span>
          </span>
        );
      case 'Overridden':
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1 rounded-xl text-xs sm:text-sm font-black shadow-xs">
            <AlertTriangle className="w-4 h-4 text-purple-700 shrink-0" />
            <span>Overridden</span>
          </span>
        );
      case 'Lab Test Requested':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1 rounded-xl text-xs sm:text-sm font-black shadow-xs">
            <FlaskConical className="w-4 h-4 text-rose-700 shrink-0" />
            <span>Lab Test Requested</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold">
            {status}
          </span>
        );
    }
  };

  // Date formatter
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
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
    selectedRisk !== 'all' ||
    selectedVillage !== 'all';

  return (
    <div id="cases-section" className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden space-y-5 p-5 sm:p-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 m-0 tracking-tight">
              Diagnosis Cases Table
            </h2>
            <span className="bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm px-3 py-1 rounded-full border border-emerald-300">
              {cases.length} cases
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600 m-0 mt-1">
            Real-time feed of farmer crop scans across monitored blocks
          </p>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs sm:text-sm font-black text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-300 px-3.5 py-2 rounded-xl transition"
          >
            <X className="w-4 h-4" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        
        {/* Search Input (4 cols on lg) */}
        <div className="lg:col-span-4 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search case ID, crop, or disease..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Village Filter (2 cols) */}
        <div className="lg:col-span-2">
          <select
            value={selectedVillage}
            onChange={(e) => onVillageChange && onVillageChange(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 rounded-2xl text-sm font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">📍 All Villages</option>
            {VILLAGES.map((v) => (
              <option key={v} value={v}>📍 {v}</option>
            ))}
          </select>
        </div>

        {/* Crop Filter (2 cols) */}
        <div className="lg:col-span-2">
          <select
            value={selectedCrop}
            onChange={(e) => onCropChange && onCropChange(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 rounded-2xl text-sm font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">🌱 All Crops</option>
            <option value="Rice">🌾 Rice</option>
            <option value="Chilli">🌶️ Chilli</option>
            <option value="Banana">🍌 Banana</option>
            <option value="Groundnut">🥜 Groundnut</option>
            <option value="Sugarcane">🎋 Sugarcane</option>
          </select>
        </div>

        {/* Status Filter (2 cols) */}
        <div className="lg:col-span-2">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 rounded-2xl text-sm font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Review">⏳ Pending Review</option>
            <option value="Confirmed">✅ Confirmed</option>
            <option value="Overridden">✏️ Overridden</option>
            <option value="Lab Test Requested">🧪 Lab Requested</option>
          </select>
        </div>

        {/* Severity Filter (1 col on lg) */}
        <div className="lg:col-span-1">
          <select
            value={selectedSeverity}
            onChange={(e) => onSeverityChange && onSeverityChange(e.target.value)}
            className="w-full py-2.5 px-2 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 rounded-2xl text-sm font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">Severity</option>
            <option value="severe">Severe</option>
            <option value="moderate">Moderate</option>
            <option value="mild">Mild</option>
            <option value="trace">Trace</option>
          </select>
        </div>

        {/* Risk Filter (1 col on lg) */}
        <div className="lg:col-span-1">
          <select
            value={selectedRisk}
            onChange={(e) => onRiskChange && onRiskChange(e.target.value)}
            className="w-full py-2.5 px-2 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 rounded-2xl text-sm font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">72h Risk</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>

      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
          <p className="text-base font-black text-slate-800">Loading diagnosis cases...</p>
        </div>
      ) : cases.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 text-slate-600 font-bold bg-slate-50 rounded-2xl p-6 space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-xl text-slate-900 font-black m-0">No diagnosis cases found</p>
          <p className="text-sm text-slate-500 m-0">No cases match the selected search or filter criteria.</p>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="mt-2 text-sm font-black text-emerald-800 underline hover:text-emerald-950"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        /* Responsive Table Container with Horizontal Scroll */
        <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 shadow-xs">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-xs sm:text-sm font-black uppercase tracking-wider">
                <th className="py-4 px-4 whitespace-nowrap">Case ID</th>
                <th className="py-4 px-4 whitespace-nowrap">Crop</th>
                <th className="py-4 px-4 whitespace-nowrap">Disease</th>
                <th className="py-4 px-4 whitespace-nowrap">Severity</th>
                <th className="py-4 px-4 whitespace-nowrap">72h Risk</th>
                <th className="py-4 px-4 whitespace-nowrap">Village</th>
                <th className="py-4 px-4 whitespace-nowrap">Date</th>
                <th className="py-4 px-4 whitespace-nowrap">Status</th>
                <th className="py-4 px-4 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 text-sm sm:text-base">
              {cases.map((c) => {
                const targetId = c.id || c.case_id;

                return (
                  <tr 
                    key={targetId}
                    onClick={() => navigate(`/officer/case/${targetId}`)}
                    className="hover:bg-emerald-50/50 transition cursor-pointer group"
                  >
                    {/* 1. Case ID */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-black text-slate-950 group-hover:text-emerald-900 transition">
                        {c.case_id || `KVK-${c.id}`}
                      </span>
                    </td>

                    {/* 2. Crop */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 font-extrabold text-sm text-slate-900">
                        <span className="text-lg">{getCropIcon(c.crop)}</span>
                        <span>{c.crop}</span>
                      </div>
                    </td>

                    {/* 3. Disease */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <p className="font-black text-slate-950 text-sm sm:text-base m-0 leading-tight group-hover:text-emerald-900 transition">
                          {c.disease}
                        </p>
                        <p className="text-xs font-bold text-slate-500 m-0 mt-0.5">
                          {c.confidence}% confidence
                        </p>
                      </div>
                    </td>

                    {/* 4. Severity (Clear visual chips) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getSeverityChip(c.severity)}
                    </td>

                    {/* 5. 72h Risk (Clear visual badges) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getRiskBadge(c.risk)}
                    </td>

                    {/* 6. Village */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{c.village}</span>
                      </span>
                    </td>

                    {/* 7. Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDate(c.created_at || c.submittedAt)}</span>
                      </div>
                    </td>

                    {/* 8. Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>

                    {/* 9. Action: "View Case" */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/officer/case/${targetId}`);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-white bg-emerald-700 hover:bg-emerald-800 group-hover:bg-emerald-800 px-3.5 py-2 rounded-xl shadow-xs transition"
                        title="View Case Details"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Case</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
