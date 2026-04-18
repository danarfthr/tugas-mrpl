import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axiosConfig';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from '../../components/Select';
import Navbar from '../../components/Navbar';

/**
 * DataKelas - Class (Kelas) management page for Admin Sekolah
 * @returns {React.ReactElement}
 */
const DataKelas = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State
  const [kelas, setKelas] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nama_kelas: '',
    tingkat: '',
    tahun_ajaran: '',
    wali_kelas_id: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Redirect if not authorized
  useEffect(() => {
    if (user && !['Admin Sekolah', 'Super Admin'].includes(user.role)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch kelas data
  const fetchKelas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/kelas', {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchQuery
        }
      });
      setKelas(response.data.data || []);
      setTotalPages(response.data.meta?.total_pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data kelas');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  // Fetch guru list for dropdown
  const fetchGuru = useCallback(async () => {
    try {
      const response = await api.get('/guru');
      setGuruList(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch guru list:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchKelas();
      fetchGuru();
    }
  }, [user, fetchKelas, fetchGuru]);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Open create modal
  const handleOpenCreate = () => {
    setSelectedKelas(null);
    setFormData({
      nama_kelas: '',
      tingkat: '',
      tahun_ajaran: '',
      wali_kelas_id: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (item) => {
    setSelectedKelas(item);
    setFormData({
      nama_kelas: item.nama_kelas || '',
      tingkat: item.tingkat || '',
      tahun_ajaran: item.tahun_ajaran || '',
      wali_kelas_id: item.wali_kelas_id || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open delete confirmation
  const handleOpenDelete = (item) => {
    setSelectedKelas(item);
    setIsDeleteModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.nama_kelas.trim()) {
      errors.nama_kelas = 'Nama kelas harus diisi';
    }
    if (!formData.tingkat) {
      errors.tingkat = 'Tingkat harus dipilih';
    }
    if (!formData.tahun_ajaran.trim()) {
      errors.tahun_ajaran = 'Tahun ajaran harus diisi';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        nama_kelas: formData.nama_kelas.trim(),
        tingkat: parseInt(formData.tingkat),
        tahun_ajaran: formData.tahun_ajaran.trim(),
        wali_kelas_id: formData.wali_kelas_id || null
      };

      if (selectedKelas) {
        await api.put(`/kelas/${selectedKelas.id}`, payload);
      } else {
        await api.post('/kelas', payload);
      }

      setIsModalOpen(false);
      fetchKelas();
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || 'Gagal menyimpan data' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedKelas) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/kelas/${selectedKelas.id}`);
      setIsDeleteModalOpen(false);
      setSelectedKelas(null);
      fetchKelas();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'no',
      header: 'No',
      render: (item) => (kelas.indexOf(item) + 1) + (currentPage - 1) * pageSize
    },
    { key: 'nama_kelas', header: 'Nama Kelas' },
    {
      key: 'tingkat',
      header: 'Tingkat',
      render: (item) => <Badge variant="secondary">Kelas {item.tingkat}</Badge>
    },
    { key: 'tahun_ajaran', header: 'Tahun Ajaran' },
    {
      key: 'wali_kelas',
      header: 'Guru Wali',
      render: (item) => item.wali_kelas?.full_name || item.wali_kelas?.username || '-'
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (item) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-secondary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => handleOpenEdit(item)}
          >
            Edit
          </button>
          <button
            className="btn-primary"
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.8rem',
              background: 'linear-gradient(135deg, var(--danger) 0%, #c82333 100%)'
            }}
            onClick={() => handleOpenDelete(item)}
          >
            Hapus
          </button>
        </div>
      )
    }
  ];

  // Guru options for select
  const guruOptions = guruList.map((g) => ({
    value: g.id,
    label: g.full_name || g.username
  }));

  // Tingkat options
  const tingkatOptions = [
    { value: 10, label: 'Kelas 10' },
    { value: 11, label: 'Kelas 11' },
    { value: 12, label: 'Kelas 12' }
  ];

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Data Kelas</h1>
            <p style={{ color: 'var(--text-muted)' }}>Kelola data kelas dan tahun ajaran</p>
          </div>
          <button className="btn-primary" onClick={handleOpenCreate}>
            + Tambah Kelas
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Search */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama kelas..."
              value={searchQuery}
              onChange={handleSearch}
              style={{ maxWidth: '300px' }}
            />
          </div>
        </Card>

        {/* Table */}
        <Card>
          {isLoading ? (
            <LoadingSpinner />
          ) : kelas.length === 0 ? (
            <EmptyState
              title="Tidak ada data kelas"
              description={searchQuery ? 'Coba ubah kata kunci pencarian' : 'Klik tombol "Tambah Kelas" untuk menambahkan data'}
            />
          ) : (
            <Table
              columns={columns}
              data={kelas}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
            />
          )}
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}
        onConfirm={handleSubmit}
        confirmText={isSubmitting ? 'Menyimpan...' : 'Simpan'}
        variant="primary"
      >
        <div>
          {formErrors.submit && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              {formErrors.submit}
            </div>
          )}

          <div className="form-group">
            <label>
              Nama Kelas <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              className={`form-input ${formErrors.nama_kelas ? 'is-invalid' : ''}`}
              placeholder="Contoh: X-MIPA-1"
              value={formData.nama_kelas}
              onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
            />
            {formErrors.nama_kelas && <span className="error-text">{formErrors.nama_kelas}</span>}
          </div>

          <Select
            label="Tingkat"
            value={formData.tingkat}
            onChange={(value) => setFormData({ ...formData, tingkat: value })}
            options={tingkatOptions}
            placeholder="Pilih tingkat..."
            required
            error={formErrors.tingkat}
          />

          <div className="form-group">
            <label>
              Tahun Ajaran <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              className={`form-input ${formErrors.tahun_ajaran ? 'is-invalid' : ''}`}
              placeholder="Contoh: 2026/2027"
              value={formData.tahun_ajaran}
              onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
            />
            {formErrors.tahun_ajaran && <span className="error-text">{formErrors.tahun_ajaran}</span>}
          </div>

          <Select
            label="Guru Wali Kelas"
            value={formData.wali_kelas_id}
            onChange={(value) => setFormData({ ...formData, wali_kelas_id: value })}
            options={guruOptions}
            placeholder="Pilih guru wali..."
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        onConfirm={handleDelete}
        confirmText={isSubmitting ? 'Menghapus...' : 'Hapus'}
        variant="danger"
      >
        <p>
          Apakah Anda yakin ingin menghapus kelas <strong>{selectedKelas?.nama_kelas}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
};

export default DataKelas;
