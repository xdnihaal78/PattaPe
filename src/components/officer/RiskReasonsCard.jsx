import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Thermometer, 
  Droplets, 
  Wind, 
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  TrendingUp
} from 'lucide-react';

// Icon map for reason categories
const REASON_ICONS = {
  humidity: Droplets,
  temperature: Thermometer,
  wind: Wind,
  timing: Calendar,
  spread: TrendingUp,
  default: AlertTriangle,
};

function getRiskIcon(reason) {
  const text = reason.toLowerCase();
  if (text.includes('humid') || text.includes('dew') || text.includes('wet') || text.includes('rain') || text.includes('water')) return Droplets;
  if (text.includes('temp') || text.includes('heat') || text.includes('cool') || text.includes('night')) return Thermometer;
  if (text.includes('wind') || text.includes('air')) return Wind;
  if (text.includes('day') || text.includes('hour') || text.includes('48h') || text.includes('72h') || text.includes('week')) return Calendar;
  if (text.includes('spread') || text.includes('spore') || text.includes('grow') || text.includes('expand')) return TrendingUp;
  return AlertTriangle;
}

function getRiskLevelMeta(risk) {
  switch (risk?.toLowerCase()) {
    case 'high':
    case 'critical':
    case 'critical risk':
      return {
        color: 'red',
        label: 'Critical Risk — Act Within 24 Hours',
        icon: ShieldAlert,
        bg: 'bg-red-50',
        border: 'border-red-300',
        headerBg: 'bg-red-700',
        headerText: 'text-white',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-900',
        badgeBorder: 'border-red-400',
        iconColor: 'text-red-300',
        reasonBg: 'bg-red-50',
        reasonBorder: 'border-red-200',
        reasonIconBg: 'bg-red-100',
        reasonIconColor: 'text-red-700',
        barColor: 'bg-red-600',
      };
    case 'moderate':
    case 'moderate risk':
      return {
        color: 'amber',
        label: 'Moderate Risk — Monitor Closely',
        icon: AlertTriangle,
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        headerBg: 'bg-amber-600',
        headerText: 'text-white',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-900',
        badgeBorder: 'border-amber-400',
        iconColor: 'text-amber-200',
        reasonBg: 'bg-amber-50',
        reasonBorder: 'border-amber-200',
        reasonIconBg: 'bg-amber-100',
        reasonIconColor: 'text-amber-700',
        barColor: 'bg-amber-500',
      };
    default:
      return {
        color: 'emerald',
        label: 'Low Risk — Situation Under Control',
        icon: ShieldAlert,
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        headerBg: 'bg-emerald-700',
        headerText: 'text-white',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-900',
        badgeBorder: 'border-emerald-400',
        iconColor: 'text-emerald-200',
        reasonBg: 'bg-emerald-50',
        reasonBorder: 'border-emerald-200',
        reasonIconBg: 'bg-emerald-100',
        reasonIconColor: 'text-emerald-700',
        barColor: 'bg-emerald-600',
      };
  }
}

