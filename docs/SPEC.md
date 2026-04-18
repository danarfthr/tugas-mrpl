# Dokumen Fase 2: Sistem Informasi Terpadu SMA

---

## 📄 DOKUMEN 1: PROJECT CHARTER

**1. Informasi Umum**
*   **Nama Proyek:** Pengembangan Sistem Informasi Terpadu SMA
*   **Jenis Sistem:** Web Application (Internal Sekolah)
*   **Teknologi Utama:** React (Frontend), Node.js (Backend), PostgreSQL (Database)

**2. Ruang Lingkup (Scope)**
*   **In-Scope:** 
    *   Sistem Autentikasi dasar (Username/Password).
    *   Manajemen Pengguna terpusat oleh Admin.
    *   Modul Manajemen Akademik (Input Nilai/Rapor).
    *   Modul Presensi/Kehadiran (Input Manual).
    *   Manajemen Hak Akses berbasis Role (Super Admin, Admin Sekolah, Guru Wali Kelas).
*   **Out-of-Scope:** 
    *   Portal/Dashboard mandiri untuk Siswa dan Orang Tua.
    *   Integrasi sistem eksternal (Dapodik, Payment Gateway, Mesin Absensi).
    *   Single Sign-On (SSO) & Multi-Factor Authentication (MFA).
    *   Modul Keuangan / SPP.

**3. Milestone Proyek (Estimasi High-Level)**
*   **M1 - Perancangan (Fase 3 & 4):** Penyelesaian Arsitektur, ERD, UI/UX, dan API Spec.
*   **M2 - Pengembangan Backend:** Setup DB, REST API Node.js, & RBAC Logic.
*   **M3 - Pengembangan Frontend:** Realisasi UI via React & Integrasi API.
*   **M4 - QA & Load Testing:** Pengujian SQA, fokus simulasi beban puncak (500 CCU).
*   **M5 - UAT & Go-Live (Fase 6):** Serah terima ke sekolah & Production Deployment.

**4. Manajemen Risiko**
*   **Risiko 1 (Performa):** Lonjakan trafik tinggi mendadak (spike load) di akhir/awal semester saat Guru Wali Kelas serentak menginput nilai. *(Mitigasi: Indexing DB yang tepat & efisiensi query bulk insert).*
*   **Risiko 2 (Human Error):** Karena input dilakukan secara terpusat dan manual, potensi kesalahan entri data tinggi. *(Mitigasi: Form validation & mekanisme review input UI).*

---

## 📄 DOKUMEN 2: SOFTWARE REQUIREMENTS SPECIFICATION (SRS Draft - IEEE 830)

**1. Pendahuluan**
Sistem ini merupakan platform internal tertutup untuk mendigitalisasi proses input nilai rapor akademik dan data kehadiran siswa. Sistem memfasilitasi 500 *concurrent users* yang didominasi oleh staf internal.

**2. Karakteristik Pengguna (RBAC)**
*   **Super Admin:** Memiliki akses penuh ke sistem termasuk manajemen konfigurasi aplikasi dan database 
*   **Admin Sekolah:** Mengelola data master (Data Siswa, Data Guru, Kelas) serta membuatkan akun bagi Guru Wali Kelas. Berhak menginput data akademik & presensi.
*   **Guru Wali Kelas:** Hanya dapat *login* untuk melakukan proses input nilai akademik rapor/kelas yang diampunya, serta mengisi data presensi kelas.

**3. Kebutuhan Fungsional (Functional Requirements - FR)**
*   **FR-01 (Autentikasi):** Sistem harus menyediakan form login menggunakan Akun dan Password.
*   **FR-02 (User Management):** Admin Sekolah dapat melakukan fungsi CRUD (Create, Read, Update, Delete) untuk pembuatan akun seluruh Guru.
*   **FR-03 (Manajemen Data Master):** Admin Sekolah harus dapat mengelola entitas master (Siswa, Kelas, Mata Pelajaran).
*   **FR-04 (Input Akademik):** Guru Wali Kelas dan Admin Sekolah dapat memasukkan nilai mata pelajaran per siswa dalam rentang waktu semester tertentu.
*   **FR-05 (Input Presensi):** Guru Wali Kelas dan Admin Sekolah dapat mencatatkan Alpha/Izin/Sakit untuk siswa secara periodik.

**4. Kebutuhan Keamanan (Security Requirements)**
Sistem belum mewajibkan enkripsi *Data at Rest* tingkat lanjut, namun standar OWASP tetap wajib diterapkan:
*   **SEC-01 (Password Security):** *Password* tidak boleh disimpan dalam bentuk *plaintext* (Wajib menggunakan *hashing* seperti `bcrypt` / `argon2` di Node.js).
*   **SEC-02 (Authorization):** Setiap *endpoint* API (terutama modul akademik) harus memvalidasi token hak akses (misal JWT) untuk memastikan pemanggil berwenang.
*   **SEC-03 (SQLi & XSS Prevention):** Penggunaan *Prepared Statements/ORM* wajib dilakukan di PostgreSQL. Input dari *form web* berbasis React wajib tersanitasi.

---

## 📄 DOKUMEN 3: SLA / SLO BASELINE

Dalam rangka memastikan kesiapan infrastruktur dan keandalan sistem agar lancar melayani 500 CCU, metrik berikut dijadikan target dasar:

**1. SLI / SLO (Service Level Objectives - Kinerja API)**
*   **P95 Response Time:** `< 500 ms` untuk operasi rutin (Navigasi, Lihat Data).
*   **P95 Write Response Time:** `< 1.2 detik` untuk operasi tulis massal (*Bulk Input/Upload* nilai oleh Guru dan Admin).
*   **Target Uptime (Ketersediaan):** `99.5%` per bulan (Setara dengan *downtime* wajar ~3.6 jam/bulan untuk rekapitulasi server atau pembaruan di waktu libur).
*   **Error Rate:** `< 1%` dari total pemanggilan HTTP/API Request.

**2. Disaster Recovery Strategy**
Sesuai *compliance* kebutuhan:
*   **RTO (Recovery Time Objective):** Maksimal **4 Jam**. Jika *server/instance* utama mati (contoh: OS *crash*), tim IT memiliki jangka waktu maksimal 4 jam untuk mengembalikan *service* agar web dapat diakses normal kembali.
*   **RPO (Recovery Point Objective):** Maksimal **1 Jam**. Toleransi kehilangan data adalah 1 jam. Strategi mitigasinya yaitu dengan *Automated Database Snapshot / Backup Cron Job* setiap 60 menit yang disimpan secara terpisah dari *server* utama.
