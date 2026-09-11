import React, { useState } from 'react';
import { Eye, Flame, Image as ImageIcon, Info, RotateCcw } from 'lucide-react';
import FarmerErrorState from './FarmerErrorState';
import { TRANSLATIONS } from '../utils/helpers';

/**
 * LeafHeatmap Component
 * Displays:
 * - The uploaded farmer leaf image when available
 * - The AI heatmap image from heatmap_url when available
 * Handles 6. Heatmap image unavailable with friendly fallback and recovery action.
 */
export default function LeafHeatmap({ uploadedImage, heatmapUrl, currentLang = 'en' }) {
  const [activeMode, setActiveMode] = useState('standard'); // 'standard' | 'heatmap'
  const [heatmapImageError, setHeatmapImageError] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Fallback sample image if none provided
  const fallbackImage = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
  const displayImage = uploadedImage || fallbackImage;

  // Has a valid heatmap url
  const isHeatmapUnavailable = !heatmapUrl || heatmapImageError;
  const hasHeatmap = Boolean(heatmapUrl && !heatmapImageError);

  const handleToggleMode = () => {
    setActiveMode((prev) => (prev === 'standard' ? 'heatmap' : 'standard'));
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-sm space-y-2.5">
      
      {/* Container with leaf view & heatmap toggle */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[16/9] max-h-52 flex items-center justify-center select-none group">
        
        {/* Base Leaf Image */}
        <img 
          src={displayImage} 
          alt="Farmer Leaf Inspection" 
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* AI Heatmap Overlay when toggled and available */}
        {hasHeatmap && activeMode === 'heatmap' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center animate-in fade-in duration-300">
            <img 
              src={heatmapUrl} 
              alt="AI Disease Heatmap"
              onError={() => setHeatmapImageError(true)}
              className="w-full h-full object-cover mix-blend-screen opacity-90 filter contrast-125"
            />
            
            {/* Diagnostic hotspot indicators */}
            <div className="absolute inset-0 bg-red-600/20 pointer-events-none flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-red-500/45 animate-ping border-2 border-amber-300 pointer-events-none" />
              <div className="absolute top-1/4 left-1/3 w-12 h-12 rounded-full bg-amber-500/50 animate-pulse border border-red-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Fallback Simulation when heatmap image is unavailable */}
        {isHeatmapUnavailable && activeMode === 'heatmap' && (
          <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-2 animate-in fade-in">
            <ImageIcon className="w-8 h-8 text-amber-400" />
            <p className="text-xs font-bold text-slate-200 max-w-xs m-0">
              Visual heatmap is unavailable for this photo. The original photo is shown.
            </p>
            <button
              type="button"
              onClick={() => setActiveMode('standard')}
              className="px-3 py-1 bg-white text-slate-900 font-black text-xs rounded-lg shadow-sm"
            >
              View Original Leaf
            </button>
          </div>
        )}

        {/* Top Status Tag */}
        <div className="absolute top-2.5 left-2.5 z-20 bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-700 flex items-center gap-1 shadow-sm">
          {activeMode === 'heatmap' ? (
            <>
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{t.aiHeatmap || 'AI Heatmap'}</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-3 h-3 text-emerald-400" />
              <span>{t.leafPhoto || 'Leaf Photo'}</span>
            </>
          )}
        </div>

        {/* View Toggle Button */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={handleToggleMode}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95 border ${
              activeMode === 'heatmap'
                ? 'bg-amber-500 text-slate-950 border-amber-400 ring-1 ring-amber-300 font-extrabold'
                : 'bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800'
            }`}
          >
            {activeMode === 'heatmap' ? (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                <span>{t.original || 'Original'}</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                <span>{t.aiHeatmap || 'AI Heatmap'}</span>
              </>
            )}
          </button>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-2 inset-x-2 z-20 bg-slate-950/75 backdrop-blur-xs rounded-lg px-2.5 py-0.5 flex items-center justify-between text-[10px] text-slate-300 font-medium">
          <span>{t.leafTissueScan || 'Leaf Tissue Diagnostic Scan'}</span>
          <span className="text-emerald-400 font-semibold">
            {isHeatmapUnavailable && activeMode === 'heatmap' ? 'Heatmap Offline' : (t.activeSensor || 'Active Sensor')}
          </span>
        </div>

      </div>

      {/* Notice when heatmap image is unavailable */}
      {isHeatmapUnavailable && activeMode === 'heatmap' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2 text-xs text-blue-950 font-semibold animate-in fade-in">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            AI Heatmap image unavailable for this leaf. Your disease diagnosis, severity score, and treatment guide below are 100% complete.
          </span>
        </div>
      )}

    </div>
  );
}
