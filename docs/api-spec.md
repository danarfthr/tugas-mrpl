# Dokumen Fase 4B: Perancangan API Spesifikasi

## 1. Strategi Keamanan & Kebijakan API (API Policy)

**Syarat Keamanan per Endpoint:**
- **Authentication:** Menggunakan token JSON Web Token (JWT) yang di-pass melalui header `Authorization: Bearer <token>`.
- **RBAC (Role-Based Access Control):** 
  - Token akan memuat claims `role` yang berisi hak akses (`superadmin`, `admin`, `guru`).
  - Middleware pada endpoint akan memfilter izin akses sesuai peran.
- **Rate Limiting:**
  - Login/Auth endpoints: Maksimal 5 percobaan gagal per menit per IP.
  - Endpoints Read (GET): Maksimal 100 req/menit per User ID.
  - Endpoints Write/Bulk (POST/PUT): Maksimal 30 req/menit per User ID, untuk menghindari abuse saat bulk update nilai/presensi.
- **Sanitasi Data:** Semua route POST/PUT akan divalidasi dan di-sanitize memastikan menghindari input SQLi berbasis JSON (*Validation/Joi layer* sebelum controller).

**Strategi Versioning & Deprecation Policy:**
- **Gaya Versioning:** URL Path Versioning (misalnya `/api/v1/...`). Memungkinkan kompatibilitas ke belakang (Backward Compatibility).
- **Deprecation Policy:** Saat v1 akan dipensiunkan (sunset):
  1. API v1 akan mengembalikan Response Header `Sunset: <tanggal-kadaluwarsa>`.
  2. Akan ada Header `Deprecation: <boolean> //atau// <url-dokumentasi-baru>` di v1.
  3. API v1 akan di-support minimal 6 bulan setelah v2 rilis sebelum dimatikan (end-of-life).

---

## 2. Dokumentasi API (OpenAPI 3.0) - Ekstrak Utama

```yaml
openapi: 3.0.0
info:
  title: API Sistem Informasi Terpadu SMA
  description: Dokumentasi API untuk manajemen akademik, presensi, dan user (Internal Sekolah).
  version: "1.0"
servers:
  - url: https://api.internal.sma.edu/api/v1
    description: Production Server
  - url: http://localhost:3000/api/v1
    description: Local Development Server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    NilaiSiswa:
      type: object
      required: [siswa_id, mata_pelajaran_id, nilai_akhir]
      properties:
        siswa_id:
          type: string
          format: uuid
        mata_pelajaran_id:
          type: string
          format: uuid
        nilai_akhir:
          type: number
          minimum: 0
          maximum: 100
          
    PresensiSiswa:
      type: object
      required: [siswa_id, status]
      properties:
        siswa_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [Hadir, Izin, Sakit, Alpha]
        keterangan:
          type: string

security:
  - bearerAuth: []

paths:
  /auth/login:
    post:
      summary: Login User untuk mendapatkan JWT Token
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [username, password]
              properties:
                username:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login sukses, mengembalikan token.
        '401':
          description: Kredensial tidak valid.

  /akademik/nilai:
    post:
      summary: Input/Update Bulk Nilai Rapor oleh Guru/Admin
      description: Endpoint untuk memasukkan data nilai. Maksimal rate-limit 30 r/m.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/NilaiSiswa'
      responses:
        '201':
          description: Data berhasil disimpan
        '400':
          description: Validasi input data gagal
        '403':
          description: Akses Ditolak (RBAC Mismatch)

  /akademik/presensi:
    post:
      summary: Input Data Presensi Siswa
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/PresensiSiswa'
      responses:
        '201':
          description: Presensi berhasil dicatat
```
