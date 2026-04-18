# Dokumen Fase 6A: UAT Script — Sistem Informasi Terpadu SMA
**Nomor Dokumen:** UAT-SMA-v1.0  
**Standar Referensi:** IEEE 829, SQA Gate 4  
**Tanggal Rilis:** 18 April 2026  
**Versi Sistem:** v1.0.0  

---

## 1. Tujuan & Ruang Lingkup

Dokumen ini mendefinisikan skenario pengujian akhir yang akan dilaksanakan oleh **pengguna akhir (end-user)** sebagai bukti formal bahwa sistem memenuhi kebutuhan bisnis yang telah disepakati dalam SRS (IEEE 830). UAT ini merupakan **Gate 4** dalam SQA Plan sebelum go-live ke Production.

### 1.1 Ruang Lingkup Pengujian

| Modul | Use Case | Termasuk |
|-------|----------|----------|
| Autentikasi | UC-01 | ✅ |
| User Management | UC-02 | ✅ |
| Manajemen Data Master | UC-03 | ✅ |
| Input Akademik (Nilai) | UC-04 | ✅ |
| Input Presensi | UC-05 | ✅ |
| Security / Abuse Cases | SUC-01, SUC-02, SUC-03 | ✅ |
| Integrasi Sistem Eksternal (Dapodik, SSO) | — | ❌ Out-of-Scope |

---

## 2. Peserta UAT

| Role | Nama Peserta | Unit/Jabatan | Akun UAT |
|------|-------------|--------------|----------|
| Super Admin | *(Diisi oleh IT Sekolah)* | TU IT | `superadmin` |
| Admin Sekolah | *(Diisi oleh TU)* | Tata Usaha | `admin_sekolah` |
| Guru Wali Kelas (1) | *(Diisi oleh Guru)* | Wali Kelas X-A | `guru_budi` |
| Guru Wali Kelas (2) | *(Diisi oleh Guru)* | Wali Kelas X-B | `guru_siti` |
| Observer / SQA | *(Engineer/QA)* | Tim Pengembang | — |

> **Catatan:** Seluruh pengujian dilakukan pada environment **Staging (STG)** dengan data *dummy* sebelum produksi. URL Staging: `http://staging.sma-internal.sch.id`

---

## 3. Persiapan Sebelum UAT

### 3.1 Pre-condition Global
- [ ] Server Staging aktif dan dapat diakses oleh peserta
- [ ] Database Staging telah di-seed dengan data uji (siswa, kelas, mata pelajaran)
- [ ] Akun-akun peserta UAT telah dibuat dan diverifikasi dapat login
- [ ] Browser yang digunakan: Google Chrome versi terbaru (disarankan)
- [ ] Formulir pencatatan hasil UAT telah dibagikan ke peserta

---

## 4. Skenario UAT

### 📋 SKENARIO UAT-01: Login (Autentikasi)
**Referensi FR:** FR-01 | **Use Case:** UC-01  
**Role yang Diuji:** Semua Role

| Langkah | Aksi yang Dilakukan Pengguna | Hasil yang Diharapkan | Status | Catatan |
|---------|------------------------------|----------------------|--------|---------|
| 1 | Buka URL Sistem di browser | Halaman Login tampil dengan form username & password | ☐ Pass / ☐ Fail | |
| 2 | Masukkan username valid dan password valid, klik "Login" | Berhasil masuk ke Dashboard sesuai role masing-masing | ☐ Pass / ☐ Fail | |
| 3 | Logout dari sistem, kemudian coba akses URL dashboard langsung | Sistem redirect ke halaman Login (session tidak aktif) | ☐ Pass / ☐ Fail | |
| 4 | Masukkan password yang **salah** 3 kali berturut-turut | Sistem menampilkan notifikasi peringatan (error message jelas) | ☐ Pass / ☐ Fail | |
| 5 | Coba login menggunakan akun dengan **username kosong** | Sistem menolak & menampilkan validasi "Username wajib diisi" | ☐ Pass / ☐ Fail | |

**Kriteria Kelulusan Skenario:** Semua 5 langkah bernilai **Pass**.

---

### 📋 SKENARIO UAT-02: User Management (CRUD Guru)
**Referensi FR:** FR-02 | **Use Case:** UC-02  
**Role yang Diuji:** Admin Sekolah, Super Admin

