import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import Navbar from '../components/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';
import Select from '../components/Select';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Input Presensi (Attendance Input) page for Guru Wali Kelas
 * @returns {React.ReactElement}
 */
const InputPresensi = () => {
  const navigate = useNavigate();

  // Auth state
  const { user } = React.useContext(AuthContext);

  // Selection state
  const [kelasId, setKelasId] = useState('');
  const [mapelId, setMapelId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

  // Data state
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [students, setStudents] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Status options
  const STATUS_OPTIONS = [
    { key: 'Hadir', label: 'Hadir', color: 'var(--success)', bgColor: '#d4edda' },
    { key: 'Izin', label: 'Izin', color: '#856404', bgColor: '#fff3cd' },
    { key: 'Sakit', label: 'Sakit', color: '#856404', bgColor: '#fff3cd' },
    { key: 'Alpha', label: 'Alpha', color: 'var(--danger)', bgColor: '#f8d7da' }
  ];

  // Fetch kelas list on mount
  useEffect(() => {
    fetchKelas();
    fetchMapel();
  }, []);

  // Fetch students when kelas is selected
  useEffect(() => {
    if (kelasId) {
      fetchStudents(kelasId);
    } else {
      setStudents([]);
    }
  }, [kelasId]);

  /**
   * Fetch list of classes
   */
  const fetchKelas = async () => {
    try {
      const response = await api.get('/kelas');
      if (response.data.status === 'success') {
        setKelasList(response.data.data.map(k => ({
          value: k.id,
          label: k.nama
        })));
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Gagal memuat daftar kelas.' });
    }
  };

  /**
   * Fetch list of subjects
   */
  const fetchMapel = async () => {
    try {
      const response = await api.get('/mapel');
      if (response.data.status === 'success') {
        setMapelList(response.data.data.map(m => ({
          value: m.id,
          label: m.nama
        })));
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Gagal memuat daftar mata pelajaran.' });
    }
  };

  /**
   * Fetch students in selected class
   * @param {string|number} classId - The class ID
   */
  const fetchStudents = async (classId) => {
    setIsFetchingStudents(true);
    try {
      const response = await api.get(`/kelas/${classId}/siswa`);
      if (response.data.status === 'success') {
        const initializedStudents = response.data.data.map(s => ({
          ...s,
          status: null,
          keterangan: ''
        }));
        setStudents(initializedStudents);
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Gagal memuat daftar siswa.' });
      setStudents([]);
    } finally {
      setIsFetchingStudents(false);
    }
  };

  /**
   * Set attendance status for a student
   * @param {number} index - Student index in the array
   * @param {string} status - The status to set
   */
  const handleStatusChange = (index, status) => {
    const updated = [...students];
    updated[index].status = status;
    setStudents(updated);
  };

  /**
   * Validate before saving
   * @returns {boolean} - Whether validation passes
   */
  const validateData = () => {
    const incomplete = students.filter(s => s.status === null);
    if (incomplete.length > 0) {
      setAlert({ type: 'danger', message: `Semua siswa harus memiliki status presensi. ${incomplete.length} siswa belum memiliki status.` });
      return false;
    }
    if (!kelasId || !mapelId || !tanggal) {
      setAlert({ type: 'danger', message: 'Kelas, mata pelajaran, dan tanggal harus diisi.' });
      return false;
    }
    return true;
  };

  /**
   * Save attendance data
   */
  const handleSave = async () => {
    if (!validateData()) return;

    setIsLoading(true);
    setAlert({ type: '', message: '' });

    const payload = students.map(s => ({
      siswa_id: s.id || s.siswa_id,
      status: s.status,
      tanggal: tanggal,
      keterangan: s.keterangan || ''
    }));

    try {
      const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

      await api.post('/akademik/presensi', payload, {
        headers: {
          'x-idempotency-key': idempotencyKey
        }
      });

      setAlert({ type: 'success', message: 'Data presensi berhasil disimpan!' });

      // Reset form after success
      setTimeout(() => {
        setStudents(students.map(s => ({ ...s, status: null, keterangan: '' })));
      }, 2000);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Gagal menyimpan data presensi.';
      if (error.response?.status === 409) {
        setAlert({ type: 'warning', message: 'Data presensi ini sudah pernah tersimpan (Idempotent Hit).' });
      } else {
        setAlert({ type: 'danger', message: errMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Protected route check
  if (!user) {
    return null;
  }

  const allowedRoles = ['Guru Wali Kelas', 'Admin Sekolah'];
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <ErrorBoundary>
      <Navbar />
      <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '2rem' }}>
        {/* Back Button */}
        <button
          className="btn-secondary"
          style={{ marginBottom: '1.5rem' }}
          onClick={() => navigate('/dashboard')}
        >
          &larr; Kembali ke Dashboard
        </button>

        {/* Main Content */}
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Input Presensi Kelas</h2>

          {/* Alert */}
          {alert.message && (
            <div
              className={`alert alert-${alert.type}`}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius)',
                marginBottom: '1.5rem',
                backgroundColor: alert.type === 'success' ? '#d4edda' :
                               alert.type === 'warning' ? '#fff3cd' : '#f8d7da',
                color: alert.type === 'success' ? 'var(--success)' :
                       alert.type === 'warning' ? '#856404' : 'var(--danger)',
                border: `1px solid ${alert.type === 'success' ? '#c3e6cb' :
                                   alert.type === 'warning' ? '#ffeeba' : '#f5c6cb'}`
              }}
            >
              <strong>{alert.type.toUpperCase()}:</strong> {alert.message}
            </div>
          )}

          {/* Selection Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <Select
              label="Pilih Kelas"
              value={kelasId}
              onChange={(val) => {
                setKelasId(val);
                setMapelId('');
              }}
              options={kelasList}
              placeholder="-- Pilih Kelas --"
              required
            />

            <Select
              label="Pilih Mata Pelajaran"
              value={mapelId}
              onChange={(val) => setMapelId(val)}
              options={mapelList}
              placeholder="-- Pilih Mata Pelajaran --"
              required
            />

            <div className="form-group">
              <label htmlFor="tanggal" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Tanggal Presensi <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                id="tanggal"
                className="form-input"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid #ced4da' }}
              />
            </div>
          </div>

          {/* Student Table */}
          {kelasId ? (
            isFetchingStudents ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <LoadingSpinner />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat daftar siswa...</p>
              </div>
            ) : students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>Tidak ada siswa dalam kelas ini.</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th width="8%">No</th>
                        <th width="20%">NIS</th>
                        <th width="32%">Nama Siswa</th>
                        <th width="40%">Status Presensi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={student.id || student.siswa_id}>
                          <td>{idx + 1}</td>
                          <td>{student.nis || student.nis_siswa || '-'}</td>
                          <td>{student.nama || student.nama_siswa}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {STATUS_OPTIONS.map((opt) => {
                                const isSelected = student.status === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    onClick={() => handleStatusChange(idx, opt.key)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      border: `2px solid ${isSelected ? opt.color : '#ced4da'}`,
                                      borderRadius: 'var(--radius)',
                                      backgroundColor: isSelected ? opt.bgColor : 'white',
                                      color: isSelected ? opt.color : 'var(--text-main)',
                                      fontWeight: isSelected ? '600' : '400',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      minWidth: '70px'
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: 'var(--radius)' }}>
                  <strong>Ringkasan:</strong>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {STATUS_OPTIONS.map((opt) => {
                      const count = students.filter(s => s.status === opt.key).length;
                      return (
                        <span key={opt.key} style={{ color: opt.color }}>
                          {opt.label}: <strong>{count}</strong>
                        </span>
                      );
                    })}
                    <span style={{ color: 'var(--text-muted)' }}>
                      Belum mengisi: <strong>{students.filter(s => s.status === null).length}</strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setStudents(students.map(s => ({ ...s, status: null, keterangan: '' })));
                      setAlert({ type: '', message: '' });
                    }}
                    disabled={isLoading}
                  >
                    Reset
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={isLoading || students.length === 0}
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan Presensi'}
                  </button>
                </div>
              </>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <p>Pilih kelas terlebih dahulu untuk melihat daftar siswa.</p>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default InputPresensi;