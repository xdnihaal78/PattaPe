import React, { useState } from 'react';
import { Eye, Flame, Image as ImageIcon } from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

/**
 * LeafHeatmap Component
 * Displays:
 * - The uploaded farmer leaf image when available
 * - The AI heatmap image from heatmap_url when available
 * Full multi-language support (en, hi, ta, kn).
 */
export default function LeafHeatmap({ uploadedImage, heatmapUrl, currentLang = 'en' }) {
  const [activeMode, setActiveMode] = useState('standard'); // 'standard' | 'heatmap'
  const [heatmapImageError, setHeatmapImageError] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Fallback sample image if none provided
  const fallbackImage = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
  const displayImage = uploadedImage || fallbackImage;

  // Has a valid heatmap url
  const hasHeatmap = Boolean(heatmapUrl && !heatmapImageError);

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-sm space-y-2">
      
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

        {/* Fallback CSS Heatmap simulation */}
        {!hasHeatmap && activeMode === 'heatmap' && (
          <div className="absolute inset-0 z-10 bg-red-600/25 backdrop-hue-rotate-90 pointer-events-none flex items-center justify-center animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-red-500/45 animate-ping border-2 border-amber-300" />
            <div className="absolute top-1/4 left-1/3 w-12 h-12 rounded-full bg-amber-500/50 animate-pulse border border-red-400" />
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
            onClick={() => setActiveMode(prev => prev === 'standard' ? 'heatmap' : 'standard')}
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
          <span className="text-emerald-400 font-semibold">{t.activeSensor || 'Active Sensor'}</span>
        </div>

      </div>

    </div>
  );
}
