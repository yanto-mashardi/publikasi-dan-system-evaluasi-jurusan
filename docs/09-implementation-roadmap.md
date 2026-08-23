# Implementation Roadmap

## Implementation Status

Phase 1–4 telah memiliki MVP vertical slice. Phase 5–9 tetap menjadi tahap berikutnya. Detail implementasi terdapat pada `10-mvp-phase-1-4.md`.

## Phase 0 — Architecture Freeze
Output: domain model, role model, lifecycle, public/private policy, terminology.

## Phase 1 — Foundation
Authentication, users, roles, organizations, study programs, audit log, versioning, evidence storage.

## Phase 2 — Strategic Planning & KPI
VMTS, Renstra, sasaran, KPI, target, measurement, automatic achievement calculation.

## Phase 3 — Evaluation & Follow-up
Generic evaluation engine, findings, recommendations, follow-up, verification, dashboard mutu.

## Phase 4 — Public Projection
Publication queue, publication approval, field policy, public API/views, public dashboard.

## Phase 5 — Academic & OBE Integration
Curriculum, CPL, CPMK, course mapping, curriculum evaluation, import/integration dari OBE Evaluation System.

## Phase 6 — Accreditation
Configurable frameworks, criteria, mapping, self-assessment, gap analysis, evidence readiness.

## Phase 7 — Resources and Extended Domains
Laboratory, equipment, K3L, lecturer/staff summary, research, PkM, students/graduates, cooperation.

## Phase 8 — Analytics
Trend analysis, early warning, overdue follow-up, KPI heatmap, accreditation readiness, public transparency dashboard.

## Phase 9 — Integration with Existing Jurusan Website
Pilihan: repository baru menjadi backend/core dan website lama sebagai public frontend, atau repository baru menjadi aplikasi terintegrasi dan website lama dimigrasikan bertahap. Keputusan teknis dilakukan setelah audit struktur kode aplikasi eksisting.

## Recommended MVP

```text
Auth/RBAC
→ Organization
→ VMTS/Renstra
→ KPI
→ Evidence
→ Evaluation
→ Follow-up
→ Approval
→ Publication
→ Public Dashboard
```
