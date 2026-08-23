# Implementation Roadmap

## Phase 0 — Architecture Freeze
Output:
- domain model;
- role model;
- lifecycle;
- public/private policy;
- terminology.

## Phase 1 — Foundation
Bangun:
- authentication;
- users;
- roles;
- organizations;
- study programs;
- audit log;
- versioning;
- evidence storage.

## Phase 2 — Strategic Planning & KPI
Bangun:
- VMTS;
- Renstra;
- sasaran;
- KPI;
- target;
- measurement;
- automatic achievement calculation.

## Phase 3 — Evaluation & Follow-up
Bangun:
- generic evaluation engine;
- findings;
- recommendations;
- follow-up;
- verification;
- dashboard mutu.

## Phase 4 — Public Projection
Bangun:
- publication queue;
- publication approval;
- field policy;
- public API/views;
- public dashboard.

## Phase 5 — Academic & OBE Integration
Bangun:
- curriculum;
- CPL;
- CPMK;
- course mapping;
- curriculum evaluation;
- import/integration dari OBE Evaluation System.

## Phase 6 — Accreditation
Bangun:
- configurable frameworks;
- criteria;
- mapping;
- self-assessment;
- gap analysis;
- evidence readiness.

## Phase 7 — Resources and Extended Domains
Bangun:
- laboratory;
- equipment;
- K3L;
- lecturer/staff summary;
- research;
- PkM;
- students/graduates;
- cooperation.

## Phase 8 — Analytics
Bangun:
- trend analysis;
- early warning;
- overdue follow-up;
- KPI heatmap;
- accreditation readiness;
- public transparency dashboard.

## Phase 9 — Integration with Existing Jurusan Website
Pilihan:
1. repository baru menjadi backend/core dan website lama sebagai public frontend; atau
2. repository baru menjadi aplikasi terintegrasi dan website lama dimigrasikan bertahap.

Keputusan teknis dilakukan setelah audit struktur kode aplikasi eksisting.

## Recommended MVP

MVP jangan langsung mencakup seluruh instrumen akreditasi.

Prioritas:

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

Ini sudah membuktikan arsitektur inti dan menghindari overload.
