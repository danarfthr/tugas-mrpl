import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axiosConfig';
import Navbar from '../../components/Navbar';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Select from '../../components/Select';

/**
 * @typedef {Object} Siswa
 * @property {string|number} id
 * @property {string} nis
 * @property {string} nama_lengkap
 * @property {string} jenis_kelamin
 * @property {string} tanggal_lahir
 * @property {string} alamat
 * @property {string|number} kelas_id
 * @property {string} [kelas_nama]
 */

/**
 * @typedef {Object} Kelas
 * @property {string|number} id
 * @property {string} nama_kelas
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

/**
 * Data Siswa (Student Data) management page for Admin Sekolah role
 * Handles CRUD operations for student records
 */
const DataSiswa = () => {
  const { user } = useContext(AuthContext);

  // Redirect if not authorized
  if (!user || !['Admin Sekolah', 'Super Admin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // State management
  const [siswa, setSiswa] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nis: '',
    nama_lengkap: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    alamat: '',
    kelas_id: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch students list
  const fetchSiswa = async (page = 1, searchQuery = search) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: pagination.limit
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get('/siswa', { params });
      const result = response.data;

      if (result.success) {
        setSiswa(result.data || []);
        setPagination(prev => ({
          ...prev,
          page: result.meta?.page || page,
          total: result.meta?.total || 0,
          totalPages: result.meta?.totalPages || 1
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch students');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal memuat data siswa';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch classes for dropdown
  const fetchKelas = async () => {
    try {
      const response = await api.get('/kelas');
      const result = response.data;

      if (result.success) {
        setKelas(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch kelas:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchSiswa();
    fetchKelas();
  }, []);

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSiswa(1, search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Page change handler
  const handlePageChange = (newPage) => {
    fetchSiswa(newPage, search);
  };

  // Open create modal
  const handleOpenCreate = () => {
    setSelectedSiswa(null);
    setFormData({
      nis: '',
      nama_lengkap: '',
      jenis_kelamin: '',
      tanggal_lahir: '',
      alamat: '',
      kelas_id: ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (siswaItem) => {
    setSelectedSiswa(siswaItem);
    setFormData({
      nis: siswaItem.nis || '',
      nama_lengkap: siswaItem.nama_lengkap || '',
      jenis_kelamin: siswaItem.jenis_kelamin || '',
      tanggal_lahir: siswaItem.tanggal_lahir || '',
      alamat: siswaItem.alamat || '',
      kelas_id: siswaItem.kelas_id || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open delete confirmation
  const handleOpenDelete = (siswaItem) => {
    setSelectedSiswa(siswaItem);
    setIsDeleteModalOpen(true);
  };

  // Close modals
  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedSiswa(null);
  };

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.nis?.trim()) {
      errors.nis = 'NIS wajib diisi';
    }

    if (!formData.nama_lengkap?.trim()) {
      errors.nama_lengkap = 'Nama lengkap wajib diisi';
    }

    if (!formData.jenis_kelamin) {
      errors.jenis_kelamin = 'Jenis kelamin wajib dipilih';
    }

    if (!formData.tanggal_lahir) {
      errors.tanggal_lahir = 'Tanggal lahir wajib diisi';
    }

    if (!formData.kelas_id) {
      errors.kelas_id = 'Kelas wajib dipilih';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit create/edit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        nis: formData.nis.trim(),
        nama_lengkap: formData.nama_lengkap.trim(),
        jenis_kelamin: formData.jenis_kelamin,
        tanggal_lahir: formData.tanggal_lahir,
        alamat: formData.alamat?.trim() || '',
        kelas_id: parseInt(formData.kelas_id, 10)
      };

      let response;
      if (selectedSiswa) {
        // Update existing student
        response = await api.put(`/siswa/${selectedSiswa.id}`, payload);
      } else {
        // Create new student
        response = await api.post('/siswa', payload);
      }

      const result = response.data;

      if (result.success) {
        handleCloseModals();
        fetchSiswa(pagination.page, search);
      } else {
        throw new Error(result.error || 'Failed to save student');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan data siswa';
      setFormErrors({ submit: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit delete
  const handleDelete = async () => {
    if (!selectedSiswa) return;

    setIsSubmitting(true);

    try {
      const response = await api.delete(`/siswa/${selectedSiswa.id}`);
      const result = response.data;

      if (result.success) {
        handleCloseModals();
        fetchSiswa(pagination.page, search);
      } else {
        throw new Error(result.error || 'Failed to delete student');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal menghapus data siswa';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table columns definition
  const columns = [
    {
      key: 'no',
      header: 'No',
      render: (row) => {
        const index = siswa.indexOf(row);
        return (pagination.page - 1) * pagination.limit + index + 1;
      }
    },
    { key: 'nis', header: 'NIS' },
    { key: 'nama_lengkap', header: 'Nama' },
    { key: 'kelas_nama', header: 'Kelas' },
    { key: 'alamat', header: 'Alamat' },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-secondary"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </button>
          <button
            className="btn-primary"
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.875rem',
              background: 'linear-gradient(135deg, var(--danger) 0%, #c82333 100%)'
            }}
            onClick={() => handleOpenDelete(row)}
          >
            Hapus
          </button>
        </div>
      )
    }
  ];

  // Gender options for form
  const genderOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
  ];

  // Class options for dropdown
  const classOptions = kelas.map(k => ({
    value: k.id,
    label: k.nama_kelas || `Kelas ${k.id}`
  }));

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Data Siswa
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Kelola data siswa di sistem
          </p>
        </div>

        {/* Filters and Actions Card */}
        <Card style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: '1 1 300px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Cari berdasarkan nama atau NIS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* Add Button */}
            <button className="btn-primary" onClick={handleOpenCreate}>
              + Tambah Siswa
            </button>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--danger) 0%, #c82333 100%)',
              color: 'white'
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Data Table Card */}
        <Card>
          {isLoading && siswa.length === 0 ? (
            <LoadingSpinner />
          ) : error && siswa.length === 0 ? (
            <EmptyState
              title="Gagal memuat data"
              description={error}
              actionText="Coba Lagi"
              onAction={() => fetchSiswa()}
            />
          ) : siswa.length === 0 ? (
            <EmptyState
              title="Belum ada data siswa"
              description={search ? 'Tidak ada siswa yang sesuai dengan pencarian' : 'Silakan tambahkan siswa baru'}
              actionText="Tambah Siswa"
              onAction={handleOpenCreate}
            />
          ) : (
            <Table
              columns={columns}
              data={siswa}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              pageSize={pagination.limit}
              emptyMessage="Tidak ada data siswa"
            />
          )}
        </Card>

        {/* Pagination Info */}
        {siswa.length > 0 && (
          <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={selectedSiswa ? 'Edit Siswa' : 'Tambah Siswa'}
        onConfirm={handleSubmit}
        confirmText={isSubmitting ? 'Menyimpan...' : 'Simpan'}
        variant="primary"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* NIS Field */}
          <div className="form-group">
            <label htmlFor="nis">
              NIS <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="nis"
              name="nis"
              type="text"
              className={`form-input ${formErrors.nis ? 'is-invalid' : ''}`}
              value={formData.nis}
              onChange={handleInputChange}
              placeholder="Masukkan NIS"
              disabled={isSubmitting}
            />
            {formErrors.nis && <span className="error-text">{formErrors.nis}</span>}
          </div>

          {/* Nama Lengkap Field */}
          <div className="form-group">
            <label htmlFor="nama_lengkap">
              Nama Lengkap <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="nama_lengkap"
              name="nama_lengkap"
              type="text"
              className={`form-input ${formErrors.nama_lengkap ? 'is-invalid' : ''}`}
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              placeholder="Masukkan nama lengkap"
              disabled={isSubmitting}
            />
            {formErrors.nama_lengkap && <span className="error-text">{formErrors.nama_lengkap}</span>}
          </div>

          {/* Jenis Kelamin Field */}
          <Select
            label="Jenis Kelamin"
            name="jenis_kelamin"
            value={formData.jenis_kelamin}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, jenis_kelamin: value }));
              setFormErrors(prev => ({ ...prev, jenis_kelamin: null }));
            }}
            options={genderOptions}
            placeholder="Pilih jenis kelamin"
            error={formErrors.jenis_kelamin}
            required
            disabled={isSubmitting}
          />

          {/* Tanggal Lahir Field */}
          <div className="form-group">
            <label htmlFor="tanggal_lahir">
              Tanggal Lahir <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="tanggal_lahir"
              name="tanggal_lahir"
              type="date"
              className={`form-input ${formErrors.tanggal_lahir ? 'is-invalid' : ''}`}
              value={formData.tanggal_lahir}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {formErrors.tanggal_lahir && <span className="error-text">{formErrors.tanggal_lahir}</span>}
          </div>

          {/* Alamat Field */}
          <div className="form-group">
            <label htmlFor="alamat">Alamat</label>
            <textarea
              id="alamat"
              name="alamat"
              className="form-input"
              value={formData.alamat}
              onChange={handleInputChange}
              placeholder="Masukkan alamat"
              rows={3}
              disabled={isSubmitting}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Kelas Field */}
          <Select
            label="Kelas"
            name="kelas_id"
            value={formData.kelas_id}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, kelas_id: value }));
              setFormErrors(prev => ({ ...prev, kelas_id: null }));
            }}
            options={classOptions}
            placeholder="Pilih kelas"
            error={formErrors.kelas_id}
            required
            disabled={isSubmitting}
          />

          {/* Submit Error */}
          {formErrors.submit && (
            <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>
              {formErrors.submit}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Konfirmasi Hapus"
        onConfirm={handleDelete}
        confirmText={isSubmitting ? 'Menghapus...' : 'Hapus'}
        variant="danger"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            Apakah Anda yakin ingin menghapus data siswa:
          </p>
          <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>
            {selectedSiswa?.nama_lengkap}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            NIS: {selectedSiswa?.nis}
          </p>
          <p style={{ marginTop: '1rem', color: 'var(--danger)' }}>
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default DataSiswa;
