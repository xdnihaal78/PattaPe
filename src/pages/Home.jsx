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

  const [showCropAlert, setShowCropAlert] = useState(false);

  const handleContinue = () => {
    if (selectedCrop) {
      setShowCropAlert(false);
      navigate('/upload');
    } else {
      setShowCropAlert(true);
    }
  };

  const handleSelectWithClear = (crop) => {
    setShowCropAlert(false);
    onSelectCrop(crop);
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
              onSelect={handleSelectWithClear}
              currentLang={currentLang}
            />
          ))}
        </div>
      )}

      {/* No Crop Selected Error Banner */}
      {showCropAlert && (
        <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm font-bold text-amber-950 animate-in fade-in">
          <span className="text-xl">🌾</span>
          <div>
            <span className="font-black block">Please choose your crop first</span>
            <span>Tap one of the crops above (Rice, Chilli, Banana, Groundnut, Sugarcane) to proceed with diagnosis.</span>
          </div>
        </div>
      )}

      {/* Continue Action Button */}
      <div className="pt-2 sticky bottom-16 z-30">
        <button
          type="button"
          onClick={handleContinue}
          className={`w-full min-h-[48px] font-black rounded-2xl p-3 text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
            selectedCrop
              ? 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border border-emerald-800 focus:ring-2 focus:ring-emerald-400 active:scale-98'
              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-2 border-amber-400'
          }`}
        >
          <span>{selectedCrop ? (t.continue || 'Continue') : 'Select a Crop Above'}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
}
