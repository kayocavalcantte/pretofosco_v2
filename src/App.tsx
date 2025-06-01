import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import BackgroundGrid from './components/BackgroundGrid';
import GrainOverlay from './components/GrainOverlay';
import Footer from './components/Footer';
import HeaderUsuario from './components/Header';
import HeaderAdmin from './components/HeaderAdmin';

import Hero from './components/Hero';
import AgendaPage from './components/Agenda';
import LoginPage from './components/Login';
import AgendamentosPage from './components/Agendamentos';
import PerfilPage from './components/Perfil';
import EsqueciSenhaPage from './components/EsqueciSenha';
import CadastroPage from './components/Cadastro';
import MeusAgendamentosPage from './components/MeusAgendamentos';
import CadastroFuncionarioPage from './components/CadastroFuncionario';

function AppContent() {
  const location = useLocation();
  const { role, isLoggedIn } = useAuth();

  let CurrentHeader = null;
  if (isLoggedIn) {
    if (role === 'ADMIN' || role === 'FUNCIONARIO') {
      CurrentHeader = <HeaderAdmin />;
    } else if (role === 'CLIENTE') {
      CurrentHeader = <HeaderUsuario />;
    }
  }

  const noHeaderRoutes = ['/login', '/cadastro', '/esqueci-senha', '/'];
  const showHeader = isLoggedIn && !noHeaderRoutes.includes(location.pathname);

  const noFooterRoutes = ['/agenda', '/login', '/cadastro', '/esqueci-senha', '/cadastro-funcionario'];
  const showFooter = !noFooterRoutes.includes(location.pathname);

  return (
    <div className="app-wrapper">
      <BackgroundGrid />
      <GrainOverlay />

      {showHeader && CurrentHeader}

      <main>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />

          <Route
            path="/agendamentos"
            element={isLoggedIn ? <AgendamentosPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/meus-agendamentos"
            element={isLoggedIn ? <MeusAgendamentosPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/perfil"
            element={isLoggedIn ? <PerfilPage /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/agenda"
            element={
              isLoggedIn && (role === 'ADMIN' || role === 'FUNCIONARIO') ? (
                <AgendaPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/cadastro-funcionario"
            element={
              isLoggedIn && (role === 'ADMIN' || role === 'FUNCIONARIO') ? (
                <CadastroFuncionarioPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to={
                  isLoggedIn
                    ? role === 'ADMIN' || role === 'FUNCIONARIO'
                      ? "/agenda"
                      : "/agendamentos" // Assume CLIENTE ou outros vão para /agendamentos
                    : "/login"
                }
                replace
              />
            }
          />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;