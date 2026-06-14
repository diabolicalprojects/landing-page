import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Views
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
            </Routes>
        </Router>
    );
}

export default App;
