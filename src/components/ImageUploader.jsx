import React, { useRef } from 'react';
import { Camera, Upload, RotateCcw, CheckCircle, Sparkles } from 'lucide-react';

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

export default function ImageUploader({ selectedImage, onImageSelected }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      
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

      {/* If Image Selected - Large Image Preview & Retake Button */}
      {selectedImage ? (
        <div className="bg-white rounded-3xl p-5 border-4 border-emerald-600 shadow-xl text-center space-y-4">
          
          <div className="relative rounded-2xl overflow-hidden border-3 border-emerald-700 bg-slate-950 aspect-4/3 max-h-80 flex items-center justify-center shadow-inner">
            <img 
              src={selectedImage} 
              alt="Leaf Preview" 
              className="w-full h-full object-cover"
            />
            {/* Visual Guide Border */}
            <div className="absolute inset-0 border-4 border-dashed border-emerald-400 opacity-60 pointer-events-none rounded-2xl m-3" />
            <div className="absolute bottom-3 bg-emerald-900/90 text-white text-sm font-black px-4 py-1.5 rounded-full backdrop-blur-md border border-emerald-400">
              Leaf Photo Ready
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
              className="w-full btn-touch min-h-[56px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 border-3 border-slate-400 font-black rounded-2xl text-xl flex items-center justify-center gap-3 shadow-md focus:ring-4 focus:ring-slate-300"
            >
              <RotateCcw className="w-7 h-7 text-slate-700 stroke-[2.5]" />
              <span>Retake Photo</span>
            </button>
          </div>

        </div>
      ) : (
        /* Upload Options Container */
        <div className="bg-white rounded-3xl p-6 border-4 border-slate-300 shadow-lg text-center space-y-4">
          
          <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto border-3 border-emerald-400 shadow-sm">
            <Camera className="w-10 h-10 stroke-[2.5]" />
          </div>

          <p className="text-base font-extrabold text-slate-700 m-0">
            Choose how you want to add leaf photo:
          </p>

          {/* Take Photo Button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full btn-touch min-h-[64px] bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-black rounded-2xl p-4 text-xl flex items-center justify-center gap-3 shadow-xl border-3 border-emerald-900 focus:ring-4 focus:ring-emerald-400"
          >
            <Camera className="w-8 h-8 text-white stroke-[2.5]" />
            <span>Take Photo</span>
          </button>

          {/* Upload from Gallery Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full btn-touch min-h-[60px] bg-slate-900 hover:bg-slate-950 active:bg-black text-white font-black rounded-2xl p-4 text-lg flex items-center justify-center gap-3 shadow-md border-3 border-slate-700 focus:ring-4 focus:ring-slate-400"
          >
            <Upload className="w-7 h-7 text-slate-300 stroke-[2.5]" />
            <span>Upload from Gallery</span>
          </button>

          {/* Demo Sample Leaf Picker */}
          <div className="pt-3 border-t-2 border-slate-200">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Or try with sample leaf photo</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_LEAVES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onImageSelected(sample.url)}
                  className="btn-touch p-2 bg-slate-50 border-2 border-slate-300 hover:border-emerald-600 rounded-2xl text-left flex items-center gap-2 transition hover:bg-emerald-50"
                >
                  <img src={sample.url} alt={sample.name} className="w-12 h-12 rounded-xl object-cover border border-slate-300" />
                  <span className="text-xs font-black text-slate-900 leading-tight">Sample Leaf</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Simple Photo Tips */}
      <div className="bg-emerald-50 rounded-3xl p-5 border-3 border-emerald-300 space-y-2 text-left">
        <h4 className="text-lg font-black text-emerald-950 m-0">Photo Tips:</h4>
        <ul className="space-y-2 m-0 p-0 list-none">
          <li className="flex items-center gap-2.5 text-base font-extrabold text-emerald-900">
            <CheckCircle className="w-6 h-6 text-emerald-700 shrink-0 stroke-[3]" />
            <span>Use good lighting</span>
          </li>
          <li className="flex items-center gap-2.5 text-base font-extrabold text-emerald-900">
            <CheckCircle className="w-6 h-6 text-emerald-700 shrink-0 stroke-[3]" />
            <span>Keep the leaf clearly visible</span>
          </li>
          <li className="flex items-center gap-2.5 text-base font-extrabold text-emerald-900">
            <CheckCircle className="w-6 h-6 text-emerald-700 shrink-0 stroke-[3]" />
            <span>Focus on the damaged area</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
