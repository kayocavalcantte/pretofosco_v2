import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Hero from './components/Hero';
import Agenda from './components/Agenda';
import Login from './components/Login';
import Footer from './components/Footer';
import Agendamentos from './components/Agendamentos'
import BackgroundGrid from './components/BackgroundGrid';
import GrainOverlay from './components/GrainOverlay';
import Header from './components/Header';
import Perfil from './components/Perfil'; // no topo
import EsqueciSenha from './components/EsqueciSenha';
import Cadastro from './components/Cadastro';
import MeusAgendamentos from './components/MeusAgendamentos';





function AppContent() {
  const location = useLocation();

  return (
    <div className="app-wrapper">
      <BackgroundGrid />
      <GrainOverlay />

      {['/agendamentos', '/perfil','/meus-agendamentos'].includes(location.pathname) && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/login" element={<Login />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
        </Routes>
      </main>

      {!['/agenda', '/login'].includes(location.pathname) && <Footer />}


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
