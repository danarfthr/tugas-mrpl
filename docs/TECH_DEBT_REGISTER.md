# Tech Debt & Security Register

Dokumen ini mencatat tinjauan keamanan aplikasi, area kode yang membutuhkan _refactoring_ di masa mendatang, serta penemuan limitasi arsitektur berdasarkan standar kelayakan (OWASP & SOLID) di fase *Backend Implementations*.

---

## 1. Security Review (OWASP Top 10)

| No | Kategori OWASP | Status Mitigasi | Catatan Implementasi |
|----|---------------|-----------------|----------------------|
| 1 | **Broken Access Control** | ✅ Tercakup | `requireRole` middleware memastikan hanya *role* yang sesuai yang bisa mengakses rute nilai/presensi. |
| 2 | **Cryptographic Failures** | ✅ Tercakup | *Password* di-_hash_ menggunakan algoritma **Bcrypt**. Rahasia token tersingkap divalidasi ke `JWT_SECRET`. |
| 3 | **Injection** | ✅ Tercakup | *Prisma ORM* secara bawaan memproteksi dari SQL Injection lewat penerapan *PreparedStatement*. Input payload JSON telah di-_sanitize_ dan divalidasi secara ketat oleh **Joi** sebelum dieksekusi. |
| 4 | **Insecure Design** | ⚠️ Sebagian Tercakup | Sudah ada validasi panjang dan nilai maksimum payload. Namun alangkah baiknya disiapkan mekanisme untuk membatasi eksekusi token yang ditarik balik (*revoked tokens*) semisal sistem *Logout/Blacklist*. |
| 5 | **Security Misconfiguration** | ✅ Tercakup | Menggunakan `helmet` untuk menyembunyikan header tak perlu & `cors` untuk _origin restriction_. Handling error juga menutupi *Stack Trace* di mode `production` demi mitigasi _Information Disclosure_. |

---

## 2. SOLID Principle Review

1. **Single Responsibility Principle (SRP):** Controller dipisah berdasarkan logika domain (_Academic_ dan _Presensi_). File route mengurus routing, middleware mengurus autorisasi. (✅ Terpenuhi)
2. **Open-Closed Principle (OCP):** Validasi dipisah ke definisi _schema Joi_ sehingga jika aturan berubah, kita bisa ekstensi validasi tersebut tanpa menulis ulang seluruh logika _controller_. (✅ Terpenuhi)
3. **Dependency Inversion Principle (DIP):** Terkait database, inisiasi Prisma dilakukan terpisah, tapi saat ini di *instantiate* secara hardcode dalam tiap controller `const prisma = new PrismaClient()`. Ke depannya hal ini harusnya di _inject_ melalui _repository pattern_. (⚠️ Tech Debt)

---

## 3. Tech Debt Register (Daftar Hutang Teknis)

| Komponen | Isu / Ketidaklengkapan | Prioritas | Saran Rencana Penyelesaian |
|----------|------------------------|-----------|-----------------------------|
| **Testing** | Belum ada unit/integration test (_Jest/Supertest_). | **High** | Wajib dilengkapi pada Fase SQA/Testing (Shift-Left) untuk semua endpoint API kritis. |
| **Idempotency** | Fitur idempotency belum aktif menggunakan instrumen memori terpusat (e.g. Redis). | **Medium** | Pasang Redis di _Environment Staging_ dan validasi `x-idempotency-key` via _Redis Store_. |
| **Frontend** | Frontend baru di-scaffold dan React/Vite belum ditulis antarmukanya. | **High** | Segera lanjutkan integrasi Axios serta *UI Components* via React. |
| **Prisma Instance** | Ada _multiple instantiation_ dari `PrismaClient` di berbagai file _controller_, yang dapat mengakibatkan _TCP connections exhaustion_ pada beban 500 CCU. | **High** | Ekstrak iterasi `new PrismaClient()` ke satu file tunggal/singleton `src/utils/db.js` dan re-use di seluruh aplikasi. |

---
_Dokumen dihasilkan sesuai instruksi untuk merekap hasil pengembangan (Fase 5C)._
