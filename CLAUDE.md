# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Sistem Informasi Terpadu SMA** (Integrated School Information System) - a 3-tier web application for managing student academic records and attendance.

- **Frontend**: React 19 + Vite (SPA)
- **Backend**: Node.js + Express (REST API)
- **Database**: PostgreSQL 15
- **Cache**: Redis

## Development Commands

### Frontend
```bash
cd frontend
npm install
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run lint     # ESLint check
```

### Backend
```bash
cd backend
npm install
npm run dev      # Start with nodemon (port 3000)
npm run test     # Jest tests
```

### Infrastructure
```bash
docker compose up -d    # Start PostgreSQL and Redis
```

## Architecture

### Backend Structure (Express + Prisma ORM)
```
backend/src/
├── app.js                 # Express app setup (middleware, routes)
├── server.js              # Entry point
├── routes/                 # Route handlers
│   ├── authRoutes.js
│   ├── akademikRoutes.js   # Grades endpoints
│   ├── presensiRoutes.js   # Attendance endpoints
│   └── healthRoutes.js
├── controllers/            # Business logic
├── middlewares/           # Auth, rate limiting, error handling
└── utils/                 # Logger (Winston), DB connection, Redis
```

### Frontend Structure (React Router)
```
frontend/src/
├── App.jsx                 # Router setup with ProtectedRoute
├── context/AuthContext.jsx # JWT auth state management
├── pages/                  # Login, Dashboard, InputNilai
└── utils/axiosConfig.js    # Axios interceptors for JWT
```

### API Versioning Strategy
- Base path: `/api/v1/`
- Endpoints:
  - `POST /api/v1/auth/login` - Authentication (no auth required)
  - `POST /api/v1/akademik/nilai` - Bulk grade input
  - `POST /api/v1/akademik/presensi` - Attendance input
- JWT token passed via `Authorization: Bearer <token>` header

### RBAC Roles
1. **Super Admin** - Full system access
2. **Admin Sekolah** - Manage master data, input grades/attendance
3. **Guru Wali Kelas** - Input grades/attendance for assigned class

### Rate Limiting
- Auth endpoints: 5 req/min per IP
- Read endpoints: 100 req/min per user
- Write endpoints: 30 req/min per user

## Documentation

Key project documentation in `/docs`:
- `SPEC.md` - Project charter, SRS (IEEE 830), SLA/SLO baseline
- `software-arch.md` - Architecture diagram (SVG), STRIDE threat model
- `api-spec.md` - OpenAPI 3.0 spec for all endpoints
- `database-design.md` - ERD design
- `test-plan.md`, `sqa-plan.md` - Testing documentation

## Key Patterns

### Protected Routes (Frontend)
```jsx
<ProtectedRoute allowedRoles={['Guru Wali Kelas', 'Admin Sekolah']}>
  <InputNilai />
</ProtectedRoute>
```

### API Response Format
```json
{ "success": true, "data": {...}, "error": null, "meta": {...} }
```

### Security Middleware Stack
1. Helmet (HTTP headers)
2. CORS
3. Rate limiting (express-rate-limit)
4. Body parsing with size limit (10kb)
5. Auth middleware (JWT validation)
6. Input validation (Joi)

## Environment Variables

Backend uses `.env` files with Prisma. Never commit secrets - all credentials come from environment variables.