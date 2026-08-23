# Implementation Roadmap

## Implementation Status

Phase 1–4 telah memiliki MVP vertical slice dan Dynamic Administration Layer. **Phase 5 Academic & OBE memiliki vertical slice awal dan sengaja akan disempurnakan kembali setelah seluruh domain utama berjalan. Phase 6 Resources and Extended Domains sudah tersedia di `main` untuk simulasi lokal.**

## Phase 0 — Architecture Freeze — DONE
Domain model, role model, lifecycle, public/private policy, terminology, dynamic administration, archive policy.

## Phase 1 — Foundation — MVP DONE
Authentication, users, dynamic roles/permissions, organizations, study programs, audit log, versioning, evidence storage.

## Phase 2 — Strategic Planning & KPI — MVP DONE
VMTS, Renstra, sasaran, KPI, target, measurement, automatic achievement calculation pada scope UPPS maupun Program Studi.

## Phase 3 — Evaluation & Follow-up — MVP DONE
Generic evaluation engine, findings, recommendations, follow-up, verification, dashboard mutu foundation.

## Phase 4 — Public Projection — MVP DONE
Publication queue, publication approval, field policy, public API/views, public dashboard, editorial/news publication.

## Phase 5 — Academic & OBE Integration — VERTICAL SLICE DONE / REFINEMENT LATER
Dynamic/versioned curriculum, profil lulusan, CPL, mata kuliah, CPMK, mapping CPMK–CPL, curriculum review melalui generic Evaluation Engine, stakeholder metadata, OBE import staging, approval dan public curriculum projection.

Refinement Phase 5 akan dilakukan setelah keseluruhan sistem berjalan, terutama struktur kurikulum/OBE, mapping sumber OBE lama, import validation, dan attainment calculation.

## Phase 6 — Resources and Extended Domains — VERTICAL SLICE DONE / LOCAL SIMULATION
Sudah tersedia:

- laboratorium bersama lintas Prodi;
- profil laboratorium versioned;
- equipment/inventaris;
- utilization/penggunaan;
- maintenance;
- K3L;
- personnel/SDM;
- penelitian;
- PkM;
- statistik mahasiswa;
- outcome lulusan;
- kerja sama;
- scope UPPS/Prodi;
- generic evaluation/follow-up integration;
- approval/publication projection;
- public views dan `/internal/resources`.

## Dynamic Accreditation Registry — FOUNDATION AVAILABLE
Sebagai persiapan Phase 7, registry akreditasi dinamis sudah tersedia:

```text
Program Studi
→ Accreditation Agency
→ Framework / Instrument Version
→ Criteria
→ Cluster(s)
→ Indicators
→ Evidence Requirements
→ Source Mapping
```

Seed awal menggunakan LAM Teknik 2025 reference structure dengan tiga klaster IPO dan tujuh kriteria. Framework tidak otomatis ditautkan ke Prodi. Assignment harus eksplisit sesuai cakupan resmi.

## Phase 7 — Accreditation & Compliance — INITIAL VERTICAL SLICE AVAILABLE
Vertical slice assessment engine kini menyediakan:

- cockpit berdasarkan assignment framework, Prodi, dan periode;
- view INPUT / PROCESS / OUTPUT-OUTCOME, kriteria, dan indikator;
- fakta aktual, hasil/catatan perhitungan, analisis, evaluasi gap, dan catatan LED;
- tautan record sumber/evidence;
- status kesiapan internal;
- keputusan internal/publik;
- lifecycle DRAFT → SUBMITTED → APPROVED → PUBLISHED;
- projection assessment terpilih ke `/akreditasi`.

Pengembangan Phase 7 berikutnya tetap mencakup:

- import/entry indikator instrumen spesifik;
- indicator-to-source mapping;
- perhitungan readiness otomatis berdasarkan scoring rule resmi;
- agregasi evidence requirement dan gap otomatis;
- improvement action terhubung per indikator;
- official accreditation status;
- LED/LKPS/borang views.

Modul ini **membaca data yang sudah tersedia dari Phase 1–6** dan tidak membuat database fakta kedua.

## Phase 8 — Analytics
Trend analysis, early warning, overdue follow-up, KPI heatmap, curriculum attainment, laboratory utilization, accreditation readiness, dan public transparency dashboard.

## Phase 9 — Integration with Existing Jurusan Website
Repository menjadi governance core dan public projection source. Website Jurusan yang sudah ada dapat menggunakan public API/projection atau dimigrasikan bertahap setelah audit struktur kode eksisting.

## Sequencing Rule

```text
Governed Source Data
→ Evaluation
→ Follow-up
→ Approval
→ Publication
→ Accreditation Mapping / Reporting
```

Akreditasi ditempatkan setelah domain sumber utama tersedia agar tetap menjadi consumer dari data yang sama, bukan tempat input ulang data akreditasi.

## Local Simulation

Panduan pengujian lokal: `docs/17-local-simulation.md`.
