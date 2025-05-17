import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Hero from './components/Hero';
import Agenda from './components/Agenda';
import Login from './components/Login';
import Footer from './components/Footer';
import Agendamentos from './components/Agendamentos'
import BackgroundGrid from './components/BackgroundGrid';
import GrainOverlay from './components/GrainOverlay';

function AppContent() {
  const location = useLocation();

  return (
    <div className="app-wrapper">
      <BackgroundGrid />
      <GrainOverlay />

      <main>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/login" element={<Login />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
        </Routes>
      </main>

      {location.pathname !== '/agenda' && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
