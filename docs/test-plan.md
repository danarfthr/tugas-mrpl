# Master Test Plan & Performance Test Plan
**Standard:** IEEE 829
**Proyek:** Sistem Informasi Terpadu SMA

## 1. Test Plan Identifier
MTP-SIT-SMA-v1.0

## 2. Introduction
Dokumen ini mendefinisikan strategi, pendekatan, sumber daya, dan jadwal pelaksanaan pengujian untuk Sistem Informasi Terpadu SMA. Tujuannya adalah memastikan sistem bebas cacat (defect) dan memenuhi performa SLA yang disepakati, melayani 500 concurrent users.

## 3. Test Items
Modul-modul yang akan diuji meliputi:
*   Frontend (React UI)
*   Backend REST API (Node.js)
*   Database (PostgreSQL)

## 4. Features to be Tested
*   **FR-01:** Autentikasi (Bcrypt/JWT).
*   **FR-02 & FR-03:** User & Data Master Management.
*   **FR-04:** Input Akademik/Rapor.
*   **FR-05:** Input Presensi.
*   **Security:** XSS Prevention, SQLi Prevention.
*   **Performance:** Spikes 500 CCU.

## 5. Features not to be Tested
*   Integrasi sistem eksternal (Dapodik, Payment Gateway, Mesin Absensi).
*   Single Sign-On (SSO) & Multi-Factor Authentication (MFA).

## 6. Approach
Pengujian menggunakan strategi **Shift-Left Testing**, mulai dari awal SDLC.
*   **Unit Testing:** (Jest) oleh developer, target coverage 80%.
*   **Integration Testing:** Postman/Supertest pada endpoint API API.
*   **System Testing:** End-to-end functionality (Cypress/Playwright).
*   **Security Testing:** SAST, Secret Scanning pada CI.

## 7. Item Pass/Fail Criteria
*   **Pass:** Tidak ada *Critical/High Defect*, coverage >= 80%, fitur berjalan sesuai spesifikasi (FR).
*   **Fail:** Terdapat *High/Critical Defect* yang menghalangi fungsionalitas utama, performance SLA tidak tercapai.

---

## 8. Performance Test Plan (SLA/SLO Baseline)
Berdasarkan Dokumen Fase 2: SLA / SLO BASELINE.

### 8.1. Objektif & Metrik (SLI/SLO Target)
*   **Concurrent Users (CCU):** 500 CCU (kondisi input nilai serentak).
*   **Response Time (Read/Routine):** < 500 ms (P95).
*   **Response Time (Write/Bulk Input):** < 1.2 detik (P95).
*   **Error Rate:** < 1%.
*   **Target Uptime:** 99.5%.

### 8.2. Skenario Pengujian (Load/Stress Testing)
*   **Testing Tool:** k6 / JMeter.
*   **Skenario 1 (Spike Load):** Simulasi 500 Guru Wali Kelas login bersamaan (FR-01) dan masuk ke dashboard.
*   **Skenario 2 (Stress Test - Bulk Insert):** 500 Guru Wali Kelas melakukan *submit* pengisian nilai akademik dan absensi (FR-04, FR-05) secara serentak.
*   **Skenario 3 (Endurance Test):** Beban normal 100-200 CCU dijalankan terus selama 24 jam untuk mendeteksi *memory leak*.

### 8.3. Pemantauan (Monitoring)
*   Menggunakan Prometheus / Grafana / APM untuk mengumpulkan data CPU, Memory, DB Connection Pool (PostgreSQL), dan durasi eksekusi query.
