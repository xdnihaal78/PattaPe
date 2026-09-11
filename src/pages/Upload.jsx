import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

export default function Upload({ selectedCrop, uploadedImage, onImageSelected }) {
  const navigate = useNavigate();

  const handleAnalyzeClick = () => {
    if (uploadedImage) {
      try {
        localStorage.setItem('pattape_temp_image', uploadedImage);
      } catch (e) {
        console.error(e);
      }
      navigate('/analyzing');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 pb-28">
      
      {/* Back Button & Crop Reminder */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-touch px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-2xl font-black text-sm flex items-center gap-2 border-2 border-slate-400 focus:ring-4 focus:ring-slate-300"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Back</span>
        </button>

        {selectedCrop && (
          <div className="bg-emerald-100 text-emerald-950 font-black px-4 py-2 rounded-2xl border-2 border-emerald-400 flex items-center gap-2 text-sm sm:text-base">
            <span className="text-xl sm:text-2xl">{selectedCrop.icon}</span>
            <span>{selectedCrop.name}</span>
          </div>
        )}
      </div>

      {/* Page Heading & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 m-0 tracking-tight leading-tight">
          Take a photo of the affected leaf
        </h1>
        <p className="text-base sm:text-lg font-extrabold text-emerald-800 m-0">
          Make sure the damaged area is clearly visible
        </p>
      </div>

      {/* Large Image Upload Area & Photo Tips */}
      <ImageUploader
        selectedImage={uploadedImage}
        onImageSelected={onImageSelected}
      />

      {/* Large Primary Action Button: Analyze My Crop */}
      <div className="pt-2 sticky bottom-20 z-30">
        <button
          type="button"
          onClick={handleAnalyzeClick}
          disabled={!uploadedImage}
          className={`w-full btn-touch min-h-[64px] font-black rounded-3xl p-4 text-2xl flex items-center justify-center gap-3 shadow-2xl transition-all ${
            uploadedImage
              ? 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border-4 border-emerald-900 focus:ring-4 focus:ring-emerald-400 active:scale-95'
              : 'bg-slate-300 text-slate-500 border-4 border-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <Sparkles className="w-8 h-8 text-amber-300" />
          <span>Analyze My Crop</span>
        </button>
      </div>

    </div>
  );
}
