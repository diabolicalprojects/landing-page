import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Views
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

function App() {
    return (
        <Router>
            <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
