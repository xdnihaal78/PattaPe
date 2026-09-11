import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, FileText } from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

export default function BottomNavigation({ currentLang, hasResult }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white z-40 shadow-xl">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
        
        {/* Step 1: Crop Select */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all font-bold text-center ${
              isActive
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] block leading-tight">1. Crop</span>
        </NavLink>

        {/* Step 2: Upload Leaf */}
        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all font-bold text-center mx-1 ${
              isActive
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`
          }
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] block leading-tight">2. Photo</span>
        </NavLink>

        {/* Step 3: Result */}
        <NavLink
          to="/result"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all font-bold text-center ${
              !hasResult
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : isActive
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] block leading-tight">3. Report</span>
        </NavLink>

      </div>
    </nav>
  );
}
