import React, { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

/**
 * Sistem Konfigurasi page for Super Admin role
 * System settings, health monitoring, session management, and audit logs
 * @returns {React.ReactElement}
 */
const SistemKonfigurasi = () => {
  const { user } = useContext(AuthContext);

  // Redirect if not Super Admin
  if (!user || user.role !== 'Super Admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // System health state
  const [systemHealth, setSystemHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  // Backup state
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(null);
  const [backupError, setBackupError] = useState(null);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState(null);
  const [invalidateLoading, setInvalidateLoading] = useState(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState(null);

  // Delete session modal state
  const [isDeleteSessionModalOpen, setIsDeleteSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  /**
   * Fetch system health status
   */
  const fetchSystemHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const response = await api.get('/admin/system-health');
      const result = response.data;
      if (result.success) {
        setSystemHealth(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch system health');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat status sistem';
      setHealthError(errorMessage);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  /**
   * Trigger manual database backup
   */
  const handleBackup = async () => {
    setBackupLoading(true);
    setBackupSuccess(null);
    setBackupError(null);
    try {
      const response = await api.post('/admin/backup');
      const result = response.data;
      if (result.success) {
        setBackupSuccess('Backup database berhasil dilakukan');
        fetchSystemHealth();
      } else {
        throw new Error(result.error || 'Backup gagal');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal melakukan backup';
      setBackupError(errorMessage);
    } finally {
      setBackupLoading(false);
    }
  };

  /**
   * Fetch active sessions
   */
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const response = await api.get('/admin/sessions');
      const result = response.data;
      if (result.success) {
        setSessions(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch sessions');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat sesi aktif';
      setSessionsError(errorMessage);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  /**
   * Open invalidate session confirmation
   * @param {Object} session - Session object to invalidate
   */
  const handleOpenInvalidateSession = (session) => {
    setSelectedSession(session);
    setIsDeleteSessionModalOpen(true);
  };

  /**
   * Invalidate selected session (force logout)
   */
  const handleInvalidateSession = async () => {
    if (!selectedSession) return;
    setInvalidateLoading(selectedSession.id);
    try {
      const response = await api.delete(`/admin/sessions/${selectedSession.id}`);
      if (response.data.success) {
        setIsDeleteSessionModalOpen(false);
        setSelectedSession(null);
        fetchSessions();
      } else {
        throw new Error(response.data.error || 'Gagal menginvalidasi sesi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setSessionsError(errorMessage);
      setIsDeleteSessionModalOpen(false);
    } finally {
      setInvalidateLoading(null);
    }
  };

  /**
   * Fetch audit logs
   */
  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const response = await api.get('/admin/audit-logs?limit=10');
      const result = response.data;
      if (result.success) {
        setAuditLogs(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal memuat log audit';
      setAuditError(errorMessage);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchSystemHealth();
    fetchSessions();
    fetchAuditLogs();
  }, [fetchSystemHealth, fetchSessions, fetchAuditLogs]);

  /**
   * Format timestamp to readable date
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} - Formatted date string
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Format relative time (e.g., "5 menit yang lalu")
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} - Relative time string
   */
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '-';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return formatTimestamp(timestamp);
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      <Navbar />

      <main className="container" style={{ padding: '2rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Sistem Konfigurasi</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Pengaturan sistem dan monitoring
          </p>
        </div>

        {/* Error alerts */}
        {(healthError || backupError || sessionsError || auditError) && (
          <div
            className="glass-panel"
            style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(220,53,69,0.1) 0%, rgba(200,35,51,0.1) 100%)',
              borderLeft: '4px solid var(--danger)',
            }}
          >
            {healthError && (
              <div style={{ marginBottom: healthError ? '0.5rem' : 0 }}>
                <strong style={{ color: 'var(--danger)' }}>Health Error:</strong>
                <span style={{ marginLeft: '0.5rem' }}>{healthError}</span>
              </div>
            )}
            {backupError && (
              <div style={{ marginBottom: backupError ? '0.5rem' : 0 }}>
                <strong style={{ color: 'var(--danger)' }}>Backup Error:</strong>
                <span style={{ marginLeft: '0.5rem' }}>{backupError}</span>
              </div>
            )}
            {sessionsError && (
              <div style={{ marginBottom: sessionsError ? '0.5rem' : 0 }}>
                <strong style={{ color: 'var(--danger)' }}>Sessions Error:</strong>
                <span style={{ marginLeft: '0.5rem' }}>{sessionsError}</span>
              </div>
            )}
            {auditError && (
              <div>
                <strong style={{ color: 'var(--danger)' }}>Audit Error:</strong>
                <span style={{ marginLeft: '0.5rem' }}>{auditError}</span>
              </div>
            )}
          </div>
        )}

        {/* Success alerts */}
        {backupSuccess && (
          <div
            className="glass-panel"
            style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(25,135,84,0.1) 0%, rgba(22,101,52,0.1) 100%)',
              borderLeft: '4px solid var(--success)',
            }}
          >
            <strong style={{ color: 'var(--success)' }}>Berhasil:</strong>
            <span style={{ marginLeft: '0.5rem' }}>{backupSuccess}</span>
            <button
              onClick={() => setBackupSuccess(null)}
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

        {/* Grid layout for cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {/* System Health Card */}
          <Card title="Status Sistem">
            {healthLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <LoadingSpinner size="md" />
              </div>
            ) : systemHealth ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: systemHealth.api_status === 'ok' ? 'var(--success)' : 'var(--danger)',
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>API</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {systemHealth.api_status === 'ok' ? 'Terhubung' : 'Tidak terhubung'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: systemHealth.database_status === 'ok' ? 'var(--success)' : 'var(--danger)',
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>Database</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {systemHealth.database_status === 'ok' ? 'Terhubung' : 'Tidak terhubung'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: systemHealth.redis_status === 'ok' ? 'var(--success)' : 'var(--danger)',
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>Redis</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {systemHealth.redis_status === 'ok' ? 'Terhubung' : 'Tidak terhubung'}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    paddingTop: '0.75rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>Last Backup:</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    {systemHealth.last_backup ? formatRelativeTime(systemHealth.last_backup) : 'Belum pernah'}
                  </span>
                </div>

                <button
                  onClick={fetchSystemHealth}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  Refresh Status
                </button>
              </div>
            ) : (
              <EmptyState
                title="Tidak dapat memuat status sistem"
                description="Coba refresh halaman atau hubungi administrator"
                action={
                  <button onClick={fetchSystemHealth} className="btn-secondary">
                    Coba Lagi
                  </button>
                }
              />
            )}
          </Card>

          {/* Database Backup Section */}
          <Card title="Backup Database">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Lakukan backup database secara manual untuk menjaga integritas data.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 500 }}>Backup Terakhir:</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {systemHealth?.last_backup ? formatTimestamp(systemHealth.last_backup) : '-'}
                </span>
              </div>

              <button
                onClick={handleBackup}
                disabled={backupLoading}
                className="btn-primary"
                style={{
                  opacity: backupLoading ? 0.6 : 1,
                  cursor: backupLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {backupLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <LoadingSpinner size="sm" />
                    Memproses Backup...
                  </span>
                ) : (
                  'Trigger Backup Sekarang'
                )}
              </button>
            </div>
          </Card>

          {/* User Sessions Card */}
          <Card title="Sesi Pengguna Aktif">
            {sessionsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <LoadingSpinner size="md" />
              </div>
            ) : sessions.length === 0 ? (
              <EmptyState
                title="Tidak ada sesi aktif"
                description="Tidak ada pengguna yang sedang login saat ini"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="glass-panel"
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 500 }}>{session.username}</span>
                        <Badge variant="secondary">{session.role}</Badge>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Login: {formatRelativeTime(session.login_time)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenInvalidateSession(session)}
                      disabled={invalidateLoading === session.id}
                      className="btn-secondary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.75rem',
                        background: 'var(--danger)',
                        color: 'white',
                        opacity: invalidateLoading === session.id ? 0.6 : 1,
                      }}
                    >
                      {invalidateLoading === session.id ? '...' : 'Invalidasi'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Audit Log Preview */}
          <Card title="Log Audit Terbaru">
            {auditLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <LoadingSpinner size="md" />
              </div>
            ) : auditLogs.length === 0 ? (
              <EmptyState
                title="Tidak ada log audit"
                description="Aksi pengguna akan dicatat di sini"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {auditLogs.map((log, index) => (
                  <div
                    key={log.id || index}
                    style={{
                      padding: '0.5rem 0',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                          {log.action || log.action_type || 'Unknown Action'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {log.user || log.username || 'System'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatRelativeTime(log.timestamp || log.created_at)}
                      </span>
                    </div>
                    {log.details && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                        {log.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* System Info Card */}
          <Card title="Informasi Sistem">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Versi Aplikasi</span>
                <span style={{ fontWeight: 500 }}>{systemHealth?.app_version || '1.0.0'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Environment</span>
                <Badge variant={systemHealth?.environment === 'production' ? 'danger' : 'warning'}>
                  {systemHealth?.environment || 'development'}
                </Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Node Version</span>
                <span style={{ fontWeight: 500 }}>{systemHealth?.node_version || '18.x'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Database</span>
                <span style={{ fontWeight: 500 }}>{systemHealth?.database_type || 'PostgreSQL 15'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cache</span>
                <span style={{ fontWeight: 500 }}>{systemHealth?.cache_type || 'Redis'}</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Invalidate Session Confirmation Modal */}
      <Modal
        isOpen={isDeleteSessionModalOpen}
        onClose={() => setIsDeleteSessionModalOpen(false)}
        title="Konfirmasi Invalidasi Sesi"
        onConfirm={handleInvalidateSession}
        confirmText={invalidateLoading ? 'Menyimpan...' : 'Ya, Invalidasi'}
        cancelText="Batal"
        variant="danger"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            Apakah Anda yakin ingin menginvalidasi sesi pengguna:
          </p>
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {selectedSession?.username}
          </p>
          <Badge variant="secondary" style={{ marginTop: '0.5rem' }}>
            {selectedSession?.role}
          </Badge>
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
            Pengguna akan dipaksa logout dan harus login ulang.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SistemKonfigurasi;
