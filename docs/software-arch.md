# Software Architecture Document (SAD - IEEE 1016)

## 1. Pendahuluan
Sistem Informasi Terpadu SMA dirancang dengan arsitektur **Client-Server (3-Tier Architecture)**:
1. **Presentation Tier**: React.js (SPA)
2. **Application Tier**: Node.js REST API (Express / Nest.js)
3. **Data Tier**: PostgreSQL

## 2. Layered Architecture Diagram (Interactive SVG)

```xml
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <style>
    .layer { fill: #f8f9fa; stroke: #ccc; stroke-width: 2; rx: 15; transition: stroke 0.3s, fill 0.3s; }
    .layer:hover { stroke: #007bff; fill: #e2eafc; }
    .box { fill: #fff; stroke: #333; stroke-width: 2; rx: 5; cursor: pointer; transition: transform 0.2s; }
    .box:hover { transform: translateY(-5px); stroke: #007bff; }
    .text { font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; pointer-events: none; }
    .header { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #555; pointer-events: none;}
    .line { stroke: #666; stroke-width: 2; fill: none; stroke-dasharray: 4,4; }
    .arrow { fill: #666; }
  </style>

  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" class="arrow" />
    </marker>
  </defs>

  <!-- Presentation Layer -->
  <rect x="50" y="50" width="700" height="120" class="layer" />
  <text x="70" y="80" class="header" text-anchor="start">1. Presentation Tier (Client Browser)</text>
  <g transform="translate(150, 100)">
    <rect x="-80" y="-20" width="160" height="40" class="box" />
    <text x="0" y="5" class="text">React UI Components</text>
  </g>
  <g transform="translate(400, 100)">
    <rect x="-80" y="-20" width="160" height="40" class="box" />
    <text x="0" y="5" class="text">Axios / HTTP Client</text>
  </g>
  <g transform="translate(650, 100)">
    <rect x="-80" y="-20" width="160" height="40" class="box" />
    <text x="0" y="5" class="text">Redux / Context API</text>
  </g>

  <!-- Application Layer -->
  <rect x="50" y="220" width="700" height="180" class="layer" />
  <text x="70" y="250" class="header" text-anchor="start">2. Application Tier (Node.js REST API)</text>
  <g transform="translate(150, 310)">
    <rect x="-80" y="-20" width="160" height="40" class="box" />
    <text x="0" y="5" class="text">Auth &amp; RBAC Control</text>
  </g>
  <g transform="translate(400, 310)">
    <rect x="-80" y="-20" width="160" height="40" class="box" />
    <text x="0" y="5" class="text">Business Logic Handlers</text>
  </g>
  <g transform="translate(650, 310)">
    <rect x="-80" y="-20" width="160" height="40" class="box" />
    <text x="0" y="5" class="text">ORM / Data Access</text>
  </g>

  <!-- Data Layer -->
  <rect x="50" y="450" width="700" height="120" class="layer" />
  <text x="70" y="480" class="header" text-anchor="start">3. Data Tier (Database Node)</text>
  <g transform="translate(400, 520)">
    <rect x="-80" y="-20" width="160" height="40" class="box" />
    <text x="0" y="5" class="text">PostgreSQL Database</text>
  </g>

  <!-- Connections -->
  <line x1="400" y1="120" x2="400" y2="290" class="line" marker-end="url(#arrowhead)" />
  <line x1="400" y1="330" x2="400" y2="500" class="line" marker-end="url(#arrowhead)" />
  <line x1="150" y1="330" x2="150" y2="500" class="line" marker-end="url(#arrowhead)" />
  <line x1="650" y1="330" x2="650" y2="500" class="line" marker-end="url(#arrowhead)" />
</svg>
```

## 3. Git Workflow
Kita menerapkan **GitFlow** untuk menjamin kestabilan:
- **`main`**: Kode stabil (Production Ready).
- **`develop`**: Kode terkonsolidasi dari fitur yang sedang jalan (Staging/Integration Ready).
- **`feature/<name>`**: *Branch* turunan dari `develop` untuk tiap modul baru.
- **`hotfix/<name>`**: *Branch* turunan dari `main` untuk perbaikan *bug* kritikal di Production.

## 4. Environment Strategy
1. **Development (`DEV`)**: Lingkungan uji coba masing-masing developer (lokal). *Mock DB*.
2. **Staging / UAT (`STG`)**: Repositori/server *mirroring* dari Production untuk Q/A testing & Load testing (500 CCU). Terkoneksi dengan DB samaran (*dummy data*).
3. **Production (`PROD`)**: *Live server*. URL terisolasi, DB terlindungi (Private Subnet), dan *Backup* aktif (RPO 1 jam).

## 5. Security Architecture & Threat Model

### 5.1. STRIDE Threat Model
| Threat | Skenario | Mitigasi |
|---|---|---|
| **S**poofing | Attacker meniru Super Admin | RBAC, JWT *signature validation*, hindari JWT *alg* `none`. |
| **T**ampering | User memodifikasi payload nilai di browser | Validasi server-side input, *prepared stmt* di PostgreSQL. |
| **R**epudiation | Admin menghapus nilai diam-diam | Implementasi *Audit Trail* / *Structured Logging* (Winston/Pino) di setiap operasi `UPDATE/DELETE`. |
| **I**nformation Disc| Bocornya *error stack trace* ke End User | Custom *Error Handler* di Node.js, tidak menebar detail SQL di `PROD`. |
| **D**enial of Service| Serangan CCU / *Spike* buatan via API | *Rate Limiting* (misal: max 100 req/min per IP), *Indexing* tabel Nilai. |
| **E**levation | Wali Kelas mengubah rolenya menjadi Admin | Validasi ketat token di API, JWT payload tidak menyimpan id-privelege sensitif melainkan divalidasi oleh *middleware*. |

### 5.2. OWASP Mitigations Top 10
- **Broken Access Control**: *Middleware Check* yang secara *by-default* menolak request (*secure by default*) kecuali dideklarasikan berhak.
- **Cryptographic Failures**: Hasher `bcrypt` untuk pass, akses Web melalui HTTPS/TLS 1.2+.
- **Injection**: Penggunaan *Prepared Statements* dan sanitasi via *Validator.js*.
