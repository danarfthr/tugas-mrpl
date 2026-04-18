import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Unauthorized page (403 - Access Denied)
 * Displayed when user attempts to access a page without proper permissions
 * @returns {React.ReactElement}
 */
const Unauthorized = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          maxWidth: '450px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            color: 'var(--danger)',
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
          }}
        >
          403
        </h1>

        <h2
          style={{
            color: 'var(--text-main)',
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
          }}
        >
          Akses Ditolak
        </h2>

        <p
          style={{
            color: 'var(--text-muted)',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}
        >
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>

        <Link to="/dashboard" style={{ display: 'block' }}>
          <button className="btn-primary" style={{ width: '100%' }}>
            Kembali ke Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
