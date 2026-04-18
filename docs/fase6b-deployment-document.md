# Dokumen Fase 6B: Deployment Document — Sistem Informasi Terpadu SMA
**Nomor Dokumen:** DEPLOY-SMA-v1.0  
**Standar Referensi:** ISO/IEC 12207, SAD IEEE 1016  
**Tanggal Rilis:** 18 April 2026  
**Versi Sistem:** v1.0.0  
**Target RTO:** 4 Jam | **Target RPO:** 1 Jam  

---

## BAGIAN 1: PRE-DEPLOYMENT CHECKLIST

> ⚠️ **WAJIB diselesaikan 100% sebelum deployment dimulai. Setiap item yang tidak di-check harus diselesaikan atau mendapat approval eksplisit dari Project Manager / Tech Lead.**

### 1.1 Checklist Infrastruktur & Environment

| No | Item | Penanggungjawab | Status |
|----|------|----------------|--------|
| 01 | Server Production telah di-provision (CPU, RAM, Disk sesuai spesifikasi) | DevOps/IT | ☐ |
| 02 | Docker & Docker Compose telah terpasang di server Production | DevOps/IT | ☐ |
| 03 | DNS record untuk `sma-internal.sch.id` telah diarahkan ke IP Production | DevOps/IT | ☐ |
| 04 | SSL/TLS Certificate (HTTPS) telah terpasang dan valid (exp. > 30 hari) | DevOps/IT | ☐ |
| 05 | Nginx / Reverse Proxy telah dikonfigurasi untuk routing Frontend & Backend | DevOps/IT | ☐ |
| 06 | Firewall rules: Port 80/443 terbuka; Port 5432 (DB) & 6379 (Redis) **ditutup** dari public | DevOps/IT | ☐ |
| 07 | Monitoring stack (Prometheus + Grafana) aktif di server Production | DevOps/IT | ☐ |

### 1.2 Checklist Database

| No | Item | Penanggungjawab | Status |
|----|------|----------------|--------|
| 08 | PostgreSQL 15 telah berjalan di container Production | DevOps/IT | ☐ |
| 09 | Database `sma_db` telah dibuat dengan user & password sesuai `.env.production` | DevOps/IT | ☐ |
| 10 | Prisma migration (`prisma migrate deploy`) telah dijalankan dan berhasil | Backend Dev | ☐ |
| 11 | **Backup database awal (snapshot)** sebelum deployment telah dibuat & disimpan | DevOps/IT | ☐ |
| 12 | Cron job backup otomatis setiap 60 menit telah aktif (RPO compliance) | DevOps/IT | ☐ |
| 13 | Seed data awal (akun Super Admin) telah dijalankan di Production | Backend Dev | ☐ |

### 1.3 Checklist Kode & Build

| No | Item | Penanggungjawab | Status |
|----|------|----------------|--------|
| 14 | Merge dari branch `develop` ke `main` telah di-review dan disetujui | Tech Lead | ☐ |
| 15 | CI/CD pipeline di branch `main` lulus semua tahap (Build, Test, Lint, Security Scan) | QA/DevOps | ☐ |
| 16 | Tidak ada *secret* (API key, password) yang ter-commit ke Git repository | Tech Lead | ☐ |
| 17 | File `.env.production` telah diisi lengkap dan aman di server Production | DevOps/IT | ☐ |
| 18 | Frontend build (`npm run build`) menghasilkan artefak produksi yang valid | Frontend Dev | ☐ |
| 19 | Backend health check endpoint (`GET /health`) merespons HTTP 200 | Backend Dev | ☐ |

### 1.4 Checklist Keamanan

| No | Item | Penanggungjawab | Status |
|----|------|----------------|--------|
| 20 | Hasil DAST / Security Scan tidak ada temuan S1/S2 yang open | SQA | ☐ |
| 21 | `JWT_SECRET` di `.env.production` memiliki entropi minimal 32 karakter random | Backend Dev | ☐ |
| 22 | CORS origin di backend hanya mengizinkan domain Production | Backend Dev | ☐ |
| 23 | `NODE_ENV=production` diset (menyembunyikan stack trace & error detail) | Backend Dev | ☐ |
| 24 | Rate limiting aktif (max 100 req/min per IP di endpoint login) | Backend Dev | ☐ |

### 1.5 Checklist UAT & Sign-Off

