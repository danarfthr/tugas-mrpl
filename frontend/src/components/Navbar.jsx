import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Navbar component displaying user info and logout functionality
 * @returns {React.ReactElement}
 */
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
        SIS Terpadu
      </h2>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem' }}>
          {user?.full_name || user?.username} ({user?.role})
        </span>
        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
