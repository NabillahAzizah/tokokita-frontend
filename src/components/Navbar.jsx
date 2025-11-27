import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="navbar-brand-icon">🛒</span>
          <span className="navbar-brand-text">TokoKita</span>
          <span className="navbar-shield" title="Secured with JWT & TLS">🛡️</span>
        </div>

        <div className="navbar-menu">
          <button
            onClick={() => navigate('/')}
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/catalog')}
            className={`navbar-link ${isActive('/catalog') ? 'active' : ''}`}
          >
            Katalog
          </button>
          <button
            onClick={() => navigate('/profile')}
            className={`navbar-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="navbar-icon">👤</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;