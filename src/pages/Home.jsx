import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CropCard from '../components/CropCard';
import { getCrops } from '../services/api';
import { TRANSLATIONS } from '../utils/helpers';

export default function Home({ selectedCrop, onSelectCrop, currentLang = 'en' }) {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  useEffect(() => {
    async function loadCrops() {
      const data = await getCrops();
      setCrops(data);
      setLoading(false);
    }
    loadCrops();
  }, []);

  const handleContinue = () => {
    if (selectedCrop) {
      navigate('/upload');
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto px-4 py-4 space-y-4 pb-24">
      
      {/* Title & Subtitle */}
      <div className="text-center space-y-1 pt-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-tight">
          {t.whatCrop || 'What crop are you growing?'}
        </h1>
        <p className="text-xs sm:text-sm font-bold text-emerald-800 m-0">
          {t.selectCropSub || 'Select your crop to get an accurate diagnosis'}
        </p>
      </div>

      {/* 5 Crop Cards */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
          <p className="text-xs font-bold text-slate-600">{t.loadingCrops || 'Loading crops...'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {crops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              isSelected={selectedCrop?.id === crop.id}
              onSelect={onSelectCrop}
              currentLang={currentLang}
            />
          ))}
        </div>
      )}

      {/* Continue Action Button */}
      <div className="pt-2 sticky bottom-16 z-30">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedCrop}
          className={`w-full min-h-[48px] font-black rounded-2xl p-3 text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
            selectedCrop
              ? 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border border-emerald-800 focus:ring-2 focus:ring-emerald-400 active:scale-98'
              : 'bg-slate-300 text-slate-500 border border-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <span>{t.continue || 'Continue'}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
}
