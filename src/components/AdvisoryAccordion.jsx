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
import { TRANSLATIONS } from '../utils/helpers';

/**
 * AdvisoryAccordion Component
 * Creates expandable/collapsible sections:
 * - What is this? (advisory.what_it_is)
 * - Do Now (advisory.do_now)
 * - Watch For (advisory.watch_for)
 * - Avoid (advisory.avoid)
 * Full multi-language support (en, hi, ta, kn).
 */
export default function AdvisoryAccordion({ advisory, currentLang = 'en' }) {
  if (!advisory) return null;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

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

  // Localized mock text overrides for standard rice advisory
  const localizedWhatItIs = {
    hi: 'चावल की पत्तियों को प्रभावित करने वाला जीवाणु रोग (बैक्टीरियल ब्लाइट)।',
    ta: 'நெல் பயிரின் இலைகளைத் தாக்கும் பாக்டீரியா இலைக்கருகல் நோய்.',
    kn: 'ಭತ್ತದ ಎಲೆಗಳಿಗೆ ಹಾನಿ ಮಾಡುವ ದುಂಡಾಣು ಕವಚ ರೋಗ (ಬ್ಯಾಕ್ಟೀರಿಯಲ್ ಬ್ಲೈಟ್).'
  };

  const localizedDoNow = {
    hi: [
      'गीले खेतों में काम करने से बचें',
      'खेत से खड़े पानी की तुरंत निकासी करें',
      'संक्रमित औजारों को दूसरे खेत में न ले जाएं'
    ],
    ta: [
      'ஈரமான வயல்களில் வேலை செய்வதைத் தவிர்க்கவும்',
      'வயலில் தேங்கியுள்ள தண்ணீரை உடனடியாக வடிகட்டவும்',
      'பயன்படுத்திய கருவிகளை சுத்தப்படுத்தாமல் அடுத்த வயலில் பயன்படுத்த வேண்டாம்'
    ],
    kn: [
      'ತೇವಾಂಶವಿರುವ ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ',
      'ಹೊಲದಲ್ಲಿ ನಿಂತಿರುವ ಹೆಚ್ಚುವರಿ ನೀರನ್ನು ತಕ್ಷಣ ಹೊರಹಾಕಿ',
      'ಸೋಂಕು ತಗುಲಿದ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಹಾಗೆಯೇ ಬಳಸಬೇಡಿ'
    ]
  };

  const localizedWatchFor = {
    hi: [
      'पत्तियों पर घाव का तेजी से बढ़ना',
      'आसपास के स्वस्थ पत्तों का पीला पड़ना'
    ],
    ta: [
      'இலைகளில் சேதம் வேகமாக பரவுதல்',
      'அருகிலுள்ள இலைகள் மஞ்சள் நிறமாக மாறுதல்'
    ],
    kn: [
      'ಎಲೆಗಳ ಹಾನಿ ವೇಗವಾಗಿ ಹರಡುವುದು',
      'ಹತ್ತಿರದ ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು'
    ]
  };

  const localizedAvoid = {
    hi: [
      'फव्वारा / ऊपर से पानी का छिड़काव',
      'अत्यधिक घनी बुवाई'
    ],
    ta: [
      'மேலிருந்து தண்ணீர் தெளிக்கும் பாசனம்',
      'நெருக்கமாக நடவு செய்தல்'
    ],
    kn: [
      'ಮೇಲಿನಿಂದ ನೀರು ಚಿಮುಕಿಸುವುದು',
      'ಅತಿಯಾದ ಸಾಂದ್ರತೆಯ ಬಿತ್ತನೆ'
    ]
  };

  const sections = [
    {
      key: 'what_it_is',
      title: t.whatIsThis || 'What is this?',
      subtitle: t.whatIsThisSub || 'Disease description & cause',
      icon: HelpCircle,
      iconColor: 'text-blue-700 bg-blue-100 border-blue-200',
      type: 'text',
      content: localizedWhatItIs[currentLang] || advisory.what_it_is
    },
    {
      key: 'do_now',
      title: t.doNow || 'Do Now',
      subtitle: t.doNowSub || 'Urgent immediate actions in your field',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700 bg-emerald-100 border-emerald-200',
      type: 'list',
      items: localizedDoNow[currentLang] || advisory.do_now || []
    },
    {
      key: 'watch_for',
      title: t.watchFor || 'Watch For',
      subtitle: t.watchForSub || 'Key warning signs & spread symptoms',
      icon: Eye,
      iconColor: 'text-amber-700 bg-amber-100 border-amber-200',
      type: 'list',
      items: localizedWatchFor[currentLang] || advisory.watch_for || []
    },
    {
      key: 'avoid',
      title: t.avoid || 'Avoid',
      subtitle: t.avoidSub || 'Practices that may worsen the infection',
      icon: AlertOctagon,
      iconColor: 'text-red-700 bg-red-100 border-red-200',
      type: 'list',
      items: localizedAvoid[currentLang] || advisory.avoid || []
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 m-0 leading-tight">
            {t.advisoryHeader || 'Actionable Crop Advisory'}
          </h2>
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-800 block">
            {currentLang === 'hi' ? 'विशेषज्ञों द्वारा प्रमाणित उपचार योजना' : currentLang === 'ta' ? 'நிபுணர்களால் சரிபார்க்கப்பட்ட சிகிச்சை திட்டம்' : currentLang === 'kn' ? 'ತಜ್ಞರಿಂದ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟ ಚಿಕಿತ್ಸಾ ಯೋಜನೆ' : 'Expert-verified guidance for recovery'}
          </span>
        </div>

        <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 font-bold px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
          <BookOpen className="w-3 h-3 text-emerald-700" />
          <span>{t.verifiedSource || 'Verified Source'}</span>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-2">
        {sections.map((sec) => {
          const isOpen = Boolean(openSections[sec.key]);
          const Icon = sec.icon;

          return (
            <div 
              key={sec.key}
              className="border border-slate-200 rounded-xl overflow-hidden transition-all shadow-xs"
            >
              {/* Accordion Header / Trigger Button */}
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                className={`w-full p-3 flex items-center justify-between text-left transition-colors ${
                  isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${sec.iconColor}`}>
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 m-0 leading-tight">
                      {sec.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 m-0 leading-tight truncate">
                      {sec.subtitle}
                    </p>
                  </div>
                </div>

                <div className="ml-2 text-slate-400 shrink-0">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
              </button>

              {/* Accordion Expanded Content */}
              {isOpen && (
                <div className="p-3 bg-white border-t border-slate-100 animate-in fade-in duration-150">
                  {sec.type === 'text' ? (
                    <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed m-0">
                      {sec.content}
                    </p>
                  ) : (
                    <ul className="space-y-1.5 m-0 p-0 list-none">
                      {sec.items.map((item, idx) => (
                        <li 
                          key={idx}
                          className="text-xs sm:text-sm font-semibold text-slate-800 flex items-start gap-2 leading-snug"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Advisory Source Footnote */}
      {advisory.source && (
        <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium pt-1 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1">
          <span className="font-bold text-slate-600">{t.officialSource || 'Official Guidance Source'}:</span>
          <span className="italic">{advisory.source}</span>
        </div>
      )}

    </div>
  );
}
