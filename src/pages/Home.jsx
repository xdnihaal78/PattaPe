import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CropCard from '../components/CropCard';
import { getCrops } from '../services/api';

export default function Home({ selectedCrop, onSelectCrop }) {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 pb-28">
      
      {/* Title & Subtitle */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 m-0 tracking-tight leading-tight">
          What crop are you growing?
        </h1>
        <p className="text-lg sm:text-xl font-extrabold text-emerald-800 m-0">
          Select your crop to get an accurate diagnosis
        </p>
      </div>

      {/* 5 Large Crop Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">Loading crops...</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {crops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              isSelected={selectedCrop?.id === crop.id}
              onSelect={onSelectCrop}
            />
          ))}
        </div>
      )}

      {/* Large Continue Action Button */}
      <div className="pt-4 sticky bottom-20 z-30">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedCrop}
          className={`w-full btn-touch min-h-[64px] font-black rounded-3xl p-4 text-2xl flex items-center justify-center gap-3 shadow-2xl transition-all ${
            selectedCrop
              ? 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border-4 border-emerald-900 focus:ring-4 focus:ring-emerald-400 active:scale-95'
              : 'bg-slate-300 text-slate-500 border-4 border-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-8 h-8 stroke-[3]" />
        </button>
      </div>

    </div>
  );
}
