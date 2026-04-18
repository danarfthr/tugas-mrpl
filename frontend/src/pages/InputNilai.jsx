import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const InputNilai = () => {
  const navigate = useNavigate();
  const [semester, setSemester] = useState('Ganjil 2026/2027');
  const [mapelId, setMapelId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Dummy list of students, realistically fetched from API
  const [students, setStudents] = useState([
    { siswa_id: 'db4b0ebd-0c53-470b-8dce-0ab07eef331f', name: 'Agus Santoso', score: 85 },
    { siswa_id: 'fdfe0ebd-0c53-470b-8dce-0ab07eef332a', name: 'Budi Rahayu', score: '' }
  ]);

  const handleScoreChange = (index, value) => {
    const updated = [...students];
    updated[index].score = value;
    setStudents(updated);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setAlert({ type: '', message: '' });

    // Validate inputs
    const invalid = students.find(s => s.score === '' || Number(s.score) < 0 || Number(s.score) > 100);
    if (invalid) {
      setAlert({ type: 'danger', message: 'Ada data yang kosong atau di luar jangkauan (0-100).' });
      setIsLoading(false);
      return;
    }

    const payload = students.map(s => ({
      siswa_id: s.siswa_id,
      mata_pelajaran_id: mapelId,
      nilai_akhir: Number(s.score),
      semester: semester
    }));

    try {
      // Create idempotency key
      const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

      await api.post('/akademik/nilai', payload, {
        headers: {
          'x-idempotency-key': idempotencyKey
        }
      });

      setAlert({ type: 'success', message: 'Data nilai kelas berhasil disimpan (Bulk Upsert Success)!' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal menyimpan data';
      if (err.response?.status === 409) {
        setAlert({ type: 'warning', message: 'Data ini telah tersimpan (Idempotent Hit).' });
      } else {
        setAlert({ type: 'danger', message: errMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '2rem' }}>
      <button className="btn-secondary" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/dashboard')}>
         &larr; Kembali ke Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Input Nilai Kelas X-MIPA 1 - Matematika</h2>

        {alert.message && (
          <div className={`alert alert-${alert.type}`}>
            <strong>{alert.type.toUpperCase()}:</strong> {alert.message}
          </div>
        )}

        <div className="form-group" style={{ maxWidth: '300px' }}>
          <select 
            className="form-input" 
            value={semester} 
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="Ganjil 2026/2027">Semester Ganjil 2026</option>
            <option value="Genap 2026/2027">Semester Genap 2026</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th width="10%">No</th>
                <th width="40%">Nama Siswa</th>
                <th width="50%">Nilai Akhir (0-100)</th>
              </tr>
            </thead>
            <tbody>
              {students.map((siswa, idx) => {
                const isInvalid = siswa.score !== '' && (Number(siswa.score) < 0 || Number(siswa.score) > 100);
                return (
                  <tr key={siswa.siswa_id}>
                    <td>{idx + 1}</td>
                    <td>{siswa.name}</td>
                    <td>
                      <input 
                        type="number" 
                        className={`form-input ${isInvalid ? 'is-invalid' : ''}`}
                        style={{ maxWidth: '100px' }}
                        value={siswa.score}
                        autoComplete="off"
                        onChange={(e) => handleScoreChange(idx, e.target.value)}
                        placeholder="Nilai"
                      />
                      {isInvalid && <span className="error-text">Nilai harus 0 - 100</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => navigate(-1)}>Batal</button>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputNilai;
