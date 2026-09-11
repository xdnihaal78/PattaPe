import React, { useState } from 'react';
import { 
  Flame, 
  Eye, 
  Layers, 
  Columns, 
  Maximize2, 
  Info, 
  Sliders, 
  Sparkles
} from 'lucide-react';

export default function HeatmapViewer({ 
  originalImage, 
  imageUrl,
  heatmapImage,
  heatmapUrl,
  affectedAreaPercentage = 50,
  cropName = 'Crop'
}) {
  const [viewMode, setViewMode] = useState('side-by-side'); // default 'side-by-side' for clear direct comparison
  const [overlayOpacity, setOverlayOpacity] = useState(65);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isZoomed, setIsZoomed] = useState(false);

  const displayOriginal = originalImage || imageUrl || 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80';
  const displayHeatmap = heatmapUrl || heatmapImage || displayOriginal;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden p-5 space-y-4">
      
      {/* Header with Simple Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-300">
            <Flame className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 m-0">
              Leaf Photo &amp; Disease Heatmap
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 m-0">
              AI highlights exactly where the disease spots are located
            </p>
          </div>
        </div>

        {/* View Mode Selector Tabs in simple words */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition whitespace-nowrap ${
              viewMode === 'overlay'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overlay View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition whitespace-nowrap ${
              viewMode === 'side-by-side'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Side by Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition whitespace-nowrap ${
              viewMode === 'original'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Original Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition whitespace-nowrap ${
              viewMode === 'heatmap'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Heatmap Only</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Area */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-950 min-h-[320px] sm:min-h-[400px] flex items-center justify-center">
        
        {/* MODE 1: Overlay Blend Mode */}
        {viewMode === 'overlay' && (
          <div className="relative w-full h-full min-h-[340px] sm:min-h-[400px] flex items-center justify-center overflow-hidden">
            <img
              src={displayOriginal}
              alt="Crop Leaf Diagnosis"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-125' : 'scale-100'
              }`}
            />

            {/* Heatmap Layer with Dynamic Opacity */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
              style={{ opacity: overlayOpacity / 100 }}
            >
              <div className="w-full h-full absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-amber-500/50 to-red-600/70 mix-blend-color-dodge" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-52 h-52 sm:w-72 sm:h-72 rounded-full bg-red-600/60 filter blur-xl border-4 border-amber-300 animate-pulse" />
                <div className="absolute top-1/4 left-1/3 w-36 h-36 rounded-full bg-amber-500/70 filter blur-lg" />
              </div>
            </div>

            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Heatmap Overlay ({overlayOpacity}%)</span>
            </div>
          </div>
        )}

        {/* MODE 2: Side-by-Side Mode */}
        {viewMode === 'side-by-side' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-900">
            {/* Original Leaf */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-video md:aspect-square flex items-center justify-center bg-slate-950 shadow-inner group">
              <img
                src={displayOriginal}
                alt="Original Farmer Leaf"
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-125' : 'scale-100'
                }`}
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-md flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Original Farmer Leaf Image</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm text-slate-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-800 text-center">
                High-resolution field photo uploaded by farmer
              </div>
            </div>

            {/* AI Heatmap */}
            <div className="relative rounded-2xl overflow-hidden border border-red-900/60 aspect-video md:aspect-square flex items-center justify-center bg-slate-950 shadow-inner group">
              <img
                src={displayHeatmap}
                alt="AI Grad-CAM Heatmap"
                className={`w-full h-full object-cover contrast-200 hue-rotate-180 brightness-95 saturate-200 transition-transform duration-300 ${
                  isZoomed ? 'scale-125' : 'scale-100'
                }`}
              />
              {/* Thermal color map hotspot shader */}
              <div className="absolute inset-0 bg-red-600/30 backdrop-hue-rotate-90 pointer-events-none flex items-center justify-center">
                <div className="w-44 h-44 rounded-full bg-red-500/60 filter blur-2xl animate-pulse" />
                <div className="absolute w-24 h-24 rounded-full bg-yellow-400/50 filter blur-lg" />
              </div>
              <div className="absolute top-3 left-3 bg-red-950/90 backdrop-blur-md text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-xl border border-red-800 shadow-md flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>AI Heatmap Image (Grad-CAM)</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-red-950/80 backdrop-blur-sm text-amber-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-red-900/70 text-center">
                Red/Yellow highlights neural network focus lesions ({affectedAreaPercentage}% affected)
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: Original Only */}
        {viewMode === 'original' && (
          <div className="relative w-full h-full min-h-[340px] sm:min-h-[400px] flex items-center justify-center">
            <img
              src={displayOriginal}
              alt="Original Leaf Photo"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-125' : 'scale-100'
              }`}
            />
            <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-700">
              Original Farmer Leaf Image
            </div>
          </div>
        )}

        {/* MODE 4: Heatmap Only */}
        {viewMode === 'heatmap' && (
          <div className="relative w-full h-full min-h-[340px] sm:min-h-[400px] flex items-center justify-center bg-slate-950">
            <img
              src={displayHeatmap}
              alt="Heatmap Only"
              className="w-full h-full object-cover contrast-200 hue-rotate-180 brightness-90 saturate-200"
            />
            <div className="absolute inset-0 bg-red-600/40 backdrop-hue-rotate-90 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-52 rounded-full bg-red-500/70 filter blur-2xl animate-pulse" />
            </div>
            <div className="absolute top-3 left-3 bg-red-950/90 text-amber-300 text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl border border-red-800">
              AI Disease Heatmap Image (Grad-CAM)
            </div>
          </div>
        )}

        {/* Zoom Button */}
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition"
        >
          <Maximize2 className="w-4 h-4 text-emerald-400" />
          <span>{isZoomed ? 'Reset View' : 'Zoom In'}</span>
        </button>

      </div>

      {/* Interactive Controls & Simple Color Legend */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        
        {/* Opacity slider for Overlay Mode */}
        {viewMode === 'overlay' && (
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-slate-500 shrink-0" />
            <span className="text-sm font-black text-slate-800 whitespace-nowrap">
              Heatmap Visibility: {overlayOpacity}%
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer h-2"
            />
          </div>
        )}

        {/* Interpretation Legend in simple words */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
            <div className="w-4 h-4 rounded-full bg-red-600 shrink-0 shadow-sm" />
            <div>
              <p className="font-black text-slate-900 m-0 leading-tight">Red Area</p>
              <p className="text-xs text-slate-500 m-0">Damaged / diseased spot</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
            <div className="w-4 h-4 rounded-full bg-amber-500 shrink-0 shadow-sm" />
            <div>
              <p className="font-black text-slate-900 m-0 leading-tight">Yellow Area</p>
              <p className="text-xs text-slate-500 m-0">Spreading edge</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
            <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0 shadow-sm" />
            <div>
              <p className="font-black text-slate-900 m-0 leading-tight">Blue Area</p>
              <p className="text-xs text-slate-500 m-0">Healthy green leaf</p>
            </div>
          </div>
        </div>

        {/* Affected Leaf Area Readout */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs sm:text-sm font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>AI focuses on leaf tissue only (excludes background soil/hands).</span>
          </span>
          <span className="bg-red-100 text-red-950 px-3 py-1 rounded-xl font-black border border-red-300">
            {affectedAreaPercentage}% Leaf Damaged
          </span>
        </div>

      </div>

    </div>
  );
}
