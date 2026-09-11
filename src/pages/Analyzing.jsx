import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { analyzeCropImage } from '../services/api';
import { MOCK_CROPS, MOCK_PREDICTION_RESPONSE } from '../services/mockData';

export default function Analyzing({ selectedCrop, uploadedImage, onDiagnosisComplete, currentLang }) {
  const navigate = useNavigate();

  // Recover state from localStorage if user navigated directly or refreshed
  const resolvedCrop = selectedCrop || (() => {
    try {
      const saved = localStorage.getItem('pattape_selected_crop');
      return saved ? JSON.parse(saved) : MOCK_CROPS[0];
    } catch {
      return MOCK_CROPS[0];
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

  // Keep ref to hold diagnosis data safely
  const diagnosisRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const timeouts = [];

    // 1. Trigger simulated API call with mock prediction data
    const cropId = resolvedCrop?.id || 'rice';
    analyzeCropImage(cropId, resolvedImage)
      .then((res) => {
        if (isMounted) {
          diagnosisRef.current = res.data;
        }
      })
      .catch((err) => {
        console.error('Analysis error:', err);
        if (isMounted) {
          diagnosisRef.current = MOCK_PREDICTION_RESPONSE;
        }
      });

    // 2. Animate the 5 steps one by one over ~2 seconds
    // Step 0: 0ms -> Checking leaf symptoms (progress 18%)
    // Step 1: 420ms -> Identifying possible disease (progress 38%)
    timeouts.push(
      setTimeout(() => {
        if (isMounted) {
          setActiveStep(1);
          setProgress(38);
        }
      }, 420)
    );

    // Step 2: 840ms -> Measuring affected area (progress 60%)
    timeouts.push(
      setTimeout(() => {
        if (isMounted) {
          setActiveStep(2);
          setProgress(60);
        }
      }, 840)
    );

    // Step 3: 1260ms -> Checking 72-hour spread risk (progress 78%)
    timeouts.push(
      setTimeout(() => {
        if (isMounted) {
          setActiveStep(3);
          setProgress(78);
        }
      }, 1260)
    );

    // Step 4: 1680ms -> Preparing advice (progress 92%)
    timeouts.push(
      setTimeout(() => {
        if (isMounted) {
          setActiveStep(4);
          setProgress(92);
        }
      }, 1680)
    );

    // Step 5: 2100ms -> All 5 steps complete (progress 100%)
    timeouts.push(
      setTimeout(() => {
        if (isMounted) {
          setActiveStep(5);
          setProgress(100);
          setIsFinished(true);

          // Deliver the diagnosis result
          const finalData = diagnosisRef.current || MOCK_PREDICTION_RESPONSE;
          onDiagnosisComplete?.(finalData);
        }
      }, 2100)
    );

    // 3. Automatically navigate to /result at ~2450ms (~2s total loading experience)
    timeouts.push(
      setTimeout(() => {
        if (isMounted) {
          navigate('/result');
        }
      }, 2450)
    );

    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [resolvedCrop?.id, resolvedImage, navigate, onDiagnosisComplete]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 pb-28">
      <LoadingScreen 
        leafImage={resolvedImage} 
        selectedCrop={resolvedCrop}
        currentLang={currentLang}
        activeStep={activeStep}
        progress={progress}
        isFinished={isFinished}
      />
    </div>
  );
}
