import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { analyzeCropImage } from '../services/api';

export default function Analyzing({ selectedCrop, uploadedImage, onDiagnosisComplete, currentLang }) {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    async function runAnalysis() {
      const cropId = selectedCrop?.id || 'tomato';
      const result = await analyzeCropImage(cropId, uploadedImage);
      
      if (isMounted) {
        onDiagnosisComplete(result.data);
        // Small delay for smooth UI transition
        setTimeout(() => {
          navigate('/result');
        }, 500);
      }
    }

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 pb-28">
      <LoadingScreen leafImage={uploadedImage} currentLang={currentLang} />
    </div>
  );
}
