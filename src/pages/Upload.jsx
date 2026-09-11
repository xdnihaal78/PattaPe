import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import FarmerErrorState from '../components/FarmerErrorState';
import { TRANSLATIONS } from '../utils/helpers';

export default function Upload({ selectedCrop, uploadedImage, onImageSelected, currentLang = 'en' }) {
  const navigate = useNavigate();
  const [showImageAlert, setShowImageAlert] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // 1. Error state: No Crop Selected
  if (!selectedCrop) {
    return (
      <FarmerErrorState
        type="no_crop"
        currentLang={currentLang}
        onChooseCrop={() => navigate('/')}
        onGoBack={() => navigate('/')}
      />
    );
  }

  const cropTitle = selectedCrop?.names_i18n?.[currentLang] || selectedCrop?.name;

  const handleAnalyzeClick = () => {
    // 2. Error state: No Image Selected
    if (!uploadedImage) {
      setShowImageAlert(true);
      return;
    }

    try {
      localStorage.setItem('pattape_temp_image', uploadedImage);
    } catch (e) {
      console.error(e);
    }
    navigate('/analyzing');
  };

  const handleImageChange = (img) => {
    setShowImageAlert(false);
    onImageSelected(img);
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto px-4 py-4 space-y-4 pb-24">
      
      {/* Back Button & Crop Reminder */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>{t.back || 'Back'}</span>
        </button>

        <div className="bg-emerald-50 text-emerald-950 font-bold px-3 py-1 rounded-xl border border-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm shadow-xs">
          <span className="text-base sm:text-lg">{selectedCrop.icon}</span>
          <span>{cropTitle}</span>
        </div>
      </div>

      {/* Page Heading & Subtitle */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-tight">
          {t.takePhotoTitle || 'Take a photo of the affected leaf'}
        </h1>
        <p className="text-xs sm:text-sm font-bold text-emerald-800 m-0">
          {t.takePhotoSub || 'Make sure the damaged area is clearly visible'}
        </p>
      </div>

      {/* No Image Warning Banner */}
      {showImageAlert && !uploadedImage && (
        <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm font-bold text-amber-950 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-black block">Leaf Photo Needed</span>
            <span>Please take a photo with your camera or select one from your phone before analyzing.</span>
          </div>
        </div>
      )}

      {/* Large Image Upload Area & Photo Tips */}
      <ImageUploader
        selectedImage={uploadedImage}
        onImageSelected={handleImageChange}
        currentLang={currentLang}
      />

      {/* Primary Action Button: Analyze My Crop */}
      <div className="pt-2 sticky bottom-16 z-30">
        <button
          type="button"
          onClick={handleAnalyzeClick}
          className={`w-full min-h-[48px] font-black rounded-2xl p-3 text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
            uploadedImage
              ? 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border border-emerald-800 focus:ring-2 focus:ring-emerald-400 active:scale-98'
              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-2 border-amber-400'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{uploadedImage ? (t.analyzeMyCrop || 'Analyze My Crop') : 'Choose a Photo Above'}</span>
        </button>
      </div>

    </div>
  );
}
