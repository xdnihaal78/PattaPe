import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Calendar, ArrowRightLeft, LayoutDashboard } from 'lucide-react';

export default function OfficerHeader() {
  const location = useLocation();
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="bg-emerald-950 text-white border-b-4 border-emerald-600 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Left: PattaPe Logo & Extension Officer Dashboard Title */}
          <div className="flex items-center gap-3">
            <Link 
              to="/officer" 
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-2xl p-1 transition"
            >
              <div className="bg-emerald-600 text-white p-2.5 rounded-2xl border-2 border-emerald-400 shadow-md flex items-center justify-center">
                <Sprout className="w-8 h-8 font-black text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white m-0">
                    PattaPe <span className="text-emerald-300 font-extrabold text-sm sm:text-base">पत्तापे</span>
                  </h1>
                </div>
                <p className="text-sm sm:text-base font-black text-emerald-300 m-0 leading-tight">
                  Extension Officer Dashboard
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Current Date & Simple Navigation */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-between md:justify-end">
            
            {/* Current Date Display */}
            <div className="flex items-center gap-2 bg-emerald-900/90 border border-emerald-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-100 shadow-inner">
              <Calendar className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{todayStr}</span>
            </div>

            {/* Simple Navigation */}
            <nav className="flex items-center gap-2">
              <Link
                to="/officer"
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition ${
                  location.pathname === '/officer'
                    ? 'bg-emerald-800 text-white border border-emerald-500 shadow'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </Link>

              {/* Switch to Farmer View */}
              <Link
                to="/"
                className="btn-touch px-3.5 py-2 bg-slate-900 hover:bg-black active:bg-slate-950 text-white rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 border border-slate-700 shadow transition"
                title="Switch to Farmer Crop Doctor View"
              >
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Farmer App View</span>
                <span className="sm:hidden">Farmer View</span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-300 opacity-80" />
              </Link>
            </nav>

          </div>

        </div>
      </div>
    </header>
  );
}
