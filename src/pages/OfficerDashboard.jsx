import React, { useState, useEffect } from 'react';
import { 
  getCases, 
  getStats, 
  resetSeedCases 
} from '../services/officerService';
import FieldStatsCards from '../components/officer/FieldStatsCards';
import CropDistributionChart from '../components/officer/CropDistributionChart';
import CasesOverTimeChart from '../components/officer/CasesOverTimeChart';
import DiagnosisCasesTable from '../components/officer/DiagnosisCasesTable';
import { RefreshCw, RotateCcw, Activity } from 'lucide-react';

export default function OfficerDashboard() {
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeStatFilter, setActiveStatFilter] = useState('all');

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [data, currentStats] = await Promise.all([
        getCases(),
        getStats()
      ]);
      setCases(data);
      setStats(currentStats);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 250);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetData = () => {
    if (window.confirm('Reset all 40 cases back to initial realistic seed data?')) {
      resetSeedCases();
      loadData();
    }
  };

  const handleStatCardClick = (statId) => {
    setActiveStatFilter(statId);
    if (statId === 'all') {
      setSelectedSeverity('all');
      setSelectedRisk('all');
      setSelectedStatus('all');
    } else if (statId === 'healthy') {
      setSelectedSeverity('trace');
      setSelectedRisk('all');
      setSelectedStatus('all');
    } else if (statId === 'at_risk') {
      setSelectedRisk('moderate');
      setSelectedSeverity('all');
      setSelectedStatus('all');
    } else if (statId === 'infected') {
      setSelectedSeverity('severe');
      setSelectedRisk('all');
      setSelectedStatus('all');
    }

    // Scroll to cases preview table
    const elem = document.getElementById('cases-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter logic on cases
  const filteredCases = cases.filter((c) => {
    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesFarmer = (c.farmer_name || '').toLowerCase().includes(q);
      const matchesId = (c.case_id || '').toLowerCase().includes(q) || String(c.id) === q;
      const matchesVillage = (c.village || '').toLowerCase().includes(q);
      const matchesDisease = (c.disease || '').toLowerCase().includes(q);
      const matchesCrop = (c.crop || '').toLowerCase().includes(q);
      if (!matchesFarmer && !matchesId && !matchesVillage && !matchesDisease && !matchesCrop) {
        return false;
      }
    }

    // Status filter
    if (selectedStatus !== 'all' && c.status !== selectedStatus) {
      return false;
    }

    // Crop filter
    if (selectedCrop !== 'all' && c.crop.toLowerCase() !== selectedCrop.toLowerCase()) {
      return false;
    }

    // Severity filter
    if (selectedSeverity !== 'all' && c.severity.toLowerCase() !== selectedSeverity.toLowerCase()) {
      return false;
    }

    // Risk filter
    if (selectedRisk !== 'all' && c.risk.toLowerCase() !== selectedRisk.toLowerCase()) {
      return false;
    }

    // Village filter
    if (selectedVillage !== 'all' && c.village.toLowerCase() !== selectedVillage.toLowerCase()) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return 0;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedCrop('all');
    setSelectedSeverity('all');
    setSelectedRisk('all');
    setSelectedVillage('all');
    setSortBy('newest');
    setActiveStatFilter('all');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      
      {/* ======================================================== */}
      {/* 1. PAGE TITLE & SUBTITLE */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 m-0 tracking-tight leading-tight">
              Field Diagnosis Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm px-3.5 py-1 rounded-full border border-emerald-300">
              <Activity className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span>4 Villages Active</span>
            </span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-600 m-0 mt-1">
            Monitor and review crop disease cases
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadData}
            disabled={isRefreshing}
            className="btn-touch px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-xl text-sm border-2 border-slate-300 flex items-center gap-2 shadow-sm transition"
            title="Refresh case feed"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="btn-touch px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-sm border-2 border-slate-300 flex items-center gap-2 shadow-sm transition"
            title="Reset 40 seed cases"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Reset 40 Cases</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FOUR PROMINENT STAT CARDS */}
      {/* ======================================================== */}
      <section aria-label="Field Diagnosis Statistics">
        <FieldStatsCards
          stats={stats}
          selectedFilter={activeStatFilter}
          onSelectFilter={handleStatCardClick}
        />
      </section>

      {/* ======================================================== */}
      {/* 3. CHARTS SECTION (Cases by Crop & Cases Over Time) */}
      {/* ======================================================== */}
      <section aria-label="Surveillance Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Cases by Crop */}
        <CropDistributionChart
          cropStats={stats?.by_crop}
          selectedCrop={selectedCrop}
          onCropSelect={(crop) => setSelectedCrop(crop)}
        />

        {/* Chart 2: Cases Over Time */}
        <CasesOverTimeChart />

      </section>

      {/* ======================================================== */}
      {/* 4. RECENT DIAGNOSIS CASES (Preview Table & Filters) */}
      {/* ======================================================== */}
      <section aria-label="Recent Diagnosis Cases">
        <OfficerCaseTable
          cases={filteredCases}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedCrop={selectedCrop}
          onCropChange={setSelectedCrop}
          selectedSeverity={selectedSeverity}
          onSeverityChange={setSelectedSeverity}
          selectedRisk={selectedRisk}
          onRiskChange={setSelectedRisk}
          selectedVillage={selectedVillage}
          onVillageChange={setSelectedVillage}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
        />
      </section>

    </div>
  );
}
