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
 * DataMapel - Subject (Mata Pelajaran) management page for Admin Sekolah
 * @returns {React.ReactElement}
 */
const DataMapel = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State
  const [mapel, setMapel] = useState([]);
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
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    kode_mapel: '',
    nama_mapel: '',
    jenis: '',
    guru_id: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Redirect if not authorized
  useEffect(() => {
    if (user && !['Admin Sekolah', 'Super Admin'].includes(user.role)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch mapel data
  const fetchMapel = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/mapel', {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchQuery
        }
      });
      setMapel(response.data.data || []);
      setTotalPages(response.data.meta?.total_pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data mata pelajaran');
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
      fetchMapel();
      fetchGuru();
    }
  }, [user, fetchMapel, fetchGuru]);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Open create modal
  const handleOpenCreate = () => {
    setSelectedMapel(null);
    setFormData({
      kode_mapel: '',
      nama_mapel: '',
      jenis: '',
      guru_id: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (item) => {
    setSelectedMapel(item);
    setFormData({
      kode_mapel: item.kode_mapel || '',
      nama_mapel: item.nama_mapel || '',
      jenis: item.jenis || '',
      guru_id: item.guru_id || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open delete confirmation
  const handleOpenDelete = (item) => {
    setSelectedMapel(item);
    setIsDeleteModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.kode_mapel.trim()) {
      errors.kode_mapel = 'Kode mapel harus diisi';
    }
    if (!formData.nama_mapel.trim()) {
      errors.nama_mapel = 'Nama mapel harus diisi';
    }
    if (!formData.jenis) {
      errors.jenis = 'Jenis mapel harus dipilih';
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
        kode_mapel: formData.kode_mapel.trim(),
        nama_mapel: formData.nama_mapel.trim(),
        jenis: formData.jenis,
        guru_id: formData.guru_id || null
      };

      if (selectedMapel) {
        await api.put(`/mapel/${selectedMapel.id}`, payload);
      } else {
        await api.post('/mapel', payload);
      }

      setIsModalOpen(false);
      fetchMapel();
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || 'Gagal menyimpan data' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMapel) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/mapel/${selectedMapel.id}`);
      setIsDeleteModalOpen(false);
      setSelectedMapel(null);
      fetchMapel();
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
      render: (item) => (mapel.indexOf(item) + 1) + (currentPage - 1) * pageSize
    },
    { key: 'kode_mapel', header: 'Kode Mapel' },
    { key: 'nama_mapel', header: 'Nama Mata Pelajaran' },
    {
      key: 'jenis',
      header: 'Jenis',
      render: (item) => (
        <Badge variant={item.jenis === 'Wajib' ? 'success' : 'warning'}>
          {item.jenis}
        </Badge>
      )
    },
    {
      key: 'guru',
      header: 'Guru Pengampu',
      render: (item) => item.guru?.full_name || item.guru?.username || '-'
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

  // Jenis options
  const jenisOptions = [
    { value: 'Wajib', label: 'Wajib' },
    { value: 'Pilihan', label: 'Pilihan' }
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Data Mata Pelajaran</h1>
            <p style={{ color: 'var(--text-muted)' }}>Kelola data mata pelajaran dan guru pengampu</p>
          </div>
          <button className="btn-primary" onClick={handleOpenCreate}>
            + Tambah Mapel
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
              placeholder="Cari nama mapel..."
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
          ) : mapel.length === 0 ? (
            <EmptyState
              title="Tidak ada data mata pelajaran"
              description={searchQuery ? 'Coba ubah kata kunci pencarian' : 'Klik tombol "Tambah Mapel" untuk menambahkan data'}
            />
          ) : (
            <Table
              columns={columns}
              data={mapel}
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
        title={selectedMapel ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
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
              Kode Mapel <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              className={`form-input ${formErrors.kode_mapel ? 'is-invalid' : ''}`}
              placeholder="Contoh: MTK-Wajib"
              value={formData.kode_mapel}
              onChange={(e) => setFormData({ ...formData, kode_mapel: e.target.value })}
            />
            {formErrors.kode_mapel && <span className="error-text">{formErrors.kode_mapel}</span>}
          </div>

          <div className="form-group">
            <label>
              Nama Mata Pelajaran <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              className={`form-input ${formErrors.nama_mapel ? 'is-invalid' : ''}`}
              placeholder="Contoh: Matematika Wajib"
              value={formData.nama_mapel}
              onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
            />
            {formErrors.nama_mapel && <span className="error-text">{formErrors.nama_mapel}</span>}
          </div>

          <Select
            label="Jenis"
            value={formData.jenis}
            onChange={(value) => setFormData({ ...formData, jenis: value })}
            options={jenisOptions}
            placeholder="Pilih jenis..."
            required
            error={formErrors.jenis}
          />

          <Select
            label="Guru Pengampu"
            value={formData.guru_id}
            onChange={(value) => setFormData({ ...formData, guru_id: value })}
            options={guruOptions}
            placeholder="Pilih guru pengampu..."
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
          Apakah Anda yakin ingin menghapus mata pelajaran <strong>{selectedMapel?.nama_mapel}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
};

export default DataMapel;
