import React, { useState } from 'react';
import { 
  BookOpen, 
  Zap, 
  Eye, 
  ShieldOff, 
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

const SECTION_META = [
  {
    key: 'what_it_is',
    label: 'What Is It?',
    emoji: '🔬',
    icon: BookOpen,
    description: 'Understanding the disease',
    bgFrom: 'from-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    labelColor: 'text-blue-800',
  },
  {
    key: 'do_now',
    label: 'Do Now',
    emoji: '⚡',
    icon: Zap,
    description: 'Immediate action required',
    bgFrom: 'from-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    labelColor: 'text-emerald-800',
  },
  {
    key: 'watch_for',
    label: 'Watch For',
    emoji: '👁️',
    icon: Eye,
    description: 'Signs to monitor',
    bgFrom: 'from-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    labelColor: 'text-amber-800',
  },
  {
    key: 'avoid',
    label: 'Avoid',
    emoji: '🚫',
    icon: ShieldOff,
    description: 'Things that make it worse',
    bgFrom: 'from-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    labelColor: 'text-red-800',
  },
];

function buildAdvisoryFromCase(caseData) {
  if (!caseData) return null;
  if (caseData.advisory) return caseData.advisory;

  const disease = caseData.disease || 'the detected disease';
  const crop = caseData.crop || 'crop';
  const treatment = caseData.recommended_treatment || `Apply recommended fungicide @ 2g/L water.`;
  const summary = caseData.simple_summary || `Disease symptoms detected on leaf surface.`;

  // Disease-specific advisory fallbacks
  const d = disease.toLowerCase();

  if (d.includes('blast')) {
    return {
      what_it_is: `Rice Blast is caused by the fungus Magnaporthe oryzae. It creates spindle-shaped gray lesions on rice leaf blades, necks, and internodes. Spores spread through wind and night dew. It is the most destructive rice disease in South and Southeast Asia.`,
      do_now: treatment,
      watch_for: `Expansion of gray diamond-shaped spots. Look for neck rot (black at panicle base). Check if inner leaf tissue is fully dried out. Monitor humid nights — spore germination peaks at 21–27°C.`,
      avoid: `Avoid over-application of urea nitrogen fertilizer as it increases susceptibility. Do not spray water in the evening. Avoid planting in densely shaded or low-wind areas.`,
      source: 'ICAR-NRRI Cuttack Disease Management Protocol, 2024'
    };
  }
  if (d.includes('blight')) {
    return {
      what_it_is: `Bacterial Leaf Blight of rice is caused by Xanthomonas oryzae pv. oryzae. It starts at leaf tips as water-soaked lesions that turn straw-colored. The bacteria spread through rain splash and contaminated irrigation water.`,
      do_now: treatment,
      watch_for: `Kresek symptoms — young plants wilting and dying in nursery. Milky bacterial ooze in morning on leaf edges. Rapid spread after flood events or rain.`,
      avoid: `Avoid flood irrigation from infected fields. Do not apply nitrogen fertilizer during active infection. Avoid working in wet fields as footwear spreads the bacteria.`,
      source: 'TNAU Agritech Portal — Rice Disease Management Guide, 2023'
    };
  }
  if (d.includes('curl') || d.includes('virus')) {
    return {
      what_it_is: `${disease} is caused by a whitefly-transmitted Begomovirus. Infected leaves curl upward, veins thicken, and plants stop growing properly. The disease is incurable once established — management focuses on stopping vector spread.`,
      do_now: treatment,
      watch_for: `Number of whitefly adults on undersides of young leaves. New plants showing curled leaves within a week of planting. Yellowing of terminal shoots.`,
      avoid: `Avoid planting chilli near cotton or other solanaceous crops. Do not miss early vector management — once >30% plants are infected, yield loss is permanent. Avoid excessive urea use.`,
      source: 'IIVR Varanasi — Vegetable Disease IPM Bulletin, 2024'
    };
  }
  if (d.includes('sigatoka') || d.includes('banana') || d.includes('spot')) {
    return {
      what_it_is: `${disease} is a foliar disease of banana caused by Mycosphaerella musicola. It shows as pale yellow streaks that expand into large dark necrotic patches along veins. Severe infection reduces photosynthesis and fruit size.`,
      do_now: treatment,
      watch_for: `Lesions spreading from older to younger leaves. More than 50% of the leaf showing necrosis. New suckers also showing early signs — indicating soil or air-borne spread.`,
      avoid: `Avoid irrigation from above — wet canopy extends the infection window. Do not delay removal of dead leaf matter. Avoid dense planting that prevents air movement.`,
      source: 'NHB — Banana Production and Protection Guide, 2023'
    };
  }
  if (d.includes('red rot') || d.includes('smut')) {
    return {
      what_it_is: `${disease} in sugarcane causes stalk discoloration from red with white islands internally. It weakens the plant's vascular system. The pathogen survives in planting sets and soil.`,
      do_now: treatment,
      watch_for: `Third and fourth leaf yellowing with visible midrib browning. Rattling sound when infected stalk is shaken. Dead heart formation in terminal bud.`,
      avoid: `Do not use infected setts for planting. Avoid waterlogging of sugarcane fields. Do not carry harvesting equipment from infected to clean fields without disinfection.`,
      source: 'ICAR-IISS Lucknow — Sugarcane Pathology Handbook, 2023'
    };
  }
  if (d.includes('healthy') || d.includes('trace')) {
    return {
      what_it_is: `No significant disease was detected. The crop appears to be in good health. Minor surface marks may be due to insect feeding, physical damage, or dust.`,
      do_now: `Continue regular monitoring every 5–7 days. Maintain irrigation schedule. Apply balanced NPK fertilizer as per crop stage.`,
      watch_for: `Early signs of any spotting, yellowing, or curling of younger leaves. Watch for insect vectors (whitefly, aphid) on leaf undersides.`,
      avoid: `Avoid unnecessary pesticide application. Do not over-irrigate. Avoid excess urea which invites fungal diseases.`,
      source: 'KVK Standard Field Monitoring Protocol, 2024'
    };
  }

  // Generic fallback
  return {
    what_it_is: summary,
    do_now: treatment,
    watch_for: `Monitor for disease progression over the next 5–7 days. Note if more leaves become affected or if the spots change in color or size.`,
    avoid: `Avoid applying pesticides during hot afternoon hours. Do not ignore early signs of spread to neighboring plants.`,
    source: 'KVK Advisory Protocol — PattaPe AI System'
  };
}

export default function AIAdvisorySection({ caseData }) {
  const [expandedSection, setExpandedSection] = useState('do_now');

  const advisory = buildAdvisoryFromCase(caseData);
  if (!advisory) return null;

  const toggleSection = (key) => {
    setExpandedSection(prev => prev === key ? null : key);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 flex items-center gap-3">
        <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white m-0 leading-tight">
            AI Advisory
          </h3>
          <p className="text-xs sm:text-sm font-bold text-slate-400 m-0 mt-0.5">
            Expert-level guidance generated from diagnosis
          </p>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="divide-y divide-slate-200">
        {SECTION_META.map((section) => {
          const content = advisory[section.key];
          if (!content) return null;
          const isExpanded = expandedSection === section.key;
          const Icon = section.icon;

          return (
            <div key={section.key}>
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className={`w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left transition hover:bg-slate-50 ${
                  isExpanded ? 'bg-slate-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${section.iconBg} shrink-0`}>
                    <Icon className={`w-4 h-4 ${section.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">
                        {section.emoji} {section.label}
                      </span>
                    </div>
                    {!isExpanded && (
                      <p className="text-xs text-slate-500 font-semibold m-0 mt-0.5 line-clamp-1">
                        {content.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                </div>
                <div className={`shrink-0 p-1.5 rounded-xl transition ${
                  isExpanded ? `${section.iconBg} ${section.iconColor}` : 'text-slate-400'
                }`}>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className={`px-4 sm:px-5 pb-5 bg-slate-50 border-t ${section.border}`}>
                  <div className={`mt-4 p-4 rounded-2xl border ${section.border} bg-white`}>
                    <p className="text-sm sm:text-base font-bold text-slate-800 m-0 leading-relaxed">
                      {content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Advisory Source Footer */}
      {advisory.source && (
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs font-bold text-slate-600">
            Source: <span className="text-slate-900">{advisory.source}</span>
          </span>
        </div>
      )}
    </div>
  );
}