| Langkah | Aksi yang Dilakukan Pengguna | Hasil yang Diharapkan | Status | Catatan |
|---------|------------------------------|----------------------|--------|---------|
| 1 | Login sebagai Admin Sekolah, navigasi ke menu "Manajemen Pengguna" | Daftar akun guru tampil dalam bentuk tabel | ☐ Pass / ☐ Fail | |
| 2 | Klik tombol "Tambah Guru Baru", isi form (Nama, Username, Password, Role), klik "Simpan" | Akun guru baru berhasil dibuat & muncul di daftar | ☐ Pass / ☐ Fail | |
| 3 | Klik ikon "Edit" pada salah satu akun guru, ubah Nama Lengkap, klik "Simpan" | Data guru terupdate di daftar | ☐ Pass / ☐ Fail | |
| 4 | Klik ikon "Hapus" pada akun guru uji, konfirmasi dialog penghapusan | Akun guru terhapus dari daftar | ☐ Pass / ☐ Fail | |
| 5 | Login menggunakan akun **Guru Wali Kelas**, coba akses URL menu "Manajemen Pengguna" secara langsung | Sistem menampilkan halaman **403 Forbidden** / redirect ke dashboard | ☐ Pass / ☐ Fail | |

**Kriteria Kelulusan Skenario:** Semua 5 langkah bernilai **Pass**.

---

### 📋 SKENARIO UAT-03: Manajemen Data Master
**Referensi FR:** FR-03 | **Use Case:** UC-03  
**Role yang Diuji:** Admin Sekolah

| Langkah | Aksi yang Dilakukan Pengguna | Hasil yang Diharapkan | Status | Catatan |
|---------|------------------------------|----------------------|--------|---------|
| 1 | Navigasi ke menu "Data Siswa", lihat daftar siswa | Daftar siswa tampil dengan informasi dasar (nama, kelas, NIS) | ☐ Pass / ☐ Fail | |
| 2 | Tambah data siswa baru (Nama, NIS, Kelas), klik "Simpan" | Siswa baru muncul di daftar Data Siswa | ☐ Pass / ☐ Fail | |
| 3 | Navigasi ke menu "Data Kelas", tambah kelas baru (misal: "XI-A") | Kelas baru berhasil ditambahkan | ☐ Pass / ☐ Fail | |
| 4 | Navigasi ke menu "Mata Pelajaran", tambah mata pelajaran baru (misal: "Fisika") | Mata pelajaran berhasil ditambahkan | ☐ Pass / ☐ Fail | |
| 5 | Hapus data siswa yang sebelumnya ditambahkan | Siswa berhasil terhapus dari daftar | ☐ Pass / ☐ Fail | |

**Kriteria Kelulusan Skenario:** Minimal 4 dari 5 langkah bernilai **Pass**, dengan langkah 1 & 2 wajib **Pass**.

---

### 📋 SKENARIO UAT-04: Input Akademik (Nilai Rapor)
**Referensi FR:** FR-04 | **Use Case:** UC-04  
**Role yang Diuji:** Guru Wali Kelas, Admin Sekolah

| Langkah | Aksi yang Dilakukan Pengguna | Hasil yang Diharapkan | Status | Catatan |
|---------|------------------------------|----------------------|--------|---------|
| 1 | Login sebagai Guru Wali Kelas, navigasi ke menu "Input Nilai" | Daftar siswa di kelas yang diampu tampil | ☐ Pass / ☐ Fail | |
| 2 | Pilih Semester, pilih Mata Pelajaran, isi nilai untuk 3 siswa, klik "Simpan" | Notifikasi "Nilai berhasil disimpan" muncul | ☐ Pass / ☐ Fail | |
| 3 | Reopen form input nilai, verifikasi bahwa nilai yang baru disimpan tampil dengan benar | Nilai tersimpan dan ditampilkan sesuai input | ☐ Pass / ☐ Fail | |
| 4 | Coba input nilai di luar rentang valid (misal: angka 150 atau teks "abc") | Sistem menolak dengan pesan validasi (misal: "Nilai harus antara 0-100") | ☐ Pass / ☐ Fail | |
| 5 | Login sebagai Guru Wali Kelas ke-2, coba akses & edit nilai kelas yang **bukan** kelasnya | Sistem menolak akses (403) atau data kelas lain tidak tersedia | ☐ Pass / ☐ Fail | |

**Kriteria Kelulusan Skenario:** Semua 5 langkah bernilai **Pass**. Langkah 4 (validasi input) dan 5 (RBAC) bersifat **wajib**.

---

### 📋 SKENARIO UAT-05: Input Presensi
**Referensi FR:** FR-05 | **Use Case:** UC-05  
**Role yang Diuji:** Guru Wali Kelas, Admin Sekolah

