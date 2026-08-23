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

## 3. Accreditation Classification View — INPUT / PROCESS / OUTPUT

Struktur teknis aplikasi tetap berbasis domain. Untuk kepentingan SPMI dan akreditasi, data domain yang sama disajikan melalui **IPO Accreditation View**.

```text
INPUT / MASUKAN
├─ Organisasi, UPPS, Prodi
├─ VMTS, Renstra, standar, target
├─ SDM
├─ Sarpras, laboratorium, equipment, K3L readiness
├─ Kurikulum, profil lulusan, CPL, CPMK
├─ Mahasiswa input
└─ Kerja sama dan sumber pendukung
          │
          ▼
PROCESS / PROSES
├─ Tata kelola dan pelaksanaan Renstra
├─ Pendidikan/pembelajaran/OBE
├─ Penelitian dan PkM
├─ Penggunaan lab, maintenance, pelaksanaan K3L
├─ Measurement KPI dan evidence
├─ SPMI: verifikasi, evaluasi, temuan
├─ Rekomendasi dan tindak lanjut
└─ Verifikasi efektivitas dan approval
          │
          ▼
OUTPUT / OUTCOME
├─ Capaian KPI
├─ Capaian CPL, lulusan, outcome lulusan
├─ Luaran penelitian dan PkM
├─ Kinerja pemanfaatan sumber daya
├─ Hasil kerja sama
├─ Efektivitas peningkatan mutu
└─ Laporan dan informasi publik
```

Ketiga klaster tersebut menjadi **view lintas-domain** dan seluruhnya dapat dipetakan ke framework akreditasi.

### Rule penting

1. IPO bukan database baru.
2. Satu source record dapat dipakai oleh beberapa indikator akreditasi.
3. Satu domain dapat berada pada lebih dari satu klaster IPO tergantung elemen yang dinilai.
4. Tujuh kriteria LAM Teknik tetap menjadi dimensi penilaian utama; IPO membantu mengelompokkan bukti dan elemen mutu.
5. Mapping IPO dan kriteria disimpan pada Accreditation Mapping Layer, bukan dengan menduplikasi fakta ke tabel borang.

Contoh:

```text
LABORATORIUM
Equipment / kapasitas      -> INPUT
Utilization / maintenance  -> PROCESS
Utilization performance    -> OUTPUT

KURIKULUM
Design / CPL / CPMK        -> INPUT
Implementation / review    -> PROCESS
CPL attainment / graduate  -> OUTPUT/OUTCOME
```

## 4. Source of Truth

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

## 5. Public Projection

Public Projection adalah hasil query terkontrol dari data internal.

Suatu objek dapat tampil publik jika:

```text
approval_status = APPROVED
AND lifecycle_status IN (EFFECTIVE, PUBLISHED)
AND visibility = PUBLIC
AND publication_start <= now
AND (publication_end IS NULL OR publication_end >= now)
```

## 6. Evaluation Engine

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

## 7. Follow-up Engine

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

## 8. Accreditation

Akreditasi adalah **consumer of governed data**.

```text
LAM/BAN-PT Framework
        ↓
Criterion
        ↓
Indicator / Element
        ↓
IPO Cluster
        ↓
Required Metric / Evidence
        ↓
Existing Domain Data
        ↓
Assessment / Readiness
```

Tidak ada copy data khusus akreditasi atau portal publik.

Crosswalk rinci: `docs/15-lam-teknik-ipo-crosswalk.md`.

## 9. Non-Functional Requirements

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
