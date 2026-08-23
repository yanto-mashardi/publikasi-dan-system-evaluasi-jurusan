# Implementation Roadmap

## Implementation Status

Phase 1–4 telah memiliki MVP vertical slice dan Dynamic Administration Layer. Phase berikutnya harus mempertahankan prinsip **One Data → Evaluate → Approve → Publish**.

## Phase 0 — Architecture Freeze
Domain model, role model, lifecycle, public/private policy, terminology, dynamic administration, archive policy.

## Phase 1 — Foundation
Authentication, users, dynamic roles/permissions, organizations, study programs, audit log, versioning, evidence storage.

## Phase 2 — Strategic Planning & KPI
VMTS, Renstra, sasaran, KPI, target, measurement, automatic achievement calculation pada scope UPPS maupun Program Studi.

## Phase 3 — Evaluation & Follow-up
Generic evaluation engine, findings, recommendations, follow-up, verification, dashboard mutu.

## Phase 4 — Public Projection
Publication queue, publication approval, field policy, public API/views, public dashboard, editorial/news publication.

## Phase 5 — Academic & OBE Integration
Dynamic curriculum, profil lulusan, CPL, mata kuliah, CPMK, mapping CPMK–CPL, curriculum review/evaluation, dan import/integration dari OBE Evaluation System. Kurikulum merupakan objek versioned dan dapat menggunakan generic Evaluation Engine.

## Phase 6 — Resources and Extended Domains
Laboratorium bersama lintas Prodi, equipment, utilization, maintenance, K3L, lecturer/staff summary, research, PkM, students/graduates, cooperation. Laboratorium berada pada scope UPPS dan dapat dipetakan ke satu atau lebih Program Studi.

## Phase 7 — Accreditation & Compliance
Configurable frameworks (BAN-PT/LAM/standar lain), criteria, indicator mapping, self-assessment, gap analysis, evidence readiness, dan official accreditation status. Modul ini **membaca data yang sudah tersedia dari Phase 1–6** dan tidak membuat database fakta kedua.

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
