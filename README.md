# 🏫 Sistem Informasi Terpadu SMA

> Platform internal berbasis web untuk digitalisasi proses akademik SMA — meliputi manajemen nilai rapor, presensi siswa, dan kontrol akses berbasis peran (RBAC).

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![Express](https://img.shields.io/badge/Express-v5-000000?style=flat-square&logo=express)](https://expressjs.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)

---

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi & Konfigurasi](#instalasi--konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Role & Hak Akses (RBAC)](#role--hak-akses-rbac)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Pengujian](#pengujian)
- [SLA & SLO Baseline](#sla--slo-baseline)
- [Keamanan](#keamanan)
- [Dokumentasi](#dokumentasi)
- [Tech Debt](#tech-debt)
- [Kontribusi](#kontribusi)

---

## Tentang Proyek

Sistem Informasi Terpadu SMA adalah aplikasi web internal yang dirancang untuk mendigitalisasi proses administrasi akademik di lingkungan SMA. Sistem ini memfasilitasi hingga **500 concurrent users (CCU)** yang didominasi oleh staf internal sekolah.

**Ruang Lingkup (In-Scope):**
- ✅ Sistem autentikasi berbasis Username/Password
- ✅ Manajemen pengguna terpusat oleh Admin
- ✅ Modul manajemen akademik (Input Nilai/Rapor)
- ✅ Modul presensi/kehadiran (Input Manual)
- ✅ Manajemen hak akses berbasis Role (RBAC)

**Di Luar Ruang Lingkup (Out-of-Scope):**
- ❌ Portal mandiri untuk Siswa dan Orang Tua
- ❌ Integrasi sistem eksternal (Dapodik, Payment Gateway, Mesin Absensi)
- ❌ Single Sign-On (SSO) & Multi-Factor Authentication (MFA)
- ❌ Modul Keuangan / SPP

---

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Autentikasi JWT** | Login aman menggunakan JSON Web Token (JWT) dengan validasi server-side |
| **RBAC** | Kontrol akses berbasis peran: Super Admin, Admin Sekolah, Guru Wali Kelas |
| **Manajemen User** | CRUD akun pengguna oleh Admin Sekolah |
| **Data Master** | Pengelolaan Siswa, Kelas, dan Mata Pelajaran |
| **Input Nilai Rapor** | Input nilai akademik per siswa per semester |
| **Input Presensi** | Pencatatan kehadiran (Alpha/Izin/Sakit/Hadir) |
| **Rate Limiting** | Proteksi API dari penyalahgunaan (maks. 100 req/menit/IP) |
| **Structured Logging** | Audit trail lengkap via Winston |

---

## Arsitektur Sistem

Sistem dibangun menggunakan **3-Tier Architecture (Client-Server)**:

```
┌─────────────────────────────────────────┐
│         Presentation Tier               │
│   React 19 SPA  │  Axios  │  React      │
│   (Vite Build)  │  Client │  Router v7  │
└──────────────────────┬──────────────────┘
                       │ HTTPS / REST API
┌──────────────────────▼──────────────────┐
│         Application Tier                │
│  Express v5  │  Auth & RBAC  │  Joi     │
│  Middleware  │  Controllers  │  Prisma  │
└──────────────────────┬──────────────────┘
                       │ SQL
┌──────────────────────▼──────────────────┐
│           Data Tier                     │
│       PostgreSQL 15  │  Redis           │
│       (Primary DB)   │  (Cache/Rate)    │
└─────────────────────────────────────────┘
```

**Git Workflow:** GitFlow — `main` (Production) → `develop` (Staging) → `feature/*` / `hotfix/*`

**Environment Strategy:**
- `DEV` — Lokal developer, mock DB
- `STG` — Mirror Production, dummy data, load testing 500 CCU
- `PROD` — Live server, Private Subnet DB, automated backup (RPO 1 jam)

---

## Tech Stack

### Backend
| Package | Versi | Keterangan |
|---------|-------|------------|
| `express` | ^5.2.1 | Web framework |
| `@prisma/client` | ^7.7.0 | ORM (PostgreSQL) |
| `@prisma/adapter-pg` | ^7.7.0 | Prisma driver adapter |
| `jsonwebtoken` | ^9.0.3 | Autentikasi JWT |
| `bcrypt` | ^6.0.0 | Password hashing |
| `joi` | ^18.1.2 | Input validation & sanitization |
| `helmet` | ^8.1.0 | HTTP security headers |
| `cors` | ^2.8.6 | Cross-Origin Resource Sharing |
| `express-rate-limit` | ^8.3.2 | API rate limiting |
| `winston` | ^3.19.0 | Structured logging |
| `redis` | ^5.12.1 | Cache & idempotency store |

### Frontend
| Package | Versi | Keterangan |
|---------|-------|------------|
| `react` | ^19.2.4 | UI library |
| `react-dom` | ^19.2.4 | DOM renderer |
| `react-router-dom` | ^7.14.1 | Client-side routing |
| `axios` | ^1.15.0 | HTTP client |
| `vite` | ^8.0.4 | Build tool & dev server |

### Infrastruktur
| Komponen | Versi |
|----------|-------|
| PostgreSQL | 15-alpine |
| Redis | alpine |
| Docker Compose | 3.8 |

---

## Prasyarat

Pastikan tools berikut sudah terinstal di mesin Anda:

- **Node.js** v20 atau lebih baru — [Download](https://nodejs.org)
- **npm** v10 atau lebih baru (bundled bersama Node.js)
- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop)
- **Git** — [Download](https://git-scm.com)

---

## Instalasi & Konfigurasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd mrpl
```

### 2. Jalankan Infrastruktur (PostgreSQL & Redis)

```bash
docker-compose up -d
```

Pastikan kedua container berjalan:
```bash
docker ps
# mrpl_postgres  → port 5432
# mrpl_redis     → port 6379
```

### 3. Setup Backend

```bash
cd backend
npm install
```

Buat file environment untuk development:
```bash
cp .env.development .env
```

Jalankan migrasi database dan seeding awal:
```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Setup Frontend

```bash
cd ../frontend
npm install
```

---

## Menjalankan Aplikasi

### Mode Development

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server berjalan di http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# UI berjalan di http://localhost:5173
```

### Perintah Tambahan

```bash
# Backend - Jalankan test suite (Jest + Supertest)
cd backend && npm test

# Frontend - Build production bundle
cd frontend && npm run build

# Frontend - Preview hasil build
cd frontend && npm run preview

# Prisma - Buka Prisma Studio (DB GUI)
cd backend && npx prisma studio

# Hentikan semua container Docker
docker-compose down
```

---

## Struktur Proyek

```
mrpl/
├── backend/                    # Node.js REST API (Express)
│   ├── src/
│   │   ├── controllers/        # Business logic per domain
│   │   ├── middlewares/        # Auth, RBAC, error handler
│   │   ├── routes/             # Express router definitions
│   │   ├── utils/
│   │   │   ├── db.js           # Singleton PrismaClient
│   │   │   └── logger.js       # Winston structured logger
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # HTTP server entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Initial data seeder
│   ├── tests/                  # Jest + Supertest
│   ├── .env.development        # Environment (DEV)
│   ├── .env.staging            # Environment (STG)
│   ├── .env.production         # Environment (PROD)
│   └── package.json
│
├── frontend/                   # React 19 SPA (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Halaman per route
│   │   ├── hooks/              # Custom React hooks
│   │   └── main.jsx            # App entry point
│   └── package.json
│
├── database/                   # Migration & seed scripts (opsional)
├── docs/                       # Seluruh dokumentasi proyek
│   ├── SPEC.md                 # SRS & Project Charter (IEEE 830)
│   ├── software-arch.md        # SAD (IEEE 1016)
│   ├── database-design.md      # ERD & Data Dictionary
│   ├── api-spec.md             # OpenAPI 3.0 Specification
│   ├── use-case.md             # Use Case Specifications
│   ├── ui-design.md            # Design System & Wireframes
│   ├── test-plan.md            # Master Test Plan (IEEE 829)
│   ├── sqa-plan.md             # SQA Plan (IEEE 730)
│   ├── TECH_DEBT_REGISTER.md   # Tech Debt & Security Register
│   ├── fase6a-uat-script.md    # UAT Script
│   ├── fase6b-deployment-document.md  # Deployment Document & Runbook
│   └── fase6c-closure-and-paper.md    # Project Closure Report
├── docker-compose.yml          # PostgreSQL + Redis
└── README.md
```

---

## Role & Hak Akses (RBAC)

| Role | Kode | Hak Akses |
|------|------|-----------|
| **Super Admin** | `super_admin` | Akses penuh ke seluruh sistem termasuk konfigurasi & database |
| **Admin Sekolah** | `admin` | Manajemen data master (Siswa, Guru, Kelas), CRUD akun Guru, input akademik & presensi |
| **Guru Wali Kelas** | `guru` | Input nilai akademik & presensi untuk kelas yang diampu saja |

> Setiap endpoint API divalidasi oleh middleware `requireRole`. Akses ditolak secara *default* (*secure by default*).

---

## Environment Variables

Salin file `.env.development` ke `.env` untuk mode development. **Jangan commit file `.env` ke repository.**

```dotenv
# .env (example — development)
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://admin:adminpassword@localhost:5432/sma_db?schema=public"
JWT_SECRET="ganti-dengan-secret-yang-kuat-dan-panjang"
LOG_LEVEL="debug"
```

> ⚠️ **Penting:** Nilai `JWT_SECRET` di production **wajib** diganti dengan random string yang kuat (min. 32 karakter). Jangan gunakan nilai default.

| Variable | Deskripsi | Default (Dev) |
|----------|-----------|---------------|
| `PORT` | Port server backend | `3000` |
| `NODE_ENV` | Mode environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret key untuk signing JWT | — |
| `LOG_LEVEL` | Level logging Winston | `debug` |

---

## API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| `POST` | `/auth/login` | Public | Login & mendapatkan JWT token |
| `POST` | `/auth/logout` | Authenticated | Invalidate session |

### User Management
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| `GET` | `/users` | Admin | Daftar semua pengguna |
| `POST` | `/users` | Admin | Buat akun Guru baru |
| `PUT` | `/users/:id` | Admin | Update data pengguna |
| `DELETE` | `/users/:id` | Admin | Hapus akun pengguna |

### Data Master
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| `GET/POST` | `/students` | Admin | Manajemen data siswa |
| `GET/POST` | `/classes` | Admin | Manajemen data kelas |
| `GET/POST` | `/subjects` | Admin | Manajemen mata pelajaran |

### Akademik
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| `GET` | `/academic-records` | Admin, Guru | Lihat nilai akademik |
| `POST` | `/academic-records` | Admin, Guru | Input nilai (bulk support) |
| `PUT` | `/academic-records/:id` | Admin, Guru | Update nilai |

### Presensi
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| `GET` | `/attendance` | Admin, Guru | Lihat data presensi |
| `POST` | `/attendance` | Admin, Guru | Input presensi |

> Dokumentasi lengkap: [`docs/api-spec.md`](docs/api-spec.md)

---

## Database

**Engine:** PostgreSQL 15  
**ORM:** Prisma v7 dengan driver adapter `@prisma/adapter-pg`

### Entitas Utama

```
ROLES ──< USERS >──< ACADEMIC_RECORDS >── STUDENTS
                 >──< ATTENDANCE      >──< CLASSES
SUBJECTS ──────< ACADEMIC_RECORDS
```

| Tabel | Keterangan |
|-------|------------|
| `roles` | Daftar peran: Super Admin, Admin, Guru |
| `users` | Akun pengguna dengan password bcrypt-hash |
| `students` | Data siswa dengan NISN unik |
| `classes` | Data kelas dan tingkat |
| `subjects` | Mata pelajaran dengan kode unik |
| `academic_records` | Nilai akademik per siswa per semester |
| `attendance` | Data presensi harian siswa |

> Desain lengkap ERD & Data Dictionary: [`docs/database-design.md`](docs/database-design.md)

---

## Pengujian

Proyek menggunakan **Jest** + **Supertest** untuk pengujian backend.

```bash
cd backend
npm test
```

**Test Coverage Target (berdasarkan SQA Plan):**
- Unit Test: Controllers & Middlewares
- Integration Test: API Endpoints (Happy Path & Edge Case)
- Load Test: Simulasi 500 CCU (tool: k6 / Artillery)

> Test Plan lengkap: [`docs/test-plan.md`](docs/test-plan.md)  
> SQA Plan: [`docs/sqa-plan.md`](docs/sqa-plan.md)

---

## SLA & SLO Baseline

| Metrik | Target |
|--------|--------|
| **P95 Response Time (Read)** | < 500 ms |
| **P95 Response Time (Write/Bulk)** | < 1.200 ms |
| **Uptime** | 99,5% / bulan |
| **Error Rate** | < 1% dari total HTTP request |
| **RTO** (Recovery Time Objective) | Maks. **4 Jam** |
| **RPO** (Recovery Point Objective) | Maks. **1 Jam** (backup setiap 60 menit) |

---

## Keamanan

Sistem dirancang mengikuti prinsip **Security by Design** dan **OWASP Top 10**:

| Kategori | Implementasi |
|----------|-------------|
| **Broken Access Control** | Middleware `requireRole` — *deny by default* |
| **Cryptographic Failures** | Password di-hash dengan `bcrypt`. HTTPS/TLS 1.2+ di production |
| **Injection** | Prisma ORM (PreparedStatement) + sanitasi `Joi` |
| **Security Misconfiguration** | `helmet` (HTTP headers) + `cors` (origin restriction) |
| **Information Disclosure** | Stack trace tersembunyi di mode `production` |

**STRIDE Threat Model** tersedia di: [`docs/software-arch.md`](docs/software-arch.md)

> ⚠️ **Tidak ada** credential, API key, atau secret yang di-*hardcode* dalam kode sumber. Semua konfigurasi sensitif dibaca dari environment variable (`.env`).

---

## Dokumentasi

Seluruh dokumen proyek tersedia di folder [`docs/`](docs/):

| Dokumen | Standar | File |
|---------|---------|------|
| Software Requirements Specification | IEEE 830 | [`SPEC.md`](docs/SPEC.md) |
| Software Architecture Document | IEEE 1016 | [`software-arch.md`](docs/software-arch.md) |
| Database Design & ERD | — | [`database-design.md`](docs/database-design.md) |
| Use Case Specification | — | [`use-case.md`](docs/use-case.md) |
| UI Design System & Wireframes | WCAG 2.1 | [`ui-design.md`](docs/ui-design.md) |
| API Specification | OpenAPI 3.0 | [`api-spec.md`](docs/api-spec.md) |
| Master Test Plan | IEEE 829 | [`test-plan.md`](docs/test-plan.md) |
| SQA Plan | IEEE 730 | [`sqa-plan.md`](docs/sqa-plan.md) |
| Tech Debt & Security Register | OWASP/SOLID | [`TECH_DEBT_REGISTER.md`](docs/TECH_DEBT_REGISTER.md) |
| UAT Script | — | [`fase6a-uat-script.md`](docs/fase6a-uat-script.md) |
| Deployment Document & Runbook | — | [`fase6b-deployment-document.md`](docs/fase6b-deployment-document.md) |
| Project Closure Report | APA 7th Ed. | [`fase6c-closure-and-paper.md`](docs/fase6c-closure-and-paper.md) |

---

## Tech Debt

Daftar hutang teknis yang telah teridentifikasi dan sedang dalam perbaikan:

| Komponen | Isu | Prioritas |
|----------|-----|-----------|
| **Testing** | Belum ada unit/integration test (Jest/Supertest) | 🔴 High |
| **Frontend** | Antarmuka React belum sepenuhnya diimplementasi | 🔴 High |
| **Prisma Instance** | Multiple instantiation `PrismaClient` — risiko TCP exhaustion | 🔴 High |
| **Idempotency** | Redis belum aktif untuk validasi `x-idempotency-key` | 🟡 Medium |

> Detail lengkap: [`docs/TECH_DEBT_REGISTER.md`](docs/TECH_DEBT_REGISTER.md)

---

## Kontribusi

Proyek ini mengikuti **GitFlow** untuk manajemen branch:

1. Fork repository ini
2. Buat branch fitur dari `develop`:
   ```bash
   git checkout -b feature/nama-fitur develop
   ```
3. Commit dengan pesan yang jelas mengikuti [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(auth): tambah validasi JWT expiry"
   ```
4. Push dan buat Pull Request ke branch `develop`

**Branch Utama:**
- `main` — Production-ready, dilindungi. Hanya merge dari `develop` via PR.
- `develop` — Integration branch. Target PR dari `feature/*`.
- `feature/<name>` — Turunan dari `develop`.
- `hotfix/<name>` — Turunan dari `main` untuk bugfix kritikal.

---

<p align="center">
  Dibuat dengan ❤️ · Sistem Informasi Terpadu SMA · 2026
</p>