| Langkah | Aksi yang Dilakukan Pengguna | Hasil yang Diharapkan | Status | Catatan |
|---------|------------------------------|----------------------|--------|---------|
| 1 | Login sebagai Guru Wali Kelas, navigasi ke menu "Presensi" | Form input presensi harian tampil dengan daftar siswa kelas | ☐ Pass / ☐ Fail | |
| 2 | Pilih tanggal hari ini, tandai 2 siswa "Sakit", 1 siswa "Izin", 1 siswa "Alpha", klik "Simpan" | Notifikasi "Presensi berhasil disimpan" muncul | ☐ Pass / ☐ Fail | |
| 3 | Coba mengisi presensi untuk **tanggal yang sama lagi** (duplikat) | Sistem memberi peringatan "Presensi untuk tanggal ini sudah ada" atau data ter-update | ☐ Pass / ☐ Fail | |
| 4 | Lihat rekap presensi untuk periode tertentu | Rekap kehadiran (jumlah S/I/A) tampil dengan benar | ☐ Pass / ☐ Fail | |

**Kriteria Kelulusan Skenario:** Semua 4 langkah bernilai **Pass**.

---

### 📋 SKENARIO UAT-06: Security & Abuse Cases
**Referensi:** SUC-01, SUC-02, SUC-03  
**Role yang Diuji:** Dilakukan oleh QA/Observer

| Langkah | Aksi yang Dilakukan | Hasil yang Diharapkan | Status | Catatan |
|---------|---------------------|----------------------|--------|---------|
| 1 | Coba input field nama siswa dengan payload XSS: `<script>alert('xss')</script>` | Dialog alert TIDAK muncul; teks disanitasi / ditolak | ☐ Pass / ☐ Fail | |
| 2 | Panggil API endpoint `/api/v1/academic/grades` langsung via browser/Postman **tanpa** JWT token | Response: HTTP 401 Unauthorized | ☐ Pass / ☐ Fail | |
| 3 | Panggil API endpoint user management menggunakan JWT milik **Guru Wali Kelas** | Response: HTTP 403 Forbidden | ☐ Pass / ☐ Fail | |
| 4 | Simulasikan 6 kali login gagal berturut-turut dari satu IP | Sistem memberikan response error yang konsisten (rate limit / delay) | ☐ Pass / ☐ Fail | |

**Kriteria Kelulusan Skenario:** Semua 4 langkah bernilai **Pass**. *Ini adalah skenario non-negosiabel (blocker).*

---

## 5. Kriteria Kelulusan UAT Global

> **Gate 4 — SQA Plan telah dipenuhi jika seluruh kondisi berikut terpenuhi:**

| Kriteria | Target | Metode Verifikasi |
|----------|--------|-------------------|
| Tidak ada defect **S1 (Blocker/Critical)** yang open | 0 defect S1 open | Issue Tracker |
| Tidak ada defect **S2 (High)** yang open | 0 defect S2 open | Issue Tracker |
| Semua 5 Skenario FR (UAT-01 s/d UAT-05) lulus | 100% Pass | UAT Sign-Off Sheet |
| Semua 4 security abuse cases (UAT-06) lulus | 100% Pass | QA Observer Report |
| Load Test (500 CCU) sesuai SLO | P95 Read <500ms, Write <1.2s | k6 / JMeter Report |
| Semua peserta UAT menandatangani Sign-Off | ≥ 3 dari 4 peserta | Formulir Sign-Off |

---

## 6. UAT Sign-Off Sheet

> Dengan menandatangani dokumen ini, peserta menyatakan bahwa sistem telah diuji secara memadai dan **disetujui untuk dilanjutkan ke fase Production Deployment**.

| Nama Peserta | Role | Hasil UAT | Tanda Tangan | Tanggal |
|-------------|------|-----------|-------------|---------|
| | Super Admin | ☐ Disetujui / ☐ Ditolak | | |
| | Admin Sekolah | ☐ Disetujui / ☐ Ditolak | | |
| | Guru Wali Kelas | ☐ Disetujui / ☐ Ditolak | | |
| | SQA Engineer | ☐ Disetujui / ☐ Ditolak | | |

---

## 7. Prosedur Eskalasi Defect

Jika ditemukan defect selama UAT:

1. **Catat defect** di Issue Tracker dengan: *Steps to reproduce*, *Expected vs Actual*, *Screenshot/Log*.
2. **Klasifikasikan severity** sesuai SQA Plan (S1–S4).
3. **Hentikan UAT** jika defect S1 ditemukan; lanjutkan skenario lain untuk defect S2/S3.
4. Defect S1/S2 **wajib diselesaikan** sebelum UAT dinyatakan lulus (SLA: S1 < 4 jam, S2 < 24 jam).
5. **Retest** skenario yang terdampak setelah fix diterapkan di Staging.

---
*Dokumen dihasilkan sesuai standar IEEE 829 — Fase 6A.*
