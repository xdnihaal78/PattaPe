import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Analyzing from './pages/Analyzing';
import Result from './pages/Result';

export default function App() {
  const [selectedCrop, setSelectedCropState] = useState(() => {
    try {
      const saved = localStorage.getItem('pattape_selected_crop');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [currentLang, setCurrentLang] = useState('en');

  const handleSelectCrop = (crop) => {
    setSelectedCropState(crop);
    if (crop) {
      try {
        localStorage.setItem('pattape_selected_crop', JSON.stringify(crop));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-300">
        
        {/* Header with Brand Logo & Language Switcher */}
        <Header
          selectedCrop={selectedCrop}
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  selectedCrop={selectedCrop}
                  onSelectCrop={handleSelectCrop}
                  currentLang={currentLang}
                />
              }
            />
            <Route
              path="/upload"
              element={
                <Upload
                  selectedCrop={selectedCrop}
                  uploadedImage={uploadedImage}
                  onImageSelected={setUploadedImage}
                  currentLang={currentLang}
                />
              }
            />
            <Route
              path="/analyzing"
              element={
                <Analyzing
                  selectedCrop={selectedCrop}
                  uploadedImage={uploadedImage}
                  onDiagnosisComplete={setDiagnosis}
                  currentLang={currentLang}
                />
              }
            />
            <Route
              path="/result"
              element={
                <Result
                  diagnosis={diagnosis}
                  selectedCrop={selectedCrop}
                  uploadedImage={uploadedImage}
                  currentLang={currentLang}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation
          currentLang={currentLang}
          hasResult={!!diagnosis}
        />

      </div>
    </BrowserRouter>
  );
}
