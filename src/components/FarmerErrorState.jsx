import React from 'react';
import { 
  AlertTriangle, 
  WifiOff, 
  Clock, 
  CameraOff, 
  RotateCcw, 
  ArrowLeft, 
  Image as ImageIcon,
  Leaf
} from 'lucide-react';

const ERROR_CONTENT = {
  no_crop: {
    icon: Leaf,
    color: 'emerald',
    title: {
      en: 'No Crop Chosen',
      hi: 'कोई फसल नहीं चुनी गई',
      ta: 'பயிர் தேர்ந்தெடுக்கப்படவில்லை',
      kn: 'ಯಾವುದೇ ಬೆಳೆ ಆಯ್ಕೆಯಾಗಿಲ್ಲ'
    },
    message: {
      en: 'Please select what crop you are growing so our plant doctor looks for the right diseases.',
      hi: 'कृपया पहले अपनी फसल चुनें ताकि हमारा सिस्टम सही बीमारी की पहचान कर सके।',
      ta: 'சரியான நோயைக் கண்டறிய உங்கள் பயிரைத் தேர்ந்தெடுக்கவும்.',
      kn: 'ಸರಿಯಾದ ರೋಗವನ್ನು ಪತ್ತೆಹಚ್ಚಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
    }
  },
  no_image: {
    icon: CameraOff,
    color: 'amber',
    title: {
      en: 'No Leaf Photo Selected',
      hi: 'पत्ती की फोटो नहीं चुनी गई',
      ta: 'இலை படம் தேர்ந்தெடுக்கப்படவில்லை',
      kn: 'ಎಲೆಯ ಫೋಟೋ ಆಯ್ಕೆಯಾಗಿಲ್ಲ'
    },
    message: {
      en: 'Please take or choose a clear photo of the sick leaf before starting the analysis.',
      hi: 'कृपया जांच शुरू करने से पहले रोगग्रस्त पत्ती की साफ फोटो खींचें या चुनें।',
      ta: 'பரிசோதிக்க பாதிக்கப்பட்ட இலையின் தெளிவான படத்தை எடுக்கவும்.',
      kn: 'ಪರಿಶೀಲಿಸಲು ದಯವಿಟ್ಟು ಹಾನಿಗೊಳಗಾದ ಎಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.'
    }
  },
  upload_failed: {
    icon: ImageIcon,
    color: 'rose',
    title: {
      en: 'Photo Could Not Be Loaded',
      hi: 'फोटो लोड नहीं हो सकी',
      ta: 'படம் ஏற்ற முடியவில்லை',
      kn: 'ಫೋಟೋ ಲೋಡ್ ಆಗುತ್ತಿಲ್ಲ'
    },
    message: {
      en: 'This photo file could not be opened or may be damaged. Please pick another photo or take a new one with your camera.',
      hi: 'फोटो फाइल खुल नहीं पा रही है। कृपया दूसरी फोटो चुनें या कैमरे से नई फोटो खींचें।',
      ta: 'படக் கோப்பைத் திறக்க முடியவில்லை. தயவுசெய்து வேறு படத்தை எடுக்கவும் அல்லது கேமராவைப் பயன்படுத்தவும்.',
      kn: 'ಫೋಟೋ ಫೈಲ್ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಂದು ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಕ್ಯಾಮೆರಾ ಬಳಸಿ.'
    }
  },
  api_failed: {
    icon: AlertTriangle,
    color: 'red',
    title: {
      en: 'Plant Doctor Service Unavailable',
      hi: 'प्लांट डॉक्टर सेवा उपलब्ध नहीं है',
      ta: 'சேவை தற்காலிகமாக கிடைக்கவில்லை',
      kn: 'ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ'
    },
    message: {
      en: 'We could not reach the plant health service. Your photo is safe on your phone. Please check your internet connection and try again.',
      hi: 'सर्वर से संपर्क नहीं हो पाया। आपकी पत्ती की फोटो सुरक्षित है। कृपया इंटरनेट जांचें और फिर प्रयास करें।',
      ta: 'தகவல் தொடர்பு தோல்வியடைந்தது. உங்கள் படம் பாதுகாப்பாக உள்ளது. இணையத்தை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
      kn: 'ಸರ್ವರ್ ಸಂಪರ್ಕ ಸಾಧಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ನಿಮ್ಮ ಫೋಟೋ ಸುರಕ್ಷಿತವಾಗಿದೆ. ದಯವಿಟ್ಟು ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
    }
  },
  timeout: {
    icon: Clock,
    color: 'amber',
    title: {
      en: 'Connection Timed Out',
      hi: 'कनेक्शन में समय समाप्त हुआ',
      ta: 'நேரம் கடந்துவிட்டது',
      kn: 'ಸಂಪರ್ಕ ಸಮಯ ಮೀರಿದೆ'
    },
    message: {
      en: 'Connecting took longer than expected. This often happens with weak mobile internet in rural fields. Please try again.',
      hi: 'सर्वर से संपर्क में बहुत समय लगा। खेत में धीमे मोबाइल इंटरनेट के कारण ऐसा हो सकता है। कृपया पुनः प्रयास करें।',
      ta: 'இணைய வேகம் குறைவாக இருப்பதால் தொடர்பு தடைபட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      kn: 'ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಧಾನಗತಿಯ ಇಂಟರ್ನೆಟ್ ಕಾರಣ ಸಂಪರ್ಕ ತಡವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
    }
  },
  heatmap_unavailable: {
    icon: ImageIcon,
    color: 'blue',
    title: {
      en: 'AI Heatmap Unavailable',
      hi: 'एआई हीटमैप उपलब्ध नहीं है',
      ta: 'ஹீட்மேப் படம் கிடைக்கவில்லை',
      kn: 'ಹೀಟ್‌ಮ್ಯಾಪ್ ಲಭ್ಯವಿಲ್ಲ'
    },
    message: {
      en: "The visual highlight map could not be loaded for this leaf photo. Don't worry, your full disease diagnosis and remedy instructions below are ready.",
      hi: 'इस फोटो का विजुअल हीटमैप लोड नहीं हो सका। चिंता न करें, आपकी पूरी बीमारी रिपोर्ट और उपचार सलाह नीचे तैयार है।',
      ta: 'ஹீட்மேப் படம் கிடைக்கவில்லை. உங்கள் முழு நோய் அறிக்கை மற்றும் சிகிச்சை ஆலோசனை கீழே தயாராக உள்ளது.',
      kn: 'ಹೀಟ್‌ಮ್ಯಾಪ್ ಚಿತ್ರ ಲಭ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ಸಂಪೂರ್ಣ ರೋಗ ವರದಿ ಮತ್ತು ಚಿಕಿತ್ಸಾ ಸಲಹೆ ಕೆಳಗೆ ಸಿದ್ಧವಾಗಿದೆ.'
    }
  }
};

