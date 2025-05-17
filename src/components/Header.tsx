import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaUser, FaSignOutAlt, FaHome } from 'react-icons/fa';
import '../styles/Header.scss';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Navbar expand="lg" className="custom-navbar transparent-navbar">
      <Container fluid className="d-flex justify-content-between align-items-center">

        {/* Ícone de casa à esquerda */}
        <div className="left-icons">
          <FaHome
            className="home-icon"
            size={28}
            onClick={() => navigate('/agendamentos')}
          />
        </div>

        {/* Ícones à direita */}
        <div className="d-flex align-items-center gap-4">
          <button
            className="header-link-btn"
            onClick={() => navigate('/meus-agendamentos')}
          >
            Meus agendamentos
          </button>

          <div className="profile-menu-container" ref={menuRef}>
            <FaUserCircle
              className="profile-icon"
              size={28}
              onClick={() => setShowMenu(prev => !prev)}
            />

            {showMenu && (
              <div className="profile-dropdown">
                <button onClick={() => navigate('/perfil')}>
                  <FaUser className="icon" />
                  Perfil
                </button>
                <hr />
                <button onClick={() => alert('Deslogado!')}>
                  <FaSignOutAlt className="icon" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
