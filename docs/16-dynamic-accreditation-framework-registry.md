# Dynamic Accreditation Framework Registry

## Tujuan

Registry akreditasi dibuat dinamis karena setiap Program Studi dapat berada pada lembaga akreditasi dan instrumen yang berbeda, dan satu lembaga dapat mempunyai beberapa instrumen berdasarkan tahun, jenjang, skema pengajuan, dan moda pembelajaran.

Rule utama:

```text
Program Studi
   ↓
Accreditation Agency
   ↓
Framework / Instrument Version
   ↓
Criteria
   ↓
Cluster(s)
   ↓
Indicators
   ↓
Evidence Requirements
   ↓
Source Mapping
```

Data akreditasi tidak menggandakan fakta dari domain operasional.

## Struktur Dinamis

### accreditation_agencies
Contoh: LAM Teknik, BAN-PT, LAM lain.

### accreditation_frameworks
Versi instrumen milik satu agency. Field utama:

```text
agency_id
code
name
instrument_year
instrument_type
education_level
modality
regulation_reference
source_url
version_number
lifecycle_status
```

Framework `ACTIVE` dibekukan. Perubahan instrumen dilakukan melalui versi framework baru agar histori asesmen tetap dapat ditelusuri.

### accreditation_clusters
Klaster milik framework. Nama klaster tidak di-hard-code. Field `semantic_group` hanya menjadi cross-framework normalization, misalnya:

```text
INPUT
PROCESS
OUTPUT_OUTCOME
OTHER / custom
```

LAM lain dapat mempunyai nama/struktur klaster sendiri.

### accreditation_criteria
Kriteria milik framework. Tidak diasumsikan selalu tujuh.

### accreditation_indicators
Indikator milik framework dan criterion. Bobot, unit, dan scoring rule disimpan pada framework tersebut.

### accreditation_indicator_clusters
Many-to-many relationship antara indikator dan klaster. Satu indikator dapat berkaitan dengan lebih dari satu klaster, dengan satu primary cluster bila diperlukan.

### accreditation_evidence_requirements
Daftar kebutuhan dokumen/data untuk indikator.

### accreditation_indicator_mappings
Mapping indikator ke governed source data, misalnya:

```text
KPI_MEASUREMENT
CURRICULUM
LABORATORY_PROFILE
LABORATORY_EQUIPMENT
RESEARCH_PROJECT
COMMUNITY_SERVICE_PROJECT
STUDENT_ANNUAL_STAT
GRADUATE_OUTCOME_STAT
COOPERATION
EVALUATION
FOLLOWUP
```

### study_program_accreditation_frameworks
Assignment framework ke Program Studi. Assignment bersifat eksplisit dan dapat menyimpan referensi cakupan resmi.

```text
study_program_id
framework_id
is_primary
assignment_status
assigned_from
assigned_to
official_coverage_reference
notes
```

## Seed Awal — LAM Teknik

Seed hanya memuat struktur yang dapat diverifikasi sebagai baseline umum:

- Agency: `LAM_TEKNIK`;
- Framework: `LAMTEKNIK-2025-REFERENCE`;
- tiga klaster: Input, Process, Output/Outcome;
- tujuh kriteria LAM Teknik.

Seed ini **tidak otomatis ditautkan ke D3 Nautika atau D3 KPN**. Assignment baru dilakukan setelah cakupan resmi Program Studi diverifikasi.

Seed juga tidak mencampur indikator dari matriks yang berbeda. LAM Teknik 2025 mempunyai beberapa jalur instrumen, antara lain Pasca Akreditasi Minimum/Unggul, Perpanjangan, Unggul Internasional, dan Pendidikan Jarak Jauh. Matriks indikator harus dimasukkan pada framework spesifik yang sesuai jenjang dan skema.

## Initial LAM Teknik Criteria

```text
K1 Diferensiasi Misi (Visi, Misi, Tujuan, dan Strategi)
K2 Akuntabilitas
K3 Relevansi Pendidikan, Penelitian, dan PkM
K4 Sumber Daya Manusia
K5 Sarana, Prasarana, dan K3L
K6 Mahasiswa dan Luaran Mahasiswa
K7 Sistem Penjaminan Mutu
```

## Workspace

```text
/internal/accreditation
```

Admin Sistem dapat:

- menambah/mengarsipkan lembaga akreditasi;
- membuat framework/instrumen baru;
- menambah klaster;
- menambah kriteria;
- menambah indikator;
- mendefinisikan kebutuhan evidence;
- menautkan framework aktif ke Program Studi.

User lain dengan `accreditation.read` dapat melihat registry sesuai kebutuhan internal.

## Versioning Rule

```text
DRAFT
  ↓ configure criteria / clusters / indicators
ACTIVE
  ↓ immutable structure
ARCHIVED
```

Jika LAM mengubah instrumen:

```text
LAM X 2025 v1 ACTIVE
        ↓
LAM X 2026 v1 DRAFT
        ↓ configure/import
LAM X 2026 v1 ACTIVE
```

Assessment lama tetap merujuk framework lama.

## Source References

- https://lamteknik.or.id/akreditasi/instrumen-akreditasi
- https://lamteknik.or.id/akreditasi/kriteria-akreditasi-program-studi
- https://lamteknik.or.id/peraturan/peraturan-lam-teknik
- https://lamteknik.or.id/peraturan/peraturan-ban-pt
