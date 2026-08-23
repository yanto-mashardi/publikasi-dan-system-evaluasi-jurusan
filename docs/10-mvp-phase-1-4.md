# MVP Phase 1–4 Implementation

## Status

Tahap 1–4 sekarang mempunyai vertical slice executable berbasis Next.js + Drizzle + MySQL.

## Phase 1 — Foundation

Implemented:
- user + password authentication;
- JWT httpOnly session;
- role and scoped assignment model;
- organization and study program tables;
- evidence metadata + local development storage adapter;
- audit log;
- object version table;
- bootstrap admin script;
- Admin System API untuk membuat akun dan menetapkan role terpisah.

## Phase 2 — Strategic Planning & KPI

Implemented data model dan API:
- strategic plan (Renstra);
- strategic statement generik untuk VISION, MISSION, OBJECTIVE, STRATEGY;
- strategic goals;
- KPI;
- target per period;
- measurement per period;
- automatic achievement calculation.

## Phase 3 — Evaluation & Follow-up

Implemented:
- generic evaluation;
- finding;
- recommendation;
- follow-up;
- follow-up verification;
- approval endpoint;
- audit events.

## Phase 4 — Public Projection

Implemented:
- publication policy table;
- approval gate sebelum publication;
- source-status gate sesuai policy;
- publication queue;
- publication record;
- public strategic statement projection;
- public KPI projection;
- read-only public API;
- public dashboard.

## Boundary

MVP ini belum memasukkan Phase 5–9. Kurikulum/OBE, instrumen akreditasi rinci, laboratorium, SDM, riset/PkM, mahasiswa/lulusan dan analytics lanjut tetap berada pada roadmap berikutnya.

## Setup

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run db:seed
npm run bootstrap:admin
npm run dev
```

## Publication Rule

Admin Data hanya mempunyai `publication.execute`. Keputusan kelayakan publikasi berasal dari approval yang sah. Endpoint publication juga memeriksa publication policy aktif dan status sumber.

## Validation Note

Dependency installation/build penuh belum dapat dijalankan pada environment authoring karena proses `npm install` melewati execution timeout. Struktur kode, import, route boundaries, dan schema telah diperiksa secara statis; CI disediakan agar build diverifikasi pada environment GitHub.