| No | Item | Penanggungjawab | Status |
|----|------|----------------|--------|
| 25 | UAT Sign-Off Sheet telah ditandatangani minimal 3 peserta | Project Manager | ☐ |
| 26 | Load test (500 CCU) di Staging telah lulus SLO (P95 <500ms, <1.2s) | QA | ☐ |
| 27 | Tidak ada open defect S1/S2 dari hasil UAT | QA | ☐ |
| 28 | Stakeholders telah dinotifikasi jadwal go-live & maintenance window | Project Manager | ☐ |

---

## BAGIAN 2: DEPLOYMENT PROCEDURE

### 2.1 Maintenance Window
**Waktu yang direkomendasikan:** Jumat/Sabtu pukul 22:00–02:00 WIB (di luar jam operasional sekolah)  
**Estimasi Durasi:** 60–90 menit  
**Rollback Decision Point:** Maksimal T+45 menit setelah deployment dimulai. Jika sistem belum stabil, trigger rollback.

### 2.2 Langkah Deployment (Production)

```bash
# ============================================================
# DEPLOYMENT RUNBOOK — Sistem Informasi Terpadu SMA v1.0.0
# Dijalankan oleh: DevOps Engineer / Tech Lead
# ============================================================

# LANGKAH 1: Ambil versi terbaru dari Git
git fetch origin
git checkout main
git pull origin main
git tag v1.0.0                  # Tag versi release
git push origin v1.0.0

# LANGKAH 2: Backup database sebelum deployment (WAJIB)
docker exec mrpl_postgres pg_dump -U admin sma_db > \
  /backup/sma_db_$(date +%Y%m%d_%H%M%S)_pre-v1.0.0.sql
echo "✅ Backup selesai"

# LANGKAH 3: Build image terbaru
docker compose -f docker-compose.prod.yml build --no-cache

# LANGKAH 4: Hentikan container lama (graceful)
docker compose -f docker-compose.prod.yml down --timeout 30

# LANGKAH 5: Jalankan migrasi database
docker compose -f docker-compose.prod.yml run --rm backend \
  npx prisma migrate deploy

# LANGKAH 6: Jalankan container baru
docker compose -f docker-compose.prod.yml up -d

# LANGKAH 7: Tunggu container siap (max 60 detik)
sleep 30
docker compose -f docker-compose.prod.yml ps

# LANGKAH 8: Health Check
curl -f http://localhost:3000/health || echo "❌ BACKEND TIDAK SEHAT — ISSUE ROLLBACK"
curl -f http://localhost:5173 || echo "❌ FRONTEND TIDAK MERESPONS — ISSUE ROLLBACK"

# LANGKAH 9: Smoke test singkat
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"[GANTI]"}' \
  | grep "token"

echo "✅ Deployment selesai. Mulai Post-Deployment Monitoring."
```

---

## BAGIAN 3: ROLLBACK PROCEDURE

> ⚠️ **Trigger Rollback jika:** (1) Health check gagal, (2) Error rate > 5% dalam 15 menit pertama, (3) Database corruption terdeteksi, (4) Fitur kritis tidak berjalan.

### 3.1 Matriks Keputusan Rollback

```mermaid
flowchart TD
    A[Post-Deploy Health Check] --> B{Semua OK?}
    B -- Ya --> C[Lanjut Monitoring Normal]
    B -- Tidak --> D{Akar Masalah?}
    D -- Kode/Container --> E[Rollback Container ke Versi Sebelumnya]
    D -- Database Schema --> F[Rollback Database Migration]
    D -- Konfigurasi ENV --> G[Perbaiki ENV, Restart Container]
    E --> H[Verifikasi Health Check Ulang]
    F --> H
    G --> H
    H --> I{Stabil?}
    I -- Ya --> J[Notifikasi Stakeholder - Sistem Kembali]
    I -- Tidak --> K[Eskalasi ke Tech Lead - Investigasi Mendalam]
```

### 3.2 Prosedur Rollback Container (Estimasi: 10–15 menit)

```bash
# ============================================================
# ROLLBACK PROCEDURE — Versi Container Sebelumnya
# ============================================================

# LANGKAH 1: Hentikan container bermasalah
docker compose -f docker-compose.prod.yml down --timeout 30

# LANGKAH 2: Rollback ke image versi sebelumnya (jika menggunakan tag)
# Ganti 'v0.9.0' dengan versi production sebelumnya
docker compose -f docker-compose.prod.yml up -d --scale backend=0
docker tag sma_backend:v0.9.0 sma_backend:latest

# LANGKAH 3: Restart dengan versi lama
docker compose -f docker-compose.prod.yml up -d

# LANGKAH 4: Verifikasi
sleep 20
curl -f http://localhost:3000/health && echo "✅ Rollback berhasil"

# LANGKAH 5: Notifikasi
echo "ROLLBACK SELESAI pada $(date). Sistem kembali ke v0.9.0" | \
  tee /var/log/sma/rollback.log
```

