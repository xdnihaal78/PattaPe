import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  Eye, 
  AlertOctagon, 
  ChevronDown, 
  ChevronUp, 
  BookOpen
} from 'lucide-react';

/**
 * AdvisoryAccordion Component
 * Creates expandable/collapsible sections:
 * - What is this? (advisory.what_it_is)
 * - Do Now (advisory.do_now)
 * - Watch For (advisory.watch_for)
 * - Avoid (advisory.avoid)
 * Proportionally sized with comfortable tap targets.
 */
export default function AdvisoryAccordion({ advisory, currentLang = 'en' }) {
  if (!advisory) return null;

  const [openSections, setOpenSections] = useState({
    what_it_is: true,
    do_now: true,
    watch_for: false,
    avoid: false
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const sections = [
    {
      key: 'what_it_is',
      title: currentLang === 'hi' ? 'यह बीमारी क्या है?' : 'What is this?',
      subtitle: currentLang === 'hi' ? 'रोग का विवरण व कारण' : 'Disease description & cause',
      icon: HelpCircle,
      iconColor: 'text-blue-700 bg-blue-100 border-blue-200',
      type: 'text',
      content: advisory.what_it_is
    },
    {
      key: 'do_now',
      title: currentLang === 'hi' ? 'तुरंत क्या करें?' : 'Do Now',
      subtitle: currentLang === 'hi' ? 'खेत में तुरंत उठाए जाने वाले कदम' : 'Urgent immediate actions in your field',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700 bg-emerald-100 border-emerald-200',
      type: 'list',
      items: advisory.do_now || []
    },
    {
      key: 'watch_for',
      title: currentLang === 'hi' ? 'किन बातों पर ध्यान रखें?' : 'Watch For',
      subtitle: currentLang === 'hi' ? 'रोग के नए लक्षण व बदलाव' : 'Key warning signs & spread symptoms',
      icon: Eye,
      iconColor: 'text-amber-700 bg-amber-100 border-amber-200',
      type: 'list',
      items: advisory.watch_for || []
    },
    {
      key: 'avoid',
      title: currentLang === 'hi' ? 'क्या न करें?' : 'Avoid',
      subtitle: currentLang === 'hi' ? 'इन गलतियों से बीमारी तेजी से फैल सकती है' : 'Practices that may worsen the infection',
      icon: AlertOctagon,
      iconColor: 'text-red-700 bg-red-100 border-red-200',
      type: 'list',
      items: advisory.avoid || []
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 m-0 leading-tight">
            {currentLang === 'hi' ? 'कृषि सलाह व उपचार' : 'Actionable Crop Advisory'}
          </h2>
          <p className="text-[11px] font-semibold text-slate-500 m-0 mt-0.5">
            {currentLang === 'hi' ? 'प्रमाणित सुरक्षित उपचार' : 'Expert-verified guidance for recovery'}
          </p>
        </div>

        {advisory.source && (
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 hidden sm:inline-block">
            Verified Source
          </span>
        )}
      </div>

      {/* Accordion Sections */}
      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = openSections[section.key];
          const Icon = section.icon;

          return (
            <div 
              key={section.key}
              className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className={`w-full min-h-[44px] p-3 text-left flex items-center justify-between gap-2.5 transition-colors ${
                  isOpen ? 'bg-slate-50/90 border-b border-slate-200' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${section.iconColor}`}>
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 m-0 leading-tight">
                      {section.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 m-0 mt-0.5">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-1 text-slate-500 shrink-0">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
              </button>

              {/* Accordion Content Body */}
              {isOpen && (
                <div className="p-3 bg-white space-y-2 animate-in fade-in duration-200">
                  
                  {/* Text Type (What is this) */}
                  {section.type === 'text' && (
                    <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200/70">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 m-0 leading-relaxed">
                        {section.content || 'A crop pathology condition requiring field sanitation and moisture monitoring.'}
                      </p>
                    </div>
                  )}

                  {/* List Type (Do Now, Watch For, Avoid) */}
                  {section.type === 'list' && (
                    <div className="space-y-1.5">
                      {Array.isArray(section.items) && section.items.length > 0 ? (
                        section.items.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-start gap-2.5"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                            <p className="text-xs sm:text-sm font-bold text-slate-900 m-0 leading-snug">
                              {typeof item === 'string' ? item : item.title || item.detail}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-semibold text-slate-400 italic m-0 p-1">
                          No specific notes provided.
                        </p>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Source Citation */}
      {advisory.source && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 pt-1.5 border-t border-slate-100">
          <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>
            {currentLang === 'hi' ? 'स्रोत:' : 'Source:'}{' '}
            <strong className="text-slate-700 font-bold">{advisory.source}</strong>
          </span>
        </div>
      )}

    </div>
  );
}
