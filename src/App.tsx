import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// 1. Importe o AuthProvider e useAuth
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Ajuste o caminho se sua pasta contexts estiver em outro lugar

// Componentes de UI reutilizáveis
import BackgroundGrid from './components/BackgroundGrid';
import GrainOverlay from './components/GrainOverlay';
import Footer from './components/Footer';
import HeaderUsuario from './components/Header'; // Renomeado para clareza, ou use o nome original
import HeaderAdmin from './components/HeaderAdmin';

// Componentes que representam suas páginas/rotas
// É uma boa prática movê-los para uma pasta como src/pages/
import Hero from './components/Hero'; // Ou src/pages/HeroPage.tsx
import AgendaPage from './components/Agenda'; // Ou src/pages/AdminAgendaPage.tsx
import LoginPage from './components/Login';    // Ou src/pages/LoginPage.tsx
import AgendamentosPage from './components/Agendamentos'; // Ou src/pages/AgendamentosPage.tsx
import PerfilPage from './components/Perfil'; // Ou src/pages/PerfilPage.tsx
import EsqueciSenhaPage from './components/EsqueciSenha'; // Ou src/pages/EsqueciSenhaPage.tsx
import CadastroPage from './components/Cadastro'; // Ou src/pages/CadastroPage.tsx
import MeusAgendamentosPage from './components/MeusAgendamentos'; // Ou src/pages/MeusAgendamentosPage.tsx
import CadastroFuncionarioPage from './components/CadastroFuncionario'; // Ou src/pages/CadastroFuncionarioPage.tsx

// Componente de Layout Interno para usar o contexto de autenticação
function AppContent() {
  const location = useLocation();
  const { role, isLoggedIn } = useAuth(); // Agora podemos usar useAuth aqui

  let CurrentHeader = null;
  if (isLoggedIn) {
    if (role === 'admin') {
      CurrentHeader = <HeaderAdmin />;
    } else if (role === 'user' || role === 'cliente') {
      CurrentHeader = <HeaderUsuario />;
    }
  }
  // Você pode adicionar um <HeaderPublico /> aqui se quiser um header para usuários deslogados
  // em certas rotas, ou não renderizar nenhum como está agora para rotas como /login.

  // Lógica para não mostrar header em certas rotas (ex: login, cadastro)
  const noHeaderRoutes = ['/login', '/cadastro', '/esqueci-senha','/'];
  const showHeader = isLoggedIn && !noHeaderRoutes.includes(location.pathname);

  // Lógica para o Footer (mantida a sua, mas pode ser ajustada)
  const noFooterRoutes = ['/agenda', '/login', '/cadastro', '/esqueci-senha', '/cadastro-funcionario'];
  const showFooter = !noFooterRoutes.includes(location.pathname);


  return (
    <div className="app-wrapper">
      <BackgroundGrid />
      <GrainOverlay />

      {showHeader && CurrentHeader}

      <main>
        <Routes>
          {/* Rotas Públicas ou que não exigem login específico para visualização inicial */}
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />

          {/* Rotas Protegidas para Usuários Logados */}
          <Route path="/agendamentos" element={isLoggedIn ? <AgendamentosPage /> : <Navigate to="/login" replace />} />
          <Route path="/meus-agendamentos" element={isLoggedIn ? <MeusAgendamentosPage /> : <Navigate to="/login" replace />} />
          <Route path="/perfil" element={isLoggedIn ? <PerfilPage /> : <Navigate to="/login" replace />} />

          {/* Rotas Protegidas para Admin */}
          <Route path="/agenda" element={isLoggedIn && role === 'admin' ? <AgendaPage /> : <Navigate to="/login" replace />} />
          <Route path="/cadastro-funcionario" element={isLoggedIn && role === 'admin' ? <CadastroFuncionarioPage /> : <Navigate to="/login" replace />} />

          {/* Rota de fallback - redireciona com base no login e papel */}
          <Route
            path="*"
            element={
              <Navigate
                to={isLoggedIn ? (role === 'admin' ? "/agenda" : "/agendamentos") : "/login"}
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
      {/* AuthProvider DEVE envolver os componentes que usam o contexto */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;