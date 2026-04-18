---
name: database-design
description: Panduan desain database, ERD, kamus data, dan migration strategy.
---
# 🗄 STANDAR DATABASE DESIGN & MIGRATION
1. Visual ERD: Gunakan Mermaid erDiagram di dalam blok HTML. Tampilkan SEMUA
entitas dan relasi.
2. Security: Tandai kolom sensitif (PII/PHI) dengan komentar // enkripsi pada
skema ERD.
3. Migration Strategy:
- WAJIB sediakan fungsi down() untuk rollback di setiap migration file.
- Terapkan Zero-Downtime Migration (jangan langsung hapus kolom/tabel yang
sedang dipakai).
