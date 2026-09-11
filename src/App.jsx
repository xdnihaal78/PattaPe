import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Analyzing from './pages/Analyzing';
import Result from './pages/Result';

// Officer Dashboard Pages and Header
import OfficerHeader from './components/officer/OfficerHeader';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerCaseDetail from './pages/OfficerCaseDetail';
import { getStoredLanguage, setStoredLanguage } from './utils/helpers';

function AppContent() {
  const location = useLocation();
  const isOfficerRoute = location.pathname.startsWith('/officer');

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
  const [currentLang, setCurrentLangState] = useState(() => getStoredLanguage());

  const handleLanguageChange = (langCode) => {
    setCurrentLangState(langCode);
    setStoredLanguage(langCode);
  };

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
    <div className={`min-h-screen flex flex-col font-sans selection:bg-emerald-300 ${
      isOfficerRoute ? 'bg-slate-100 text-slate-900' : 'bg-slate-100'
    }`}>
      
      {/* Conditionally render Officer Header or Farmer Header */}
      {isOfficerRoute ? (
        <OfficerHeader />
      ) : (
        <Header
          selectedCrop={selectedCrop}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Routes>
          {/* Farmer Routes */}
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

          {/* Extension Officer Dashboard Routes */}
          <Route
            path="/officer"
            element={<OfficerDashboard />}
          />
          <Route
            path="/officer/case/:id"
            element={<OfficerCaseDetail />}
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation (only on Farmer routes) */}
      {!isOfficerRoute && (
        <BottomNavigation
          currentLang={currentLang}
          hasResult={!!diagnosis}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

