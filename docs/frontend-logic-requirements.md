# Frontend Logic Requirements (FRD)
**Dihasilkan Berdasarkan: IEEE 830 & UI Design Contract (Fase 4A)**

## 1. Pendahuluan
Dokumen ini menspesifikasikan kebutuhan logika antarmuka (Frontend Logic) membangun *end-to-end* aplikasi Single Page Application (SPA) reaktif berbasis ekosistem React.js dan Vite. 

## 2. Kebutuhan Logika Fungsional (Functional Logic Requirements)
1. **FLR-01 (Autentikasi & Penyimpanan Sesi):**
   - Sistem wajib menangani formulir login (POST `/api/v1/auth/login`).
   - Token JWT dan data *user role* (Super Admin / Admin / Guru) akan disimpan dalam `sessionStorage` sebagai mitigasi XSS dasar dibandingkan penyimpanan di *cookie* (tanpa HttpOnly).
   - *Logout* memicu penghapusan sesi lokal dan pemanggilan endpoint `POST /api/v1/auth/logout`.
2. **FLR-02 (Routing Berbasis Peran - RBAC):**
   - Sistem wajib memakai `React Router v6`.
   - Melindungi rute aplikasi (Dashboard) di balik komponen `<ProtectedRoute>`.
   - Mengalihkan pengguna yang tidak dikenali fungsinya ke halaman _Unauthorized_ atau kembali ke form login.
3. **FLR-03 (Manajemen Input Nilai Akademik):**
   - Halaman `Input Nilai` (Guru) harus merender form tabular dinamis.
   - Mengendalikan *State* nilai yang divalidasi ke skala 0-100.
   - Panggilan POST massal ke `/api/v1/akademik/nilai` di-*attach* header `x-idempotency-key` berupa UUID atau *Timestamp* unik.

## 3. Kebutuhan Estetika (Web Application Development Specs)
1. **AE-01 (Kepatuhan Desain Kontrak & Aksesibilitas):**
   - Mematuhi spek warna `ui-design.md` tanpa Framework CSS tambahan (*No Tailwind*).
   - Penggunaan *Vanilla CSS* pada file module atau global `index.css`.
2. **AE-02 (Wow Factor - Premium Feel):**
   - Elemen interaktif memakai *Micro-animations* saat *hover* (contoh efek glassmorphism, gradient dinamis, drop shadow halus).
   - Menggunakan Google Fonts *Inter* untuk tata tipografi yang modern.

## 4. Persetujuan
Berdasarkan aturan utama `[DOKUMENTASI FIRST]`, dokumen ini memastikan persyaratan *logic* dapat dilacak sebelum barisan kode direalisasikan.
