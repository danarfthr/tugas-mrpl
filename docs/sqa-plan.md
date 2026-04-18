# Software Quality Assurance (SQA) Plan
**Standard:** IEEE 730
**Proyek:** Sistem Informasi Terpadu SMA

## 1. Purpose
Menyediakan panduan komprehensif bagi kegiatan Quality Assurance untuk memastikan bahwa perangkat lunak yang dibangun berkualitas tinggi, stabil, aman, dan mendeliver *value* sesuai dengan *Requirements*. Fokus utama: Shift-Left Testing (Verifikasi di awal fase).

## 2. Shift-Left Testing Strategy
*   Melibatkan SQA/QA sejak tahap requirements/design untuk mencegah defect seawal mungkin.
*   Penerapan otomatisasi proses testing di CI/CD *pipeline*.
*   Mewajibkan *Unit Test* dalam proses *Pull Request (PR).*

## 3. Quality Gates & Definition of Done (DoD)

| Gate | Fase | Definition of Done (DoD) / Criteria |
| :--- | :--- | :--- |
| **Gate 0** | Requirements | Dokumen SRS dan Use Case disetujui, UI/UX Wireframe ditandatangani, Acceptance Criteria jelas. SQA mereview "Testability" spesifikasi. |
| **Gate 1** | Design | ERD, System Architecture, & API Spec disetujui. SQA menyiapkan Test Case berdasar spesifikasi yang final. Security & Threat Modeling disepakati. |
| **Gate 2** | Code / Unit Test | Code review disetujui. Static Code Analysis (SonarQube) tidak ada error kritis/security hotspot. Lolos Unit Testing minimal 80% coverage. |
| **Gate 3** | Integration Test | Build CI/CD sukses. End-to-end API Test (Postman) & UI Automation (Cypress) pass 100% untuk modul utama. Tidak ada Major Defect. |
| **Gate 4** | UAT & Perf. Test | 500 CCU Load test tercapai (<500ms read, <1.2s write). Security Scan (SAST/DAST) lulus. Sign-off dari Stakeholders lewat UAT. |
| **Gate 5** | Production Ready | Deployment sukses tanpa *downtime* tak terencana. Monitoring APM/Logs diaktifkan. RTO (4 jam) & RPO (1 jam) aktif simulasi di Production. |

## 4. Standar Kode (Coding Standards)
Agar kode seragam dan *maintainable*:
1.  **Frontend (React):** Mengikuti *Airbnb React/JSX Style Guide*. Wajib `ESLint` + `Prettier`. 
2.  **Backend (Node.js):** Mengikuti standar umum *Node.js best practices*. Penanganan *Error Handling* wajib eksplisit. Dilarang kerahasiaan (*secret*) hardcoded di repo (.env).
3.  **Database (SQL):** Format penulisan tabel dan kolom dilarang campur aduk (Standar: *snake_case*). Semua *query* wajib di-sanitize via *ORM / Prepared Statement*. 
4.  **Version Control (Git):** *Branching Strategy* Git Flow. Commits wajib memiliki pesan yang jelas (misal: `feat: add login API`, `fix: error handling input nilai`).

## 5. Manajemen Defect & SLA Perbaikan
Setiap temuan *bug* wajib di-log di *Issue Tracker* dengan menyertakan *steps to reproduce*, *expected vs actual result*, log error. Waktu perbaikan ditentukan oleh Severity:

| Severity Level | Deskripsi | SLA Perbaikan (Waktu Resolusi) |
| :--- | :--- | :--- |
| **S1 (Blocker / Critical)** | Sistem *crash*, fitur inti gagal total, ada kebocoran celah keamanan fatal (OWASP 10) atau *data loss*. | < 4 Jam (Immediate Fix / Hotfix) |
| **S2 (High)** | Fitur penting tidak berfungsi tapi ada *workaround* rumit, error cukup sering. | < 24 Jam (Next Build Resolusi) |
| **S3 (Medium / Normal)** | Efek kecil, sistem masih dapat melayani kebutuhan normal. Contoh: validasi kurang ramah pengguna. | Maksimal Sprint berikutnya (1 Minggu) |
| **S4 (Low / Trivial)** | Isu UI kecil, *typo* teks, warna. Tidak ada efek fungsional. | Terjadwal bebas (Backlog Trivial) |

*Semua Defect dengan Severity S1/S2 wajib teratasi (Closed) sebelum bisa lewat ke Gate selanjutnya.*