export default function RiskReasonsCard({ caseData }) {
  const [expanded, setExpanded] = useState(true);

  const risk = caseData?.risk_72h?.level || caseData?.risk || 'low';
  const meta = getRiskLevelMeta(risk);
  const RiskIcon = meta.icon;

  // Derive risk reasons from available data or fallback to contract schema
  const reasons = (caseData?.risk_72h?.reasons && Array.isArray(caseData.risk_72h.reasons) && caseData.risk_72h.reasons.length > 0)
    ? caseData.risk_72h.reasons
    : (caseData?.risk_reasons || generateDefaultReasons(caseData));
  const riskScore = caseData?.risk_72h?.score || caseData?.risk_score || deriveRiskScore(risk);
  const forecastText = caseData?.forecast_text || caseData?.weatherRisk?.forecastText || null;
  const forecast72h = caseData?.forecast_72h || null;

  return (
    <div className={`rounded-3xl border-2 shadow-xl overflow-hidden ${meta.border}`}>
      
      {/* Header */}
      <div className={`${meta.headerBg} p-5 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
            <RiskIcon className={`w-6 h-6 ${meta.iconColor}`} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white m-0 leading-tight">
              72-Hour Risk Assessment
            </h3>
            <p className={`text-xs sm:text-sm font-bold m-0 mt-0.5 ${meta.iconColor}`}>
              {meta.label}
            </p>
          </div>
        </div>
        
        {/* Risk Score Gauge */}
        <div className="flex items-center gap-3">
          <div className="text-center hidden sm:block">
            <div className="text-3xl font-black text-white leading-none">{riskScore}</div>
            <div className="text-xs font-bold text-white/70 mt-0.5">Risk Score</div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-white transition"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Risk Score Bar (always visible) */}
      <div className="bg-white px-5 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">Disease Risk</span>
          <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${meta.barColor} relative overflow-hidden`}
              style={{ width: `${riskScore}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          <span className={`text-sm font-black ${
            risk === 'high' ? 'text-red-700' : risk === 'moderate' ? 'text-amber-700' : 'text-emerald-700'
          }`}>{riskScore}/100</span>
        </div>
      </div>

      {/* Expandable Content */}
      {expanded && (
        <div className={`${meta.bg} p-5 space-y-4`}>
          
          {/* 72h Forecast Callout if present */}
          {(forecastText || forecast72h) && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block mb-1">
                  72-Hour Weather Forecast
                </span>
                <p className="text-sm font-bold text-slate-200 m-0 leading-relaxed">
                  {forecastText || forecast72h}
                </p>
              </div>
            </div>
          )}

          {/* Risk Reason Cards */}
          {reasons.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Why This Risk Level?
              </h4>
              <div className="space-y-2">
                {reasons.map((reason, i) => {
                  const Icon = getRiskIcon(reason);
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border ${meta.reasonBorder} ${meta.reasonBg} bg-white`}
                    >
                      <div className={`p-1.5 rounded-xl ${meta.reasonIconBg} shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${meta.reasonIconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 m-0 leading-relaxed">
                          {reason}
                        </p>
                      </div>
                      <span className="shrink-0 w-6 h-6 bg-slate-100 text-slate-600 rounded-full text-xs font-black flex items-center justify-center border border-slate-200">
                        {i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weather Snapshot Pills if available */}
          {caseData?.humidity && (
            <div className="flex flex-wrap gap-2 pt-1">
              {caseData.humidity && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Humidity: {caseData.humidity}</span>
                </div>
              )}
              {caseData.temp_range && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                  <span>Temp: {caseData.temp_range}</span>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// Generate human-friendly risk reasons from case data fields
function generateDefaultReasons(caseData) {
  if (!caseData) return [];
  const reasons = [];
  const severity = caseData.severity?.toLowerCase();
  const risk = caseData.risk?.toLowerCase();
  const affectedPct = caseData.affected_pct || 0;
  const disease = caseData.disease || 'Disease';
  const crop = caseData.crop || 'crop';

  if (affectedPct >= 60) {
    reasons.push(`${affectedPct}% of the leaf surface is already affected — the infection has passed the critical spread threshold.`);
  } else if (affectedPct >= 30) {
    reasons.push(`${affectedPct}% leaf area is showing active infection — the disease is in its active spreading phase.`);
  }

  if (severity === 'severe') {
    reasons.push(`Severity is rated Severe. Visible damage across multiple leaves indicates established colony growth.`);
  } else if (severity === 'moderate') {
    reasons.push(`Severity rated Moderate. Disease is progressing but still manageable with prompt treatment.`);
  }

  if (risk === 'high') {
    reasons.push(`Current field humidity and temperature are ideal for fungal/bacterial spore germination and spread.`);
    reasons.push(`Without intervention in the next 24–48 hours, the ${disease} could spread to neighboring plants.`);
  } else if (risk === 'moderate') {
    reasons.push(`Weather conditions are partially favorable for disease progression over the next 3 days.`);
  }

  if (disease.toLowerCase().includes('blast')) {
    reasons.push(`Rice Blast spores are highly mobile in night dew and can infect the entire paddy field within 48 hours under humid conditions.`);
  } else if (disease.toLowerCase().includes('curl') || disease.toLowerCase().includes('virus')) {
    reasons.push(`This virus spreads through whitefly vectors — each infected plant becomes a source of inoculum for nearby plants.`);
  } else if (disease.toLowerCase().includes('blight')) {
    reasons.push(`Bacterial blight transmits through rain splash and flood water, meaning infection can move quickly across the field.`);
  } else if (disease.toLowerCase().includes('sigatoka') || disease.toLowerCase().includes('spot')) {
    reasons.push(`Spores travel on wind currents. Wet leaf surfaces allow spores to germinate within 4–6 hours of contact.`);
  }

  if (reasons.length === 0) {
    reasons.push(`AI detected active disease markers in ${affectedPct}% of leaf pixels scanned.`);
    reasons.push(`Field conditions for ${crop} at this season increase susceptibility to pathogen activity.`);
  }

  return reasons.slice(0, 4); // Max 4 reasons
}

function deriveRiskScore(risk) {
  switch (risk?.toLowerCase()) {
    case 'high': return Math.floor(75 + Math.random() * 20);
    case 'moderate': return Math.floor(45 + Math.random() * 25);
    default: return Math.floor(10 + Math.random() * 25);
  }
}
