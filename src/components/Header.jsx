import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ShieldAlert } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { TRANSLATIONS } from '../utils/helpers';

export default function Header({ selectedCrop, currentLang, onLanguageChange }) {
  const navigate = useNavigate();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <header className="bg-emerald-900 text-white border-b-4 border-emerald-600 sticky top-0 z-40 shadow-xl">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo & Branding */}
        <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-400 rounded-xl p-1">
          <div className="bg-emerald-500 text-emerald-950 p-2 rounded-xl border-2 border-white shadow-md">
            <Sprout className="w-8 h-8 font-black" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white m-0">
              PattaPe <span className="text-emerald-300 font-extrabold">पत्तापे</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-emerald-200 m-0">
              AI Crop Doctor
            </p>
          </div>
        </Link>

        {/* Right side: Crop Badge & Language Selector */}
        <div className="flex items-center gap-3">
          {selectedCrop && (
            <div 
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-2 bg-emerald-800 border-2 border-emerald-500 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-emerald-700 transition"
              title={t.changeCrop}
            >
              <span className="text-xl">{selectedCrop.icon}</span>
              <div className="text-left">
                <p className="text-xs text-emerald-200 font-bold m-0 leading-none">Crop</p>
                <p className="text-sm font-black text-white m-0 leading-tight">{selectedCrop.name.split('/')[0]}</p>
              </div>
            </div>
          )}

          <Link
            to="/officer"
            className="inline-flex items-center gap-1.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500 shadow-sm transition"
            title="Open Extension Officer Console"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">Officer Portal</span>
            <span className="xs:hidden">Officer</span>
          </Link>

          <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
        </div>

      </div>
    </header>
  );
}
