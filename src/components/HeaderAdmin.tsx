import React, { useState, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap'; // Usaremos Container para alinhamento
import { useNavigate, Link } from 'react-router-dom';
import {
  FaHome,
  FaUserCircle,
  FaCalendarAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaIdBadge
} from 'react-icons/fa'; // Ícones de exemplo
import '../styles/Header.scss'; // Ou o caminho para o seu SCSS de header principal

const HeaderAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Lógica para o efeito de scroll na navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Lógica para fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Implemente sua lógica de logout aqui (ex: limpar token, invalidar sessão)
    console.log('Usuário deslogado');
    setShowProfileDropdown(false);
    navigate('/'); // Redireciona para a página de login após o logout
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(prev => !prev);
  };

  return (
    <nav className={`custom-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <Container fluid className="d-flex justify-content-between align-items-center px-md-4">
        {/* Ícone Home levando para /agendamentos */}
        <Link to="/agendamentos" className="home-icon" aria-label="Página de Agendamentos">
          <FaHome size={26} />
        </Link>

        {/* Links de Navegação do Admin */}
        <div className="d-flex align-items-center gap-md-3 gap-2">
          <button
            onClick={() => navigate('/agenda')}
            className="header-link-btn"
          >
            <FaCalendarAlt className="me-1 d-none d-sm-inline" /> Agenda
          </button>
          <button
            onClick={() => navigate('/cadastro-funcionario')}
            className="header-link-btn"
          >
            <FaUserPlus className="me-1 d-none d-sm-inline" /> Cadastrar Funcionário
          </button>
        </div>

        {/* Menu do Perfil */}
        <div className="profile-menu-container" ref={profileMenuRef}>
          <FaUserCircle
            className="profile-icon" // Utilize a classe .profile-icon do seu SCSS
            size={28} // Ajuste o tamanho conforme seu estilo
            onClick={toggleProfileDropdown}
            style={{ cursor: 'pointer' }}
          />
          {showProfileDropdown && (
            <div className="profile-dropdown"> {/* Utilize a classe .profile-dropdown do seu SCSS */}
              <button onClick={() => { navigate('/perfil'); setShowProfileDropdown(false); }}>
                <FaIdBadge className="icon" /> Perfil
              </button>
              <hr />
              <button onClick={handleLogout}>
                <FaSignOutAlt className="icon" /> Logout
              </button>
            </div>
          )}
        </div>
      </Container>
    </nav>
  );
};

export default HeaderAdmin;