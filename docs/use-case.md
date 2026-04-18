# Use Case Specification: Sistem Informasi Terpadu SMA

## 1. Daftar Aktor
1. **Super Admin**: Memiliki akses penuh ke sistem termasuk manajemen konfigurasi aplikasi dan database.
2. **Admin Sekolah**: Mengelola data master serta membuatkan akun bagi Guru Wali Kelas. Berhak menginput data akademik & presensi.
3. **Guru Wali Kelas**: Mengakses sistem untuk melakukan proses input nilai akademik rapor/kelas yang diampunya, serta mengisi data presensi kelas.

## 2. Use Case Specification

### 2.1. UC-01: Login (Autentikasi)
* **Aktor**: Super Admin, Admin Sekolah, Guru Wali Kelas
* **Deskripsi**: Aktor masuk ke dalam sistem menggunakan kredensial (username/password).
* **Pre-condition**: Aktor belum login dan berada di halaman login.
* **Post-condition**: Aktor berhasil masuk dan mendapatkan token sesi (JWT).

### 2.2. UC-02: User Management (CRUD)
* **Aktor**: Admin Sekolah (dan Super Admin)
* **Deskripsi**: Aktor mengelola akun Guru Wali Kelas.
* **Pre-condition**: Aktor sudah login dengan role Admin.
* **Post-condition**: Data akun pengguna diperbarui di sistem.

### 2.3. UC-03: Manajemen Data Master
* **Aktor**: Admin Sekolah
* **Deskripsi**: Aktor melakukan CRUD pada entitas master seperti Data Siswa, Kelas, dan Mata Pelajaran.
* **Pre-condition**: Aktor sudah memiliki akses Admin.
* **Post-condition**: Master data tersimpan dengan benar di database.

### 2.4. UC-04: Input Akademik (Nilai)
* **Aktor**: Guru Wali Kelas, Admin Sekolah
* **Deskripsi**: Memasukkan nilai mata pelajaran per siswa dalam rentang waktu semester.
* **Pre-condition**: Aktor memiliki akses ke kelas atau mata pelajaran terkait.
* **Post-condition**: Data nilai siswa tersimpan di sistem.

### 2.5. UC-05: Input Presensi
* **Aktor**: Guru Wali Kelas, Admin Sekolah
* **Deskripsi**: Mencatatkan status kehadiran (Alpha/Izin/Sakit) siswa secara periodik.
* **Pre-condition**: Aktor mengakses kelas tertentu.
* **Post-condition**: Rekap kehadiran tersimpan.

## 3. Security Use Cases (Abuse Cases)

### 3.1. SUC-01: Pencegahan Brute Force Login
* **Risiko**: Serangan brute force pada halaman login.
* **Aksi Sistem**: Memblokir IP atau akun setelah 5 kali percobaan gagal (Rate Limiting).

### 3.2. SUC-02: Mencegah Injeksi dan XSS (Malicious Input)
* **Risiko**: Pengguna memasukkan payload XSS pada input nama siswa atau nilai.
* **Aksi Sistem**: Melakukan sanitasi input dan prepared statement untuk query DB.

### 3.3. SUC-03: Akses Tanpa Otorisasi (Bypass RBAC)
* **Risiko**: Guru Wali Kelas mencoba mengakses endpoint User Management.
* **Aksi Sistem**: API memvalidasi role pada JWT dan mengembalikan HTTP 403 Forbidden.

## 4. Use Case Diagram (Interactive SVG)

```xml
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <style>
    .actor { fill: #333; cursor: pointer; transition: transform 0.2s; }
    .actor:hover { transform: scale(1.1); fill: #007bff; }
    .usecase { fill: #f8f9fa; stroke: #333; stroke-width: 2; rx: 30; cursor: pointer; transition: fill 0.2s; }
    .usecase:hover { fill: #e9ecef; stroke: #007bff; }
    .text { font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; pointer-events: none; }
    .title { font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; }
    .line { stroke: #666; stroke-width: 2; fill: none; }
    .system-boundary { fill: none; stroke: #333; stroke-width: 2; stroke-dasharray: 5,5; }
  </style>

  <text x="400" y="30" class="title" text-anchor="middle">Sistem Informasi Terpadu SMA - Use Case Diagram</text>

  <!-- System Boundary -->
  <rect x="250" y="60" width="300" height="500" class="system-boundary" />
  <text x="400" y="80" class="text" font-weight="bold">Sistem</text>

  <!-- Actors -->
  <!-- Admin Sekolah -->
  <g class="actor" transform="translate(100, 150)">
    <circle cx="0" cy="-20" r="15" />
    <line x1="0" y1="-5" x2="0" y2="30" class="line" />
    <line x1="-20" y1="10" x2="20" y2="10" class="line" />
    <line x1="0" y1="30" x2="-15" y2="60" class="line" />
    <line x1="0" y1="30" x2="15" y2="60" class="line" />
    <text x="0" y="80" class="text" font-weight="bold">Admin Sekolah</text>
  </g>

  <!-- Guru Wali Kelas -->
  <g class="actor" transform="translate(100, 400)">
    <circle cx="0" cy="-20" r="15" />
    <line x1="0" y1="-5" x2="0" y2="30" class="line" />
    <line x1="-20" y1="10" x2="20" y2="10" class="line" />
    <line x1="0" y1="30" x2="-15" y2="60" class="line" />
    <line x1="0" y1="30" x2="15" y2="60" class="line" />
    <text x="0" y="80" class="text" font-weight="bold">Guru Wali Kelas</text>
  </g>

  <!-- Super Admin -->
  <g class="actor" transform="translate(700, 250)">
    <circle cx="0" cy="-20" r="15" />
    <line x1="0" y1="-5" x2="0" y2="30" class="line" />
    <line x1="-20" y1="10" x2="20" y2="10" class="line" />
    <line x1="0" y1="30" x2="-15" y2="60" class="line" />
    <line x1="0" y1="30" x2="15" y2="60" class="line" />
    <text x="0" y="80" class="text" font-weight="bold">Super Admin</text>
  </g>

  <!-- Use Cases -->
  <g transform="translate(400, 120)">
    <rect x="-100" y="-20" width="200" height="40" class="usecase" />
    <text x="0" y="5" class="text">UC-01: Login</text>
  </g>
  <g transform="translate(400, 200)">
    <rect x="-100" y="-20" width="200" height="40" class="usecase" />
    <text x="0" y="5" class="text">UC-02: User Management</text>
  </g>
  <g transform="translate(400, 280)">
    <rect x="-100" y="-20" width="200" height="40" class="usecase" />
    <text x="0" y="5" class="text">UC-03: Manage Master Data</text>
  </g>
  <g transform="translate(400, 360)">
    <rect x="-100" y="-20" width="200" height="40" class="usecase" />
    <text x="0" y="5" class="text">UC-04: Input Akademik</text>
  </g>
  <g transform="translate(400, 440)">
    <rect x="-100" y="-20" width="200" height="40" class="usecase" />
    <text x="0" y="5" class="text">UC-05: Input Presensi</text>
  </g>

  <!-- Connections -->
  <!-- Admin Sekolah -->
  <line x1="120" y1="150" x2="300" y2="120" class="line" />
  <line x1="120" y1="150" x2="300" y2="200" class="line" />
  <line x1="120" y1="150" x2="300" y2="280" class="line" />
  <line x1="120" y1="150" x2="300" y2="360" class="line" />
  <line x1="120" y1="150" x2="300" y2="440" class="line" />

  <!-- Guru Wali Kelas -->
  <line x1="120" y1="400" x2="300" y2="120" class="line" />
  <line x1="120" y1="400" x2="300" y2="360" class="line" />
  <line x1="120" y1="400" x2="300" y2="440" class="line" />

  <!-- Super Admin -->
  <line x1="680" y1="250" x2="500" y2="120" class="line" />
  <line x1="680" y1="250" x2="500" y2="200" class="line" />
  <line x1="680" y1="250" x2="500" y2="280" class="line" />
</svg>
```