### 3.3 Prosedur Rollback Database (Estimasi: 15–30 menit)

> ⚠️ **Jalankan HANYA jika ada perubahan schema yang menyebabkan data corruption.**

```bash
# LANGKAH 1: Hentikan backend (jangan sentuh DB saat restore)
docker stop sma_backend

# LANGKAH 2: Drop database (hati-hati!)
docker exec mrpl_postgres psql -U admin -c "DROP DATABASE sma_db;"
docker exec mrpl_postgres psql -U admin -c "CREATE DATABASE sma_db;"

# LANGKAH 3: Restore dari backup pre-deployment
docker exec -i mrpl_postgres psql -U admin sma_db < \
  /backup/sma_db_[TIMESTAMP]_pre-v1.0.0.sql

# LANGKAH 4: Verifikasi integritas data
docker exec mrpl_postgres psql -U admin sma_db -c "\dt"

# LANGKAH 5: Restart backend dengan image lama
docker start sma_backend

echo "✅ Database rollback selesai."
```

### 3.4 Komunikasi Rollback

Setelah rollback berhasil, kirim notifikasi ke stakeholder dalam format berikut:

```
SUBJECT: [SMA-IT] SYSTEM DOWNTIME & ROLLBACK NOTICE — [Tanggal]

Tim yang terhormat,

Sistem Informasi Terpadu SMA mengalami masalah teknis pada deployment 
versi v1.0.0 pukul [waktu]. Tim IT telah melakukan rollback ke versi 
stabil sebelumnya.

- DOWNTIME: [mulai] s/d [selesai] (~X menit)
- STATUS SAAT INI: SISTEM NORMAL (v0.9.0)  
- ROOT CAUSE: [deskripsi singkat]
- TINDAK LANJUT: Investigasi & re-deploy terjadwal pada [tanggal]

Mohon maaf atas ketidaknyamanan ini.
Tim IT Sekolah
```

---

## BAGIAN 4: RUNBOOK OPERASIONAL

### 4.1 Panduan Troubleshooting

#### 🔴 MASALAH: Backend tidak dapat terhubung ke Database

**Gejala:** Log menampilkan `PrismaClientInitializationError` atau `ECONNREFUSED 5432`

```bash
# Diagnosis
docker compose ps                          # Cek apakah postgres berjalan
docker exec mrpl_postgres pg_isready       # Cek kesiapan DB
docker logs mrpl_backend --tail 50        # Lihat error terbaru

# Solusi
docker compose restart postgres           # Restart DB container
sleep 10
docker compose restart backend            # Restart backend setelah DB siap
```

---

#### 🔴 MASALAH: Redis tidak dapat dihubungi

**Gejala:** Log menampilkan `Redis connection error` atau `ECONNREFUSED 6379`

```bash
# Diagnosis  
docker exec mrpl_redis redis-cli ping     # Harusnya reply PONG
docker logs mrpl_redis --tail 20

# Solusi
docker compose restart redis
sleep 5
docker compose restart backend
```

---

#### 🔴 MASALAH: Semua user tidak dapat login (JWT Error)

**Gejala:** Response `401 Unauthorized` pada semua login request, log menampilkan `JsonWebTokenError`

```bash
# Diagnosis — cek apakah JWT_SECRET ada di environment
docker exec sma_backend printenv JWT_SECRET

# Solusi — pastikan .env.production lengkap, lalu restart
docker compose down
docker compose -f docker-compose.prod.yml up -d
```

---

#### 🟡 MASALAH: Response API lambat (> 2 detik)

**Gejala:** P95 response time melebihi SLO, monitoring alert terpicu

```bash
# Diagnosis — cek query lambat di PostgreSQL
docker exec mrpl_postgres psql -U admin sma_db -c \
  "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Diagnosis — cek penggunaan resource
docker stats --no-stream

# Solusi sementara
docker compose restart backend            # Bersihkan memory leak jika ada
```

---

#### 🟡 MASALAH: Disk hampir penuh (> 85%)

**Gejala:** Alert disk usage dari Grafana

