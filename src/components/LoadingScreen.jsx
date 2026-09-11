import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Leaf, 
  Scan, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Activity, 
  Crosshair, 
  Microscope, 
  FileCheck2,
  Lock
} from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

export default function LoadingScreen({ 
  leafImage, 
  selectedCrop, 
  currentLang = 'en', 
  activeStep = 0, 
  progress = 20, 
  isFinished = false 
}) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // The 5 mandatory steps translated dynamically
  const stepIcons = [Target, Microscope, Crosshair, Activity, FileCheck2];
  const stepItems = (t.analyzingSteps || []).map((step, idx) => ({
    id: idx + 1,
    title: step.title,
    sub: step.detail,
    icon: stepIcons[idx] || Target
  }));

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-emerald-500/30 shadow-lg space-y-4 text-center relative overflow-hidden">
      
      {/* Background ambient lighting glows */}
      <div className="absolute -top-16 -left-16 w-36 h-36 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Hero Visual: Large agricultural/leaf visual or animated AI scanner */}
      <div className="relative rounded-xl overflow-hidden border-2 border-emerald-600/70 bg-slate-950 aspect-[16/10] max-h-52 flex items-center justify-center shadow-md select-none">
        
        {leafImage ? (
          /* Case 1: Uploaded leaf image with high-tech AI bio-scanner HUD */
          <div className="relative w-full h-full">
            <img 
              src={leafImage} 
              alt="Leaf for AI Diagnosis" 
              className="w-full h-full object-cover opacity-80 filter contrast-110" 
            />
            
            {/* Subtle digital scanning grid texture */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #34d399 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            />

            {/* Glowing Laser Scanline */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-scan-line z-10" />
            
            {/* Soft gradient light beam following scan */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-emerald-500/20 to-transparent animate-scan-line pointer-events-none z-10" />

            {/* Simulated symptom hotspots with target reticles */}
            <div className="absolute top-[32%] left-[38%] pointer-events-none z-20">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full border border-emerald-400 animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <div className="absolute left-4 top-[-4px] bg-slate-950/85 backdrop-blur-xs border border-emerald-400/70 text-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded whitespace-nowrap">
                  Spot #1: Lesion (94%)
                </div>
              </div>
            </div>

            <div className="absolute bottom-[28%] right-[30%] pointer-events-none z-20">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-5 h-5 rounded-full border border-amber-400 animate-ping opacity-75" />
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                <div className="absolute right-4 top-[-4px] bg-slate-950/85 backdrop-blur-xs border border-amber-400/70 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded whitespace-nowrap">
                  Spot #2: Halo
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Case 2: Large Agricultural / Animated Leaf Visual */
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 overflow-hidden">
            
            {/* Concentric expanding radar rings */}
            <div className="absolute w-44 h-44 rounded-full border border-emerald-500/20 animate-radar-ping" />
            <div className="absolute w-32 h-32 rounded-full border border-emerald-500/30" />
            <div className="absolute w-20 h-20 rounded-full border border-emerald-400/40" />
            
            {/* 360-degree rotating radar beam sweep */}
            <div 
              className="absolute w-48 h-48 rounded-full animate-radar-sweep pointer-events-none opacity-40"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(16, 185, 129, 0.45) 360deg)'
              }}
            />

            {/* Glowing circular leaf pod */}
            <div className="relative z-10 animate-float-leaf flex flex-col items-center justify-center">
              <div className="relative p-4 rounded-full bg-emerald-900/60 border border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.35)] backdrop-blur-xs">
                <Leaf className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400 fill-emerald-500/30 stroke-[1.8] filter drop-shadow-[0_0_10px_#34d399]" />
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-300 animate-pulse" />
              </div>
            </div>

            {/* Floating agri bio-markers */}
            <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs border border-emerald-500/40 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              <span>Lesion Scan</span>
            </div>

            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs border border-emerald-500/40 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              <span>Bio-Scan</span>
            </div>
          </div>
        )}

        {/* HUD Corner Brackets */}
        <div className="absolute top-2 left-2 border-t-2 border-l-2 border-emerald-400 w-4 h-4 rounded-tl-sm pointer-events-none z-20" />
        <div className="absolute top-2 right-2 border-t-2 border-r-2 border-emerald-400 w-4 h-4 rounded-tr-sm pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-emerald-400 w-4 h-4 rounded-bl-sm pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-emerald-400 w-4 h-4 rounded-br-sm pointer-events-none z-20" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 z-20 bg-slate-950/85 backdrop-blur-xs text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
          <Scan className="w-3 h-3 text-emerald-400 animate-spin" />
          <span>AI Vision Scan</span>
        </div>

        {selectedCrop && (
          <div className="absolute top-2.5 right-2.5 z-20 bg-slate-950/85 backdrop-blur-xs text-white border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
            <span>{selectedCrop.icon}</span>
            <span>{selectedCrop.names_i18n?.[currentLang] || selectedCrop.name}</span>
          </div>
        )}

        {/* Bottom HUD bar */}
        <div className="absolute bottom-2 inset-x-2 z-20 bg-slate-950/85 backdrop-blur-xs border border-emerald-500/30 rounded-lg px-2.5 py-1 flex items-center justify-between text-[10px] text-emerald-200 font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white">{t.bioEngine || 'Bio-Engine'}</span>
          </div>
          <span className="text-emerald-400 font-mono text-[9px]">50K+ Pathogens</span>
        </div>

      </div>

      {/* Main Text & Subtitle */}
      <div className="space-y-0.5 pt-0.5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight flex items-center justify-center gap-1.5">
          <span>{t.analyzingTitle || 'Analyzing your crop...'}</span>
          <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse shrink-0" />
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 m-0">
          {t.analyzingSub || 'This may take a few seconds'}
        </p>
      </div>

      {/* Overall Animated Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-0.5">
          <span className="text-emerald-800">
            {isFinished 
              ? (currentLang === 'hi' ? 'विश्लेषण पूर्ण' : currentLang === 'ta' ? 'ஆய்வு முடிந்தது' : currentLang === 'kn' ? 'ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ' : 'Analysis Complete')
              : (currentLang === 'hi' ? `चरण ${Math.min(activeStep + 1, 5)} / 5` : currentLang === 'ta' ? `படி ${Math.min(activeStep + 1, 5)} / 5` : currentLang === 'kn' ? `ಹಂತ ${Math.min(activeStep + 1, 5)} / 5` : `Step ${Math.min(activeStep + 1, 5)} of 5`)}
          </span>
          <span className="font-mono text-emerald-700 font-black text-xs">
            {progress}%
          </span>
        </div>
        
        <div className="w-full bg-slate-100 rounded-full h-2.5 p-0.5 border border-slate-300 shadow-inner overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Animated 5-Step Progress / Checklist */}
      <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3 border border-slate-200 text-left space-y-1.5">
        {stepItems.map((step, idx) => {
          const isDone = idx < activeStep || isFinished;
          const isActive = idx === activeStep && !isFinished;

          return (
            <div 
              key={step.id} 
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white border border-emerald-500 shadow-xs ring-1 ring-emerald-100' 
                  : isDone 
                  ? 'bg-emerald-50/70 border border-emerald-200/80' 
                  : 'bg-transparent border border-transparent opacity-50'
              }`}
            >
              {/* Left icon and labels */}
              <div className="flex items-center gap-2.5">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-600 flex items-center justify-center shrink-0">
                    <Loader2 className="w-3 h-3 text-emerald-700 animate-spin stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {step.id}
                  </div>
                )}

                <div>
                  <p className={`text-xs sm:text-sm m-0 leading-tight ${
                    isActive 
                      ? 'text-emerald-950 font-bold' 
                      : isDone 
                      ? 'text-slate-800 font-semibold' 
                      : 'text-slate-400 font-medium'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-[10px] m-0 leading-none mt-0.5 ${
                    isActive ? 'text-emerald-700 font-medium' : 'text-slate-400'
                  }`}>
                    {step.sub}
                  </p>
                </div>
              </div>

              {/* Right Status Badge */}
              <div className="shrink-0 ml-2">
                {isDone ? (
                  <span className="text-emerald-800 bg-emerald-100/90 border border-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Done ✓
                  </span>
                ) : isActive ? (
                  <span className="inline-flex items-center gap-1 text-emerald-900 bg-emerald-200/80 text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-emerald-600" />
                    Scanning
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px] font-medium px-1">
                    Waiting
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Scientific Credibility Footer */}
      <div className="pt-0.5 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-500">
        <div className="flex items-center gap-1 text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ICAR Protocol</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Secure & Private</span>
        </div>
      </div>

    </div>
  );
}
