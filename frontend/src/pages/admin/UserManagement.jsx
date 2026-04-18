import React, { useState, useEffect, useMemo } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import Navbar from '../../components/Navbar';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * User Management page for Admin Sekolah role
 * Allows CRUD operations on teacher (Guru) accounts
 * @returns {React.ReactElement}
 */
const UserManagement = () => {
  const { user } = useContext(AuthContext);

  // Redirect if not authorized
  if (!user || (user.role !== 'Admin Sekolah' && user.role !== 'Super Admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  // State management
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Sort state
  const [sortKey, setSortKey] = useState('full_name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  /**
   * Fetch teachers from API
   * @param {number} page - Page number
   * @param {string} sortKey - Column to sort by
   * @param {string} sortDir - Sort direction (asc/desc)
   */
  const fetchTeachers = async (page = 1, sortKey = 'full_name', sortDir = 'asc') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        role: 'Guru',
        page: page.toString(),
        limit: pageSize.toString(),
        sort_by: sortKey,
        sort_dir: sortDir,
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await api.get(`/users?${params.toString()}`);
      const result = response.data;

      if (result.success) {
        setTeachers(result.data || []);
        setTotalPages(result.meta?.total_pages || 1);
        setTotalCount(result.meta?.total || 0);
      } else {
        throw new Error(result.error || 'Failed to fetch teachers');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat data guru';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTeachers(currentPage, sortKey, sortDirection);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTeachers(1, sortKey, sortDirection);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Handle sort column change
   * @param {string} key - Column key
   * @param {string} direction - Sort direction
   */
  const handleSort = (key, direction) => {
    setSortKey(key);
    setSortDirection(direction);
    setCurrentPage(1);
    fetchTeachers(1, key, direction);
  };

  /**
   * Handle page change
   * @param {number} page - New page number
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchTeachers(page, sortKey, sortDirection);
  };

  /**
   * Open create modal
   */
  const handleOpenCreate = () => {
    setFormMode('create');
    setFormData({ username: '', password: '', full_name: '', email: '' });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  /**
   * Open edit modal
   * @param {Object} teacher - Teacher object to edit
   */
  const handleOpenEdit = (teacher) => {
    setFormMode('edit');
    setSelectedTeacher(teacher);
    setFormData({
      username: teacher.username || '',
      password: '', // Don't pre-fill password
      full_name: teacher.full_name || '',
      email: teacher.email || '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  /**
   * Open delete confirmation modal
   * @param {Object} teacher - Teacher object to delete
   */
  const handleOpenDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  /**
   * Validate form data
   * @returns {boolean} - Whether form is valid
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username wajib diisi';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username minimal 3 karakter';
    }

    if (formMode === 'create' && !formData.password) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }

    if (!formData.full_name.trim()) {
      errors.full_name = 'Nama lengkap wajib diisi';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission (create/update)
   */
  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    setFormSubmitting(true);
    try {
      const payload = {
        username: formData.username.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        role: 'Guru',
      };

      // Only include password for create mode
      if (formMode === 'create' && formData.password) {
        payload.password = formData.password;
      }

      let response;
      if (formMode === 'create') {
        response = await api.post('/users', payload);
      } else {
        response = await api.put(`/users/${selectedTeacher.id}`, payload);
      }

      if (response.data.success) {
        setIsFormModalOpen(false);
        setCurrentPage(1);
        fetchTeachers(1, sortKey, sortDirection);
      } else {
        throw new Error(response.data.error || 'Operasi gagal');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setFormErrors({ general: errorMessage });
    } finally {
      setFormSubmitting(false);
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;

    setFormSubmitting(true);
    try {
      const response = await api.delete(`/users/${selectedTeacher.id}`);

      if (response.data.success) {
        setIsDeleteModalOpen(false);
        setSelectedTeacher(null);
        // Refresh current page if needed
        if (teachers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
          fetchTeachers(currentPage - 1, sortKey, sortDirection);
        } else {
          fetchTeachers(currentPage, sortKey, sortDirection);
        }
      } else {
        throw new Error(response.data.error || 'Gagal menghapus guru');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setError(errorMessage);
      setIsDeleteModalOpen(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  /**
   * Handle input change for form fields
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Table columns definition
  const columns = useMemo(() => [
    {
      key: 'no',
      header: 'No',
      render: (_, index) => (
        <span style={{ color: 'var(--text-muted)' }}>
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      key: 'full_name',
      header: 'Nama',
      render: (teacher) => (
        <div>
          <div style={{ fontWeight: 500 }}>{teacher.full_name}</div>
          {teacher.email && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {teacher.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      render: (teacher) => (
        <Badge variant="secondary">{teacher.username}</Badge>
      ),
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (teacher) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleOpenEdit(teacher)}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            Edit
          </button>
          <button
            onClick={() => handleOpenDelete(teacher)}
            className="btn-primary"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              background: 'var(--danger)',
            }}
          >
            Hapus
          </button>
        </div>
      ),
    },
  ], [currentPage]);

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      <Navbar />

      <main className="container" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>Manajemen Guru</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Total: {totalCount} guru terdaftar
            </p>
          </div>
          <button onClick={handleOpenCreate} className="btn-primary">
            + Tambah Guru Baru
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="glass-panel"
            style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(220,53,69,0.1) 0%, rgba(200,35,51,0.1) 100%)',
              borderLeft: '4px solid var(--danger)',
            }}
          >
            <strong style={{ color: 'var(--danger)' }}>Error:</strong>
            <span style={{ marginLeft: '0.5rem' }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Search bar */}
        <Card>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Cari berdasarkan nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                &#128269;
              </span>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </Card>

        {/* Loading state */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : teachers.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data guru'}
            description={
              searchQuery
                ? `Tidak ditemukan guru dengan nama "${searchQuery}"`
                : 'Klik tombol "Tambah Guru Baru" untuk menambahkan guru pertama'
            }
            action={
              searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="btn-secondary">
                  Reset Pencarian
                </button>
              ) : (
                <button onClick={handleOpenCreate} className="btn-primary">
                  + Tambah Guru Baru
                </button>
              )
            }
          />
        ) : (
          <Table
            columns={columns}
            data={teachers}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            emptyMessage="Tidak ada data guru"
          />
        )}
      </main>

      {/* Create/Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={formMode === 'create' ? 'Tambah Guru Baru' : 'Edit Guru'}
        onConfirm={handleFormSubmit}
        confirmText={formSubmitting ? 'Menyimpan...' : 'Simpan'}
        cancelText="Batal"
        variant="primary"
      >
        {formErrors.general && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              background: 'rgba(220,53,69,0.1)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.9rem',
            }}
          >
            {formErrors.general}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Username <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-input ${formErrors.username ? 'is-invalid' : ''}`}
              placeholder="Masukkan username"
              disabled={formMode === 'edit'}
              style={formMode === 'edit' ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
            />
            {formErrors.username && (
              <span className="error-text">{formErrors.username}</span>
            )}
            {formMode === 'edit' && (
              <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Username tidak dapat diubah
              </small>
            )}
          </div>

          {formMode === 'create' && (
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${formErrors.password ? 'is-invalid' : ''}`}
                placeholder="Masukkan password (min. 6 karakter)"
              />
              {formErrors.password && (
                <span className="error-text">{formErrors.password}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Nama Lengkap <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className={`form-input ${formErrors.full_name ? 'is-invalid' : ''}`}
              placeholder="Masukkan nama lengkap"
            />
            {formErrors.full_name && (
              <span className="error-text">{formErrors.full_name}</span>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Email <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${formErrors.email ? 'is-invalid' : ''}`}
              placeholder="Masukkan alamat email"
            />
            {formErrors.email && (
              <span className="error-text">{formErrors.email}</span>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        onConfirm={handleDeleteConfirm}
        confirmText={formSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelText="Batal"
        variant="danger"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            Apakah Anda yakin ingin menghapus guru:
          </p>
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {selectedTeacher?.full_name}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Username: {selectedTeacher?.username}
          </p>
          <p
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(220,53,69,0.1)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.9rem',
            }}
          >
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;