# Phase 5 — Academic & OBE Integration

## Status

Phase 5 telah memiliki vertical slice awal yang mengikuti rule utama sistem: **data akademik berasal dari workspace internal, versioned, dapat dievaluasi, disetujui, lalu diproyeksikan ke portal publik**.

## Program Scope Gate

Sebelum Phase 5, strategic object diperbaiki agar memiliki scope eksplisit:

```text
UPPS scope  -> studyProgramId = NULL
Prodi scope -> studyProgramId = ID Prodi
```

`governance_scopes` digunakan oleh Renstra, VMTS/visi keilmuan, sasaran dan KPI. Read scope dan write scope dibedakan; user dengan scope satu Prodi tidak dapat menulis objek UPPS.

## Academic Data Model

Implemented:

- `curricula` — kurikulum versioned per Prodi;
- `graduate_profiles` — profil lulusan;
- `cpl` — capaian pembelajaran lulusan;
- `courses` — master mata kuliah per Prodi;
- `curriculum_courses` — penempatan mata kuliah dalam versi kurikulum/semester;
- `cpmk` — CPMK per mata kuliah dalam konteks kurikulum;
- `cpmk_cpl_mappings` — mapping CPMK–CPL;
- `curriculum_review_cycles` — metadata siklus evaluasi kurikulum;
- `obe_imports` — staging integrasi OBE lama.

## Curriculum Workflow

```text
DRAFT
  ↓
SUBMITTED
  ↓
APPROVED / EFFECTIVE
  ↓
PUBLISHED
  ↓
ARCHIVED / superseded by new version
```

Kurikulum efektif/published tidak diedit in-place.

## Curriculum Evaluation

Evaluation tidak diduplikasi.

```text
Curriculum
   ↓
Curriculum Review Cycle
   ↓
Generic Evaluation (subject_type = CURRICULUM)
   ↓
Finding
   ↓
Recommendation
   ↓
Follow-up
   ↓
Verification
```

`curriculum_review_cycles` menyimpan periode, tipe review dan stakeholder. Analisis substansi tetap disimpan oleh generic Evaluation Engine.

## Stakeholder Evidence

Field `stakeholders` mendukung pencatatan pihak yang dilibatkan, misalnya:

- dosen;
- mahasiswa;
- alumni;
- pengguna lulusan/industri;
- asosiasi profesi;
- pakar eksternal.

Evidence dokumen dapat tetap menggunakan generic Evidence repository dengan `subject_type = CURRICULUM` atau `EVALUATION`.

## OBE Import Staging

Source type yang disiapkan:

- `GOOGLE_SHEET`;
- `CSV`;
- `JSON`;
- `MANUAL`.

Import pertama kali masuk sebagai `STAGED`. Sistem tidak langsung menimpa CPL, CPMK atau mapping aktif. Transformasi baru dilakukan setelah schema mapping sumber lama terhadap schema akademik baru diverifikasi.

## Internal Workspace

Route:

```text
/internal/academic
```

Workspace sudah menyediakan:

- pemilihan Program Studi;
- pembuatan versi kurikulum;
- profil lulusan;
- CPL;
- master mata kuliah;
- mapping mata kuliah ke kurikulum;
- CPMK;
- mapping CPMK–CPL;
- evaluasi kurikulum oleh evaluator;
- submit, approval dan publication kurikulum sesuai permission;
- OBE import staging.

## Public Projection

Route publik:

```text
/akademik
/api/public/curricula
```

Public API hanya membaca kurikulum yang mempunyai record publication `PUBLISHED`. Projection dapat berisi program studi, versi kurikulum, jumlah/isi profil lulusan, CPL, dan mata kuliah sesuai publication policy.

## Multi-Jurusan / Multi-Prodi Security

Generic `subject-scope` resolver digunakan untuk:

- evaluation;
- approval;
- publication queue;
- publication execution.

Permission tanpa scope tidak cukup. Aktor harus mempunyai scope terhadap objek yang diproses.

## Database Update

Setelah menarik perubahan Phase 5:

```bash
npm run db:push
npm run db:seed
npm run db:backfill-scopes
```

`db:backfill-scopes` memberi scope UPPS pada strategic record lama yang dibuat sebelum `governance_scopes` tersedia.

## Next Phase

Sesuai audit arsitektur, Phase 6 adalah **Resources and Extended Domains**: laboratorium bersama lintas Prodi, equipment, utilization, maintenance, K3L, SDM, penelitian, PkM, mahasiswa/lulusan dan kerja sama. Accreditation dipindahkan ke Phase 7 supaya membaca data domain yang sudah tersedia.
