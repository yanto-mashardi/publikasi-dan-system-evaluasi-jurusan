# Architecture

## 1. Architectural Style

Sistem menggunakan pola **modular monolith dengan shared database** pada fase awal.

Alasan:

- domain saling berhubungan erat;
- jumlah aktor organisasi terbatas;
- transaksi membutuhkan konsistensi;
- deployment lebih sederhana;
- audit trail terpusat;
- lebih ringan dibanding microservices.

Microservices belum diperlukan pada fase awal.

## 2. Logical Layers

```text
┌──────────────────────────────────────────────┐
│                PRESENTATION                  │
│ Public Portal | Internal Workspace           │
├──────────────────────────────────────────────┤
│             APPLICATION SERVICES             │
│ Planning | KPI | Quality | Accreditation     │
│ Publication | Academic | Resources           │
├──────────────────────────────────────────────┤
│                 DOMAIN CORE                  │
│ Evaluation Engine | Follow-up Engine         │
│ Approval Engine | Versioning | RBAC          │
├──────────────────────────────────────────────┤
│                  DATA LAYER                  │
│ Relational DB | Evidence Storage | Audit Log │
└──────────────────────────────────────────────┘
```

## 3. Source of Truth

Semua domain menggunakan sumber data yang sama.

Contoh:

```text
Lecturer Master
 ├─> Public Profile
 ├─> HR Monitoring
 ├─> KPI Calculation
 ├─> Accreditation Mapping
 └─> Reports
```

Tidak ada copy data khusus akreditasi atau portal publik.

## 4. Public Projection

Public Projection adalah hasil query terkontrol dari data internal.

Suatu objek dapat tampil publik jika:

```text
approval_status = APPROVED
AND lifecycle_status IN (EFFECTIVE, PUBLISHED)
AND visibility = PUBLIC
AND publication_start <= now
AND (publication_end IS NULL OR publication_end >= now)
```

## 5. Evaluation Engine

Evaluation Engine bersifat generik.

Objek yang dapat dievaluasi:

- KPI;
- kurikulum;
- CPL;
- program kerja;
- laboratorium;
- SDM;
- penelitian;
- PkM;
- mahasiswa/lulusan;
- kerja sama;
- sarpras;
- akreditasi;
- layanan.

Satu evaluation table menggunakan:

- `subject_type`
- `subject_id`

sehingga tidak perlu tabel evaluasi terpisah untuk setiap modul.

## 6. Follow-up Engine

Semua rekomendasi dapat menghasilkan tindak lanjut dengan model yang sama.

```text
Evaluation
   ↓
Recommendation
   ↓
Follow-up
   ↓
Evidence
   ↓
Verification
   ↓
Closed / Re-opened
```

## 7. Accreditation

Akreditasi adalah **consumer of governed data**.

Instrumen akreditasi hanya memetakan:

```text
Criterion
  ↓
Required Evidence / Metric
  ↓
Existing Domain Data
```

Tidak ada copy data khusus akreditasi atau portal publik.

## 8. Non-Functional Requirements

### Auditability
Setiap perubahan mencatat actor, timestamp, before, after, reason.

### Versioning
VMTS, Renstra, kurikulum, dokumen, dan kebijakan wajib mempunyai versi.

### Security
Public API hanya membaca projection.

### Privacy
Evidence internal tidak otomatis publik.

### Scalability
Mulai dari modular monolith; pisahkan service hanya jika beban atau organisasi berkembang signifikan.

### Maintainability
Business logic ditempatkan di domain/service, bukan di UI.
