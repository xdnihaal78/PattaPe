import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import FarmerErrorState from '../components/FarmerErrorState';
import { analyzeCropImage } from '../services/api';
import { MOCK_PREDICTION_RESPONSE } from '../services/mockData';

export default function Analyzing({ selectedCrop, uploadedImage, onDiagnosisComplete, currentLang = 'en' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Recover state from localStorage if user navigated directly or refreshed
  const resolvedCrop = selectedCrop || (() => {
    try {
      const saved = localStorage.getItem('pattape_selected_crop');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const resolvedImage = uploadedImage || (() => {
    try {
      return localStorage.getItem('pattape_temp_image') || null;
    } catch {
      return null;
    }
  })();

  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(18);
  const [isFinished, setIsFinished] = useState(false);
  const [errorType, setErrorType] = useState(null); // 'api_failed' | 'timeout' | null
  const [simulatedMode, setSimulatedMode] = useState(searchParams.get('simulate_error') || null);

  const diagnosisRef = useRef(null);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const runAnalysis = useCallback(() => {
    if (!resolvedCrop || !resolvedImage) return;

    clearAllTimeouts();
    setErrorType(null);
    setActiveStep(0);
    setProgress(18);
    setIsFinished(false);
    diagnosisRef.current = null;

    const cropId = resolvedCrop?.id || 'rice';

    // 1. Invoke Prediction API (supporting timeout & simulated error modes)
    const apiPromise = analyzeCropImage(cropId, resolvedImage, {
      simulate: simulatedMode || undefined,
      timeoutMs: 8000
    });

    apiPromise
      .then((res) => {
        diagnosisRef.current = res.data;
      })
      .catch((err) => {
        console.warn('Plant analysis caught error:', err);
        clearAllTimeouts();
        if (err.isTimeout || err.code === 'TIMEOUT') {
          setErrorType('timeout');
        } else {
          setErrorType('api_failed');
        }
      });

    // 2. Animate 5 steps progressively
    const t1 = setTimeout(() => {
      setActiveStep(1);
      setProgress(38);
    }, 420);

    const t2 = setTimeout(() => {
      setActiveStep(2);
      setProgress(60);
    }, 840);

    const t3 = setTimeout(() => {
      setActiveStep(3);
      setProgress(78);
    }, 1260);

    const t4 = setTimeout(() => {
      setActiveStep(4);
      setProgress(92);
    }, 1680);

    const t5 = setTimeout(() => {
      setActiveStep(5);
      setProgress(100);
      setIsFinished(true);

      const finalData = diagnosisRef.current || MOCK_PREDICTION_RESPONSE;
      onDiagnosisComplete?.(finalData);
    }, 2100);

    const t6 = setTimeout(() => {
      navigate('/result');
    }, 2450);

    timeoutsRef.current = [t1, t2, t3, t4, t5, t6];
  }, [resolvedCrop, resolvedImage, simulatedMode, navigate, onDiagnosisComplete]);

  useEffect(() => {
    runAnalysis();
    return () => {
      clearAllTimeouts();
    };
  }, [runAnalysis]);

  // 1. Error state: No Crop Selected
  if (!resolvedCrop) {
    return (
      <FarmerErrorState
        type="no_crop"
        currentLang={currentLang}
        onChooseCrop={() => navigate('/')}
        onGoBack={() => navigate('/')}
      />
    );
  }

  // 2. Error state: No Image Selected
  if (!resolvedImage) {
    return (
      <FarmerErrorState
        type="no_image"
        currentLang={currentLang}
        onChooseAnotherPhoto={() => navigate('/upload')}
        onGoBack={() => navigate('/upload')}
      />
    );
  }

  // 4 & 5. Error state: Prediction API Failure OR Backend Timeout
  if (errorType) {
    return (
      <div className="space-y-4">
        <FarmerErrorState
          type={errorType}
          currentLang={currentLang}
          onRetry={() => {
            setSimulatedMode(null);
            runAnalysis();
          }}
          onChooseAnotherPhoto={() => navigate('/upload')}
          onGoBack={() => navigate('/upload')}
        />

        {/* Demo-Friendly Mode Switcher */}
        <div className="max-w-xs mx-auto text-center pt-2">
          <p className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
            Demo Error Switcher
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSimulatedMode(null);
                runAnalysis();
              }}
              className="px-2.5 py-1 text-xs font-bold bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
            >
              Normal Analysis
            </button>
            <button
              type="button"
              onClick={() => {
                setSimulatedMode('api_failed');
                runAnalysis();
              }}
              className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
            >
              API Error
            </button>
            <button
              type="button"
              onClick={() => {
                setSimulatedMode('timeout');
                runAnalysis();
              }}
              className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition"
            >
              Timeout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal Loading Progress Screen
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 pb-28 space-y-4">
      <LoadingScreen 
        leafImage={resolvedImage} 
        selectedCrop={resolvedCrop}
        currentLang={currentLang}
        activeStep={activeStep}
        progress={progress}
        isFinished={isFinished}
      />

      {/* Discreet Demo Error Testing Bar */}
      <div className="flex justify-center items-center gap-2 pt-4 opacity-50 hover:opacity-100 transition">
        <span className="text-[10px] font-bold text-slate-400">Demo test:</span>
        <button
          type="button"
          onClick={() => {
            clearAllTimeouts();
            setErrorType('api_failed');
          }}
          className="text-[10px] font-bold text-red-600 hover:underline"
        >
          [Simulate API Error]
        </button>
        <span className="text-slate-300">•</span>
        <button
          type="button"
          onClick={() => {
            clearAllTimeouts();
            setErrorType('timeout');
          }}
          className="text-[10px] font-bold text-amber-600 hover:underline"
        >
          [Simulate Timeout]
        </button>
      </div>
    </div>
  );
}
