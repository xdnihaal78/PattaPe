import React, { useEffect, useState } from 'react';
import { Scan, CheckCircle2, Loader2, Leaf, ShieldAlert } from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

export default function LoadingScreen({ leafImage, currentLang }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { title: 'Extracting Leaf Lesions & Texture', sub: 'पत्ती के धब्बों और बनावट की जांच' },
    { title: 'Matching AI Disease Database (99.4% Accuracy)', sub: 'एआई बीमारी डेटाबेस से मिलान' },
    { title: 'Calculating Weather Spread & Severity Index', sub: 'मौसम और बीमारी के फैलाव की गणना' },
    { title: 'Generating Tailored IPM Advisory', sub: 'उपचार और दवा की सिफारिश तैयार' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 border-4 border-emerald-600 shadow-2xl text-center space-y-6">
      
      {/* Animated Scanning Frame */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-emerald-700 bg-slate-950 aspect-square flex items-center justify-center shadow-inner">
        {leafImage ? (
          <img src={leafImage} alt="Leaf Scan" className="w-full h-full object-cover opacity-80" />
        ) : (
          <Leaf className="w-24 h-24 text-emerald-500 animate-pulse" />
        )}

        {/* Scanning Radar Laser Overlay Line */}
        <div className="absolute inset-x-0 h-1.5 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-scan-line" />
        
        {/* Corner Grid Overlays */}
        <div className="absolute top-4 left-4 border-t-4 border-l-4 border-emerald-400 w-8 h-8 rounded-tl-lg" />
        <div className="absolute top-4 right-4 border-t-4 border-r-4 border-emerald-400 w-8 h-8 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 border-b-4 border-l-4 border-emerald-400 w-8 h-8 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 border-b-4 border-r-4 border-emerald-400 w-8 h-8 rounded-br-lg" />

        {/* Status Badge */}
        <div className="absolute bottom-3 bg-emerald-950/90 text-white border-2 border-emerald-400 font-extrabold px-4 py-2 rounded-full flex items-center gap-2 text-sm backdrop-blur-md">
          <Scan className="w-5 h-5 text-emerald-300 animate-spin" />
          <span>AI Scanning Active</span>
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 m-0 leading-tight">
          {t.step3Title}
        </h2>
        <p className="text-base font-extrabold text-emerald-800 m-0 mt-1">
          {t.step3Sub}
        </p>
      </div>

      {/* Progress Step List */}
      <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 text-left space-y-3">
        {steps.map((step, idx) => {
          const isDone = idx < stepIndex;
          const isCurrent = idx === stepIndex;
          return (
            <div key={idx} className="flex items-start gap-3">
              {isDone ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 stroke-[3] mt-0.5" />
              ) : isCurrent ? (
                <Loader2 className="w-6 h-6 text-emerald-600 shrink-0 animate-spin mt-0.5" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-base font-bold m-0 leading-tight ${
                  isCurrent ? 'text-emerald-950 font-black' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs font-semibold text-slate-500 m-0">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
