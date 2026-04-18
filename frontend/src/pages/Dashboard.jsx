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
            <Link to="/admin/manajemen-user">
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                <h3 style={{ marginBottom: '1rem' }}>Manajemen User</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1 }}>
                   Kelola akun Guru dan hak akses pengguna.
                </p>
                <button className="btn-primary" style={{ width: '100%' }}>Buka Modul</button>
              </div>
            </Link>
          )}

          {(user?.role === 'Super Admin' || user?.role === 'Admin Sekolah') && (
            <Link to="/admin/data-siswa">
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                <h3 style={{ marginBottom: '1rem' }}>Data Siswa</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1 }}>
                   Kelola data siswa dan informasi kelas.
                </p>
                <button className="btn-primary" style={{ width: '100%' }}>Buka Modul</button>
              </div>
            </Link>
          )}

          {(user?.role === 'Super Admin' || user?.role === 'Admin Sekolah') && (
            <Link to="/admin/data-kelas">
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                <h3 style={{ marginBottom: '1rem' }}>Data Kelas</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1 }}>
                   Kelola kelas dan guru wali kelas.
                </p>
                <button className="btn-primary" style={{ width: '100%' }}>Buka Modul</button>
              </div>
            </Link>
          )}

          {(user?.role === 'Super Admin' || user?.role === 'Admin Sekolah') && (
            <Link to="/admin/data-mapel">
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                <h3 style={{ marginBottom: '1rem' }}>Data Mata Pelajaran</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1 }}>
                   Kelola mata pelajaran dan guru pengampu.
                </p>
                <button className="btn-primary" style={{ width: '100%' }}>Buka Modul</button>
              </div>
            </Link>
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
            <Link to="/akademik/input-presensi">
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                 <h3 style={{ marginBottom: '1rem' }}>Sistem Presensi</h3>
                 <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1 }}>
                    Rekapitulasi absensi / status kehadiran siswa kelas harian.
                 </p>
                 <button className="btn-primary" style={{ width: '100%' }}>Buka Modul Presensi</button>
              </div>
            </Link>
          )}

          {user?.role === 'Super Admin' && (
            <Link to="/admin/sistem-konfigurasi">
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                <h3 style={{ marginBottom: '1rem' }}>Sistem Konfigurasi</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1 }}>
                   Pengaturan sistem, backup, dan monitoring.
                </p>
                <button className="btn-primary" style={{ width: '100%' }}>Buka Modul</button>
              </div>
            </Link>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
