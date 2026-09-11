import React, { useRef, useState } from 'react';
import { Camera, Upload, RotateCcw, CheckCircle, Sparkles } from 'lucide-react';
import FarmerErrorState from './FarmerErrorState';
import { TRANSLATIONS } from '../utils/helpers';

const SAMPLE_LEAVES = [
  {
    id: 'sample1',
    name: 'Sample Leaf 1',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'sample2',
    name: 'Sample Leaf 2',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'
  }
];

export default function ImageUploader({ selectedImage, onImageSelected, currentLang = 'en' }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [uploadError, setUploadError] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const photoTips = {
    en: [
      'Take photo under clear sunlight',
      'Keep the leaf flat and focused',
      'Capture the damaged or discolored area'
    ],
    hi: [
      'अच्छी धूप में फोटो खींचें',
      'पत्ती को सीधा और साफ रखें',
      'रोगग्रस्त और धब्बे वाले हिस्से पर फोकस करें'
    ],
    ta: [
      'நல்ல சூரிய வெளிச்சத்தில் படம் எடுக்கவும்',
      'இலை தெளிவாகவும் நேராகவும் இருக்க வேண்டும்',
      'பாதிக்கப்பட்ட புள்ளி பகுதியில் கவனம் செலுத்தவும்'
    ],
    kn: [
      'ಉತ್ತಮ ಸೂರ್ಯನ ಬೆಳಕಿನಲ್ಲಿ ಫೋಟೋ ತೆಗೆಯಿರಿ',
      'ಎಲೆಯು ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತು ನೇರವಾಗಿರಲಿ',
      'ರೋಗಪೀಡಿತ ಮತ್ತು ಮಚ್ಚೆಯುಳ್ಳ ಭಾಗದ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ'
    ]
  };

  const tipsList = photoTips[currentLang] || photoTips.en;

  const handleFileChange = (e) => {
    setUploadError(false);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check valid image type
    if (file.type && !file.type.startsWith('image/')) {
      setUploadError(true);
      return;
    }

    // Check non-zero size
    if (file.size === 0) {
      setUploadError(true);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setUploadError(false);
          onImageSelected(reader.result);
        } else {
          setUploadError(true);
        }
      };
      reader.onerror = () => {
        setUploadError(true);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      setUploadError(true);
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto space-y-4">
      
      {/* Hidden File Inputs supporting image/* and mobile camera capture */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Error Banner */}
      {uploadError && (
        <FarmerErrorState
          type="upload_failed"
          compact={true}
          currentLang={currentLang}
          onChooseAnotherPhoto={() => fileInputRef.current?.click()}
          onRetry={() => cameraInputRef.current?.click()}
        />
      )}

      {/* If Image Selected - Preview & Retake Button */}
      {selectedImage ? (
        <div className="bg-white rounded-2xl p-4 border border-emerald-600 shadow-sm text-center space-y-3">
          
          <div className="relative rounded-xl overflow-hidden border border-emerald-700 bg-slate-950 aspect-[4/3] max-h-72 flex items-center justify-center shadow-inner">
            <img 
              src={selectedImage} 
              alt="Leaf Preview" 
              className="w-full h-full object-cover"
            />
            {/* Visual Guide Border */}
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400 opacity-70 pointer-events-none rounded-xl m-2" />
            <div className="absolute bottom-2.5 bg-emerald-900/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs border border-emerald-400">
              {t.leafPhotoReady || 'Leaf Photo Ready'}
            </div>
          </div>

          {/* Retake Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                onImageSelected(null);
                cameraInputRef.current?.click();
              }}
              className="w-full min-h-[44px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-slate-700 stroke-[2.5]" />
              <span>{t.retakePhoto || 'Retake Photo'}</span>
            </button>
          </div>

        </div>
      ) : (
        /* Upload Options Container */
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs text-center space-y-3.5">
          
          <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto border border-emerald-300 shadow-xs">
            <Camera className="w-7 h-7 stroke-[2.5]" />
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-700 m-0">
            {t.choosePhotoPrompt || 'Choose how you want to add leaf photo:'}
          </p>

          {/* Action Buttons: Camera and Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full min-h-[46px] bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xl px-3 py-2 text-sm flex items-center justify-center gap-2 shadow-sm border border-emerald-800 active:scale-98 transition-all"
            >
              <Camera className="w-5 h-5 text-emerald-200 stroke-[2.5]" />
              <span>{t.takePhoto || 'Take Photo'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[46px] bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold rounded-xl px-3 py-2 text-sm flex items-center justify-center gap-2 shadow-sm border border-slate-700 active:scale-98 transition-all"
            >
              <Upload className="w-4 h-4 text-slate-300 stroke-[2.5]" />
              <span>{t.uploadGallery || 'Upload from Gallery'}</span>
            </button>
          </div>

          {/* Demo Sample Leaf Picker */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.orSamplePhoto || 'Or try with sample leaf photo'}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_LEAVES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onImageSelected(sample.url)}
                  className="p-1.5 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl text-left flex items-center gap-2 transition hover:bg-emerald-50/60"
                >
                  <img src={sample.url} alt={sample.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {currentLang === 'hi' ? 'नमूना पत्ती' : currentLang === 'ta' ? 'மாதிரி இலை' : currentLang === 'kn' ? 'ಮಾದರಿ ಎಲೆ' : 'Sample Leaf'}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Simple Photo Tips */}
      <div className="bg-emerald-50/80 rounded-2xl p-3.5 sm:p-4 border border-emerald-200 space-y-1.5 text-left">
        <h4 className="text-xs sm:text-sm font-black text-emerald-950 m-0">
          {currentLang === 'hi' ? 'फोटो लेते समय सुझाव:' : currentLang === 'ta' ? 'புகைப்பட குறிப்புகள்:' : currentLang === 'kn' ? 'ಫೋಟೋ ಸಲಹೆಗಳು:' : 'Photo Tips:'}
        </h4>
        <ul className="space-y-1 m-0 p-0 list-none text-xs font-semibold text-emerald-900">
          {tipsList.map((tip, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[2.5]" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