const ACTION_LABELS = {
  retry: {
    en: 'Try Again',
    hi: 'पुनः प्रयास करें',
    ta: 'மீண்டும் முயற்சிக்கவும்',
    kn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ'
  },
  choose_photo: {
    en: 'Choose Another Photo',
    hi: 'दूसरी फोटो चुनें',
    ta: 'வேறு படத்தை தேர்வு செய்',
    kn: 'ಮತ್ತೊಂದು ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ'
  },
  take_photo: {
    en: 'Take Leaf Photo',
    hi: 'पत्ती की फोटो खींचें',
    ta: 'இலை படம் எடுக்கவும்',
    kn: 'ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ'
  },
  go_back: {
    en: 'Go Back',
    hi: 'वापस जाएं',
    ta: 'பின்செல்',
    kn: 'ಹಿಂದಕ್ಕೆ ಹೋಗಿ'
  },
  choose_crop: {
    en: 'Choose Crop',
    hi: 'फसल चुनें',
    ta: 'பயிரைத் தேர்வு செய்',
    kn: 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ'
  }
};

export default function FarmerErrorState({
  type = 'api_failed', // 'no_crop' | 'no_image' | 'upload_failed' | 'api_failed' | 'timeout' | 'heatmap_unavailable'
  currentLang = 'en',
  onRetry,
  onChooseAnotherPhoto,
  onGoBack,
  onChooseCrop,
  customTitle,
  customMessage,
  compact = false
}) {
  const config = ERROR_CONTENT[type] || ERROR_CONTENT.api_failed;
  const Icon = config.icon;

  const title = customTitle || config.title[currentLang] || config.title.en;
  const message = customMessage || config.message[currentLang] || config.message.en;

  const colorStyles = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-700',
      btn: 'bg-red-700 hover:bg-red-800 text-white'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-800',
      btn: 'bg-amber-700 hover:bg-amber-800 text-white'
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-700',
      btn: 'bg-rose-700 hover:bg-rose-800 text-white'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-800',
      btn: 'bg-emerald-700 hover:bg-emerald-800 text-white'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-800',
      btn: 'bg-blue-700 hover:bg-blue-800 text-white'
    }
  }[config.color] || {
    bg: 'bg-red-50',
    border: 'border-red-300',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    btn: 'bg-red-700 hover:bg-red-800 text-white'
  };

  // Compact banner view (e.g. within an existing form/card)
  if (compact) {
    return (
      <div className={`p-4 rounded-2xl border-2 ${colorStyles.border} ${colorStyles.bg} space-y-2.5 animate-in fade-in`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${colorStyles.iconBg} shrink-0 mt-0.5`}>
            <Icon className={`w-5 h-5 ${colorStyles.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-slate-900 m-0 leading-tight">
              {title}
            </h3>
            <p className="text-xs font-bold text-slate-700 m-0 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition ${colorStyles.btn}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{ACTION_LABELS.retry[currentLang] || ACTION_LABELS.retry.en}</span>
            </button>
          )}

          {onChooseAnotherPhoto && (
            <button
              type="button"
              onClick={onChooseAnotherPhoto}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{ACTION_LABELS.choose_photo[currentLang] || ACTION_LABELS.choose_photo.en}</span>
            </button>
          )}

          {onChooseCrop && (
            <button
              type="button"
              onClick={onChooseCrop}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>{ACTION_LABELS.choose_crop[currentLang] || ACTION_LABELS.choose_crop.en}</span>
            </button>
          )}

          {onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              className="px-3 py-1.5 text-slate-700 hover:text-slate-950 font-bold text-xs flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{ACTION_LABELS.go_back[currentLang] || ACTION_LABELS.go_back.en}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full-card / Full-screen friendly error view
  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto px-4 py-8 text-center space-y-5 animate-in fade-in zoom-in-95">
      
      {/* Icon Badge */}
      <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center border-4 shadow-lg bg-white border-slate-200">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorStyles.iconBg}`}>
          <Icon className={`w-8 h-8 ${colorStyles.iconColor}`} />
        </div>
      </div>

      {/* Heading & Friendly Plain Language Explanation */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-950 m-0 tracking-tight leading-snug">
          {title}
        </h2>
        <p className="text-sm sm:text-base font-bold text-slate-700 max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {/* High-Contrast Clear Recovery Action Buttons */}
      <div className="space-y-2.5 max-w-xs mx-auto pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`w-full min-h-[48px] px-5 py-3 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${colorStyles.btn}`}
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>{ACTION_LABELS.retry[currentLang] || ACTION_LABELS.retry.en}</span>
          </button>
        )}

        {onChooseAnotherPhoto && (
          <button
            type="button"
            onClick={onChooseAnotherPhoto}
            className="w-full min-h-[48px] px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <ImageIcon className="w-5 h-5 text-slate-600 stroke-[2.5]" />
            <span>{ACTION_LABELS.choose_photo[currentLang] || ACTION_LABELS.choose_photo.en}</span>
          </button>
        )}

        {onChooseCrop && (
          <button
            type="button"
            onClick={onChooseCrop}
            className="w-full min-h-[48px] px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <Leaf className="w-5 h-5 stroke-[2.5]" />
            <span>{ACTION_LABELS.choose_crop[currentLang] || ACTION_LABELS.choose_crop.en}</span>
          </button>
        )}

        {onGoBack && (
          <button
            type="button"
            onClick={onGoBack}
            className="w-full py-2 text-slate-600 hover:text-slate-900 font-bold text-sm flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>{ACTION_LABELS.go_back[currentLang] || ACTION_LABELS.go_back.en}</span>
          </button>
        )}
      </div>

    </div>
  );
}
