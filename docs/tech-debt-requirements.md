# Software Requirements Specification (SRS) - Tech Debt Resolution
**Dihasilkan Berdasarkan: IEEE 830 & ISO/IEC 25010**

## 1. Pendahuluan
Dokumen ini mendefinisikan kebutuhan sistem untuk mengatasi *Technical Debt* yang tercatat di dalam `docs/TECH_DEBT_REGISTER.md`. Resolusi dari hutang teknis ini akan meningkatkan aspek *Security*, *Maintainability*, dan *Reliability* dari Integrated School Information System.

## 2. Kebutuhan Fungsional (Functional Requirements)
1. **FR-TD-01 (Sistem Logout & Token Blacklist):**
   - Sistem WAJIB menyediakan endpoint `/auth/logout` untuk melakukan penarikan balik eksekusi token (Revoked tokens).
   - Sistem WAJIB menggunakan Redis atau database yang relevan untuk menyimpan daftar blacklisted token dan menolak akses jika token ditemukan dalam daftar tersebut (`authMiddleware.js`).
2. **FR-TD-02 (Idempotency dengan Redis):**
   - Endpoint transaksi krusial (seperti proses _bulk_ nilai) WAJIB menggunakan `x-idempotency-key` di _header_.
   - Sistem WAJIB memvalidasi kunci tersebut pada Redis Store (Environment Staging/Production) untuk mencegah eksekusi ganda.
3. **FR-TD-03 (Scaffold Frontend React/Vite):**
   - Menginisialisasi frontend dasar menggunakan React/Vite.
   - Implementasi Axios untuk koneksi ke REST API backend.

## 3. Kebutuhan Non-Fungsional (Non-Functional Requirements)
1. **NFR-TD-01 (Dependency Inversion - Prisma Singleton):**
   - *Maintainability (ISO/IEC 25010):* Inisialisasi `new PrismaClient()` tidak boleh tersebar di berbagai controller.
   - WAJIB diekstrak menjadi satu pola _singleton_ di `src/utils/db.js` dan di-_inject_ ke controller untuk menekan _TCP connections exhaustion_.
2. **NFR-TD-02 (Quality Assurance - Testing Framework):**
   - *Reliability & Testability:* Wajib memiliki framework Unit dan Integration Testing menggunakan `Jest` dan `Supertest`.
   - Menulis *unit test* dan *integration test* dasar untuk mencakup endpoint kritis di backend.

## 4. Persetujuan dan Tinjauan
Berdasarkan aturan utama `[DOKUMENTASI FIRST]`, maka dokumen ini diajukan kepada User. Setelah disetujui, eksekusi akan dilanjutkan sesuai dokumen ini.