```bash
# Cek penggunaan disk
df -h
du -sh /var/lib/docker/volumes/*

# Bersihkan log lama (simpan 7 hari terakhir)
find /var/log/sma/ -name "*.log" -mtime +7 -delete

# Bersihkan Docker artifacts
docker system prune -f
```

---

### 4.2 Metrik Dashboard yang Dipantau (Prometheus/Grafana)

> **Dashboard utama:** `http://monitoring.sma-internal.sch.id:3001`

| Panel | Metrik | Ambang Batas | Alert Level |
|-------|--------|-------------|-------------|
| **API Response Time P95** | `http_request_duration_seconds` (P95) | > 500ms (read), > 1.2s (write) | 🔴 Critical |
| **API Error Rate** | `http_requests_total{status=~"5.."}` / total | > 1% | 🔴 Critical |
| **CPU Usage** | `node_cpu_seconds_total` | > 80% | 🟡 Warning |
| **Memory Usage** | `node_memory_MemAvailable_bytes` | < 20% free | 🟡 Warning |
| **Disk Usage** | `node_filesystem_avail_bytes` | < 15% free | 🟡 Warning |
| **DB Connection Pool** | `prisma_client_queries_active` | > 45 dari 50 max | 🔴 Critical |
| **Redis Memory** | `redis_memory_used_bytes` | > 80% max memory | 🟡 Warning |
| **Active Users (CCU)** | `http_active_connections` | Informatif (monitor spike) | ℹ️ Info |
| **Uptime** | `up{job="sma-backend"}` | = 0 (down) | 🔴 Critical |

### 4.3 Log Monitoring

```bash
# Lihat log backend real-time (structured JSON via Winston)
docker logs sma_backend -f --tail 100

# Filter hanya log error
docker logs sma_backend 2>&1 | grep '"level":"error"'

# Filter log per user ID
docker logs sma_backend 2>&1 | grep '"userId":"[ID_TARGET]"'
```

---

## BAGIAN 5: POST-DEPLOYMENT MONITORING CHECKLIST

> Laksanakan checklist ini setelah deployment selesai dalam 3 interval waktu.

### ✅ T+15 Menit (Immediate Check)

| No | Item | Status |
|----|------|--------|
| 01 | Health check endpoint `/health` merespons HTTP 200 | ☐ |
| 02 | Halaman Login dapat diakses via browser | ☐ |
| 03 | Percobaan login dengan akun `superadmin` berhasil | ☐ |
| 04 | Dashboard Grafana menunjukkan semua service `UP` | ☐ |
| 05 | Tidak ada error `5xx` dalam log 15 menit pertama | ☐ |
| 06 | Response time API di bawah SLO (< 500ms read) | ☐ |

### ✅ T+1 Jam (Stability Check)

| No | Item | Status |
|----|------|--------|
| 07 | Error rate total < 1% dari semua request | ☐ |
| 08 | Memory usage backend < 80% | ☐ |
| 09 | Database connection pool tidak melebihi 80% kapasitas | ☐ |
| 10 | Redis berjalan normal, tidak ada `OOM` error | ☐ |
| 11 | Backup otomatis pertama berhasil dieksekusi (RPO check) | ☐ |
| 12 | Test manual: login, input nilai dummy, presensi — semua normal | ☐ |

### ✅ T+24 Jam (Full Day Check)

| No | Item | Status |
|----|------|--------|
| 13 | Uptime sistem 100% dalam 24 jam pertama | ☐ |
| 14 | Tidak ada spike memory / memory leak terdeteksi | ☐ |
| 15 | Log audit menunjukkan aktivitas normal (tidak ada anomali) | ☐ |
| 16 | Backup tersimpan minimal 24 snapshot (sesuai RPO 1 jam) | ☐ |
| 17 | Notifikasi go-live dikirim ke seluruh stakeholder | ☐ |
| 18 | Laporan Post-Deployment disusun dan dikirim ke Project Manager | ☐ |

---

## APPENDIX: Konfigurasi Environment Production

```
# .env.production (Template — nilai aktual JANGAN disimpan di repo)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://admin:[PASSWORD]@localhost:5432/sma_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=[MINIMUM 32 KARAKTER RANDOM]
JWT_EXPIRES_IN=8h
CORS_ORIGIN=https://sma-internal.sch.id
```

---
*Dokumen dihasilkan sesuai standar ISO/IEC 12207 & SAD IEEE 1016 — Fase 6B.*
