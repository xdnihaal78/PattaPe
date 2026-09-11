import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, FileText, PhoneCall } from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

export default function BottomNavigation({ currentLang, hasResult }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t-4 border-emerald-600 text-white z-40 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around p-2">
        
        {/* Step 1: Crop Select */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex-1 btn-touch flex-col py-2 px-1 rounded-2xl transition font-extrabold text-center ${
              isActive
                ? 'bg-emerald-700 text-white border-2 border-emerald-400 shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`
          }
        >
          <Home className="w-7 h-7 mb-1 mx-auto" />
          <span className="text-xs sm:text-sm font-bold block">1. Crop</span>
        </NavLink>

        {/* Step 2: Upload Leaf */}
        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `flex-1 btn-touch flex-col py-2 px-1 rounded-2xl transition font-extrabold text-center mx-1 ${
              isActive
                ? 'bg-emerald-700 text-white border-2 border-emerald-400 shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`
          }
        >
          <Camera className="w-7 h-7 mb-1 mx-auto" />
          <span className="text-xs sm:text-sm font-bold block">2. Photo</span>
        </NavLink>

        {/* Step 3: Result */}
        <NavLink
          to="/result"
          className={({ isActive }) =>
            `flex-1 btn-touch flex-col py-2 px-1 rounded-2xl transition font-extrabold text-center ${
              !hasResult
                ? 'opacity-50 cursor-not-allowed text-slate-500'
                : isActive
                ? 'bg-emerald-700 text-white border-2 border-emerald-400 shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`
          }
        >
          <FileText className="w-7 h-7 mb-1 mx-auto" />
          <span className="text-xs sm:text-sm font-bold block">3. Report</span>
        </NavLink>

      </div>
    </nav>
  );
}
