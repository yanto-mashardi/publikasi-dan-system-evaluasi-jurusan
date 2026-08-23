# Implementation Roadmap

## Implementation Status

Phase 1–4 telah memiliki MVP vertical slice dan Dynamic Administration Layer. **Phase 5 Academic & OBE juga telah memiliki vertical slice awal**. Phase 6 menjadi tahap implementasi berikutnya.

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

## Phase 5 — Academic & OBE Integration — VERTICAL SLICE DONE
Dynamic/versioned curriculum, profil lulusan, CPL, mata kuliah, CPMK, mapping CPMK–CPL, curriculum review melalui generic Evaluation Engine, stakeholder metadata, OBE import staging, approval dan public curriculum projection.

Remaining refinement pada Phase 5 dapat dilakukan iteratif saat sumber OBE lama benar-benar dihubungkan: mapping kolom Google Sheet/CSV ke schema baru, import validation report, dan attainment calculation dari data assessment.

## Phase 6 — Resources and Extended Domains — NEXT
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
