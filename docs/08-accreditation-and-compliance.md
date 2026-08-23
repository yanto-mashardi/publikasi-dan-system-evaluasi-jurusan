# Accreditation and Compliance

## Principle

Akreditasi tidak mempunyai database fakta sendiri. Modul akreditasi adalah **mapping dan assessment layer** yang membaca governed data dari domain organisasi, perencanaan, akademik, sumber daya, kinerja, mutu, dan tridharma.

Framework akreditasi berisi:

```text
framework
criterion
indicator / element
ipo_cluster
requirement
calculation_rule
evidence_requirement
mapping
assessment
```

## LAM Teknik Classification

Untuk LAM Teknik 2025, elemen mutu disajikan dalam tiga klaster operasional:

```text
INPUT / MASUKAN
PROCESS / PROSES
OUTPUT / OUTCOME
```

Klaster tersebut digunakan untuk menyandingkan source data dengan elemen LED/LKPS/matriks penilaian. Tujuh kriteria LAM Teknik tetap disimpan sebagai dimensi yang berbeda:

1. Diferensiasi Misi (Visi, Misi, Tujuan, dan Strategi)
2. Akuntabilitas
3. Relevansi Pendidikan, Penelitian, dan PkM
4. Sumber Daya Manusia
5. Sarana, Prasarana, dan K3L
6. Mahasiswa dan Luaran Mahasiswa
7. Sistem Penjaminan Mutu

Satu kriteria dapat memiliki elemen pada lebih dari satu klaster IPO. Karena itu `ipo_cluster` **tidak boleh menggantikan criterion**.

## Mapping Architecture

```text
LAM Framework
      ↓
Criterion
      ↓
Indicator / Assessment Element
      ↓
IPO Cluster
      ↓
Required Metric / Evidence
      ↓
Domain Source Record
      ↓
Evidence Repository
      ↓
Internal Assessment / Readiness
```

Contoh:

```text
Criterion 5 — Sarpras & K3L

INPUT
  Laboratory profile
  Equipment
  Capacity / facility readiness

PROCESS
  Utilization
  Maintenance
  K3L checks

OUTPUT
  Utilization performance
  Equipment condition trend
  Safety / corrective-action effectiveness
```

## Accreditation Mapping Record

Phase 7 sebaiknya menyediakan mapping generik dengan struktur konseptual:

```text
framework_id
criterion_id
indicator_id
ipo_cluster               INPUT | PROCESS | OUTPUT_OUTCOME
source_subject_type
source_subject_id / query_rule
scope_type                 UPPS | STUDY_PROGRAM
calculation_rule
required_evidence_type
evidence_id
period
readiness_status
assessment_note
```

Untuk indikator yang dihitung dari banyak record, `source_subject_id` dapat diganti dengan `query_rule` atau metric definition. Fakta asal tetap berada di domain sumbernya.

## Official Status vs Internal Assessment

### Official
Dapat dipublikasikan sebagai:

- status akreditasi;
- lembaga;
- SK;
- tanggal;
- masa berlaku.

### Internal Readiness
Harus diberi label:

> Evaluasi Kesiapan Internal

Tidak boleh disajikan seolah-olah merupakan skor resmi lembaga akreditasi.

## Borang / LED / LKPS View

Sistem nantinya harus dapat menghasilkan tampilan seperti:

```text
INPUT
  ├─ data tersedia
  ├─ evidence tersedia
  └─ gap

PROCESS
  ├─ pelaksanaan
  ├─ evaluasi
  ├─ tindak lanjut
  └─ evidence

OUTPUT / OUTCOME
  ├─ capaian
  ├─ tren
  ├─ effectiveness
  └─ evidence
```

Kemudian user dapat memfilter berdasarkan:

- framework;
- kriteria LAM;
- klaster IPO;
- UPPS/Prodi;
- periode;
- status kelengkapan evidence;
- status evaluasi kesiapan.

## Framework Adaptability

Sistem harus dapat menambah:

- BAN-PT;
- LAM tertentu;
- audit internal;
- standar institusi;
- regulasi baru;

tanpa mengganti master data.

Crosswalk awal LAM Teknik: `docs/15-lam-teknik-ipo-crosswalk.md`.
