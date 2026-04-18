import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      {/* Navbar Simple */}
      <nav style={{ background: 'var(--primary)', padding: '1rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ fontSize: '1.25rem' }}>SIS Terpadu</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Halo, {user?.full_name || user?.username} ({user?.role})</span>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container">
        <h1 style={{ marginBottom: '2rem' }}>Dashboard {user?.role}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {(user?.role === 'Super Admin' || user?.role === 'Admin Sekolah') && (
             <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h3 style={{ marginBottom: '1rem' }}>Manajemen Data Master</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1 }}>
                   Kelola data entitas Siswa, Guru, dan Mata Pelajaran secara terpusat.
                </p>
                <button className="btn-primary" disabled>Akses Modul (Coming Soon)</button>
             </div>
          )}

          {(user?.role === 'Guru Wali Kelas' || user?.role === 'Admin Sekolah') && (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
               <h3 style={{ marginBottom: '1rem' }}>Input Akademik (Nilai)</h3>
               <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1 }}>
                  Lakukan pengisian rentetan entri nilai secara masif langsung ke tabel kelas.
               </p>
               <Link to="/akademik/input-nilai" style={{ display: 'block' }}>
                 <button className="btn-primary" style={{ width: '100%' }}>Buka Modul Nilai</button>
               </Link>
            </div>
          )}

          {(user?.role === 'Guru Wali Kelas' || user?.role === 'Admin Sekolah') && (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
               <h3 style={{ marginBottom: '1rem' }}>Sistem Presensi</h3>
               <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1 }}>
                  Rekapitulasi absensi / status kehadiran siswa kelas harian.
               </p>
               <button className="btn-primary" disabled>Buka Modul Presensi (Coming Soon)</button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
