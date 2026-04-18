import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InputNilai from './pages/InputNilai';
import InputPresensi from './pages/InputPresensi';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import DataSiswa from './pages/admin/DataSiswa';
import DataKelas from './pages/admin/DataKelas';
import DataMapel from './pages/admin/DataMapel';
import SistemKonfigurasi from './pages/admin/SistemKonfigurasi';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Custom Redirect Root
const RootRoute = () => {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route
        path="/akademik/input-nilai"
        element={
          <ProtectedRoute allowedRoles={['Guru Wali Kelas', 'Admin Sekolah']}>
            <InputNilai />
          </ProtectedRoute>
        }
      />

      <Route
        path="/akademik/input-presensi"
        element={
          <ProtectedRoute allowedRoles={['Guru Wali Kelas', 'Admin Sekolah']}>
            <InputPresensi />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manajemen-user"
        element={
          <ProtectedRoute allowedRoles={['Admin Sekolah', 'Super Admin']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/data-siswa"
        element={
          <ProtectedRoute allowedRoles={['Admin Sekolah', 'Super Admin']}>
            <DataSiswa />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/data-kelas"
        element={
          <ProtectedRoute allowedRoles={['Admin Sekolah', 'Super Admin']}>
            <DataKelas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/data-mapel"
        element={
          <ProtectedRoute allowedRoles={['Admin Sekolah', 'Super Admin']}>
            <DataMapel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/sistem-konfigurasi"
        element={
          <ProtectedRoute allowedRoles={['Super Admin']}>
            <SistemKonfigurasi />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
