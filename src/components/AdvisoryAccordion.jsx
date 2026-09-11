import React, { useState } from 'react';
import { Leaf, FlaskConical, Shield, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../utils/helpers';

export default function AdvisoryAccordion({ advisory, currentLang }) {
  const [activeTab, setActiveTab] = useState('chemical'); // default chemical for quick dosage
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (!advisory) return null;

  const tabs = [
    {
      id: 'cultural',
      label: t.culturalTab,
      icon: Leaf,
      items: advisory.cultural || []
    },
    {
      id: 'chemical',
      label: t.chemicalTab,
      icon: FlaskConical,
      items: advisory.chemical || []
    },
    {
      id: 'prevention',
      label: t.preventionTab,
      icon: Shield,
      items: advisory.prevention || []
    }
  ];

  const currentTabObj = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="bg-white rounded-3xl p-5 border-4 border-slate-300 shadow-xl space-y-4">
      
      {/* Title */}
      <h3 className="text-xl font-black text-slate-900 m-0 flex items-center gap-2">
        <FlaskConical className="w-7 h-7 text-emerald-700 stroke-[2.5]" />
        <span>{t.advisoryHeader}</span>
      </h3>

      {/* Tab Selectors - Large Tap Targets */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border-2 border-slate-300">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn-touch flex-col p-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-lg border-2 border-emerald-500 scale-[1.02]'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-6 h-6 mb-1 mx-auto" />
              <span className="leading-tight block">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Box */}
      <div className="bg-emerald-50/60 rounded-2xl p-4 border-2 border-emerald-300 space-y-3">
        {currentTabObj.items.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border-2 border-emerald-200 shadow-sm flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <h4 className="text-lg font-black text-slate-950 m-0 leading-tight">
                {item.title}
              </h4>
              <p className="text-base font-bold text-slate-800 m-0 mt-1 leading-snug">
                {currentLang === 'hi' && item.local ? item.local : item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
