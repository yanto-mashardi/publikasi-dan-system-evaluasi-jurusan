# LAM Teknik — INPUT / PROCESS / OUTPUT-OUTCOME Crosswalk

## Tujuan

Dokumen ini menjadi **accreditation view** yang menyandingkan data operasional Jurusan/UPPS dengan struktur penilaian LAM Teknik tanpa membuat data akreditasi kedua.

```text
ONE GOVERNED DATA
      ↓
INPUT / PROCESS / OUTPUT-OUTCOME VIEW
      ↓
7 KRITERIA LAM TEKNIK
      ↓
INDIKATOR / ELEMEN PENILAIAN
      ↓
LED / LKPS / EVIDENCE READINESS
```

> Catatan: crosswalk ini adalah blueprint sistem. Nomor indikator/elemen rinci harus disimpan configurable sesuai versi instrumen LAM Teknik yang sedang berlaku, bukan di-hard-code pada source application.

## A. INPUT / MASUKAN

Masukan adalah kondisi, sumber daya, kebijakan, standar, rencana, dan desain yang menjadi prasyarat penyelenggaraan.

| Source Domain | Objek/Data | Kriteria LAM Teknik yang Umum Terkait |
|---|---|---|
| Organisasi | UPPS, Prodi, struktur, role, tata pamong | K1, K2, K7 |
| Perencanaan | VMTS, Renstra, sasaran, standar, target KPI | K1, K2, K7 |
| Akademik | kurikulum, profil lulusan, CPL, CPMK, mata kuliah | K1, K3, K6 |
| SDM | dosen, tendik, teknisi/laboran, kualifikasi, kepakaran | K4 |
| Sarpras | laboratorium, ruang, equipment, kapasitas, kesiapan K3L | K5 |
| Mahasiswa | input mahasiswa, mahasiswa aktif, karakteristik cohort | K6 |
| Tridharma | roadmap/agenda penelitian dan PkM, sumber pendanaan | K3 |
| Kerja sama | partner, ruang lingkup, periode, sumber pendukung | K2, K3 |
| Mutu | standar, manual/prosedur, target mutu | K7 |

## B. PROCESS / PROSES

Proses adalah pelaksanaan, pengendalian, pengukuran, evaluasi, dan peningkatan terhadap masukan.

| Source Domain | Objek/Data | Kriteria LAM Teknik yang Umum Terkait |
|---|---|---|
| Tata kelola | pelaksanaan Renstra/program kerja, koordinasi, keputusan | K1, K2 |
| Akademik/OBE | pembelajaran, implementasi kurikulum, review CPL/CPMK | K3, K6 |
| Penelitian | pelaksanaan penelitian | K3, K4 |
| PkM | pelaksanaan PkM | K3, K4 |
| Laboratorium | penggunaan/utilisasi, jadwal, maintenance | K5 |
| K3L | pemeriksaan, temuan, corrective action | K5, K7 |
| KPI | measurement, evidence, verification | K2, K7 |
| SPMI | evaluasi, finding, root cause, recommendation | K7 |
| Improvement | follow-up, verification efektivitas, reopening/closure | K7 |
| Approval | review dan keputusan formal | K2, K7 |
| Kerja sama | implementasi kegiatan kerja sama | K2, K3 |

## C. OUTPUT / OUTCOME

Luaran/capaian adalah hasil yang menunjukkan performa dan dampak dari proses yang telah dijalankan.

| Source Domain | Objek/Data | Kriteria LAM Teknik yang Umum Terkait |
|---|---|---|
| Kinerja | capaian KPI, tren, status target | K1, K2, K7 |
| Akademik | capaian CPL, kelulusan, masa studi, keberhasilan pembelajaran | K3, K6 |
| Lulusan | employment, entrepreneurship, further study, waiting time, relevansi kerja | K6 |
| Penelitian | luaran penelitian, produktivitas, outcome | K3, K4 |
| PkM | luaran dan manfaat PkM | K3, K4 |
| Laboratorium | utilization performance, kondisi peralatan, service readiness | K5 |
| K3L | safety performance dan efektivitas corrective action | K5, K7 |
| Kerja sama | hasil implementasi dan manfaat kerja sama | K2, K3 |
| SPMI | efektivitas tindak lanjut dan bukti peningkatan mutu | K7 |
| Transparansi | laporan kinerja dan public projection yang telah disahkan | K2, K7 |

## Crosswalk 7 Kriteria LAM Teknik terhadap IPO

### K1 — Diferensiasi Misi (Visi, Misi, Tujuan, dan Strategi)

```text
INPUT   : VMTS, Renstra, sasaran, target
PROCESS : implementasi strategi/program dan monitoring
OUTPUT  : capaian sasaran/KPI dan bukti positioning/diferensiasi
```

### K2 — Akuntabilitas

```text
INPUT   : tata pamong, struktur, kewenangan, kebijakan
PROCESS : governance workflow, audit trail, approval, reporting, kerja sama
OUTPUT  : laporan kinerja, keterlacakan keputusan, hasil kerja sama
```

### K3 — Relevansi Pendidikan, Penelitian, dan PkM

```text
INPUT   : kurikulum, CPL/CPMK, roadmap riset/PkM, stakeholder/partner
PROCESS : pembelajaran, penelitian, PkM, review relevansi
OUTPUT  : capaian pembelajaran, luaran penelitian/PkM, manfaat/relevansi
```

### K4 — Sumber Daya Manusia

```text
INPUT   : jumlah, kualifikasi, jabatan, kepakaran SDM
PROCESS : penugasan, pengembangan, keterlibatan tridharma
OUTPUT  : produktivitas/kinerja SDM dan kontribusi tridharma
```

### K5 — Sarana, Prasarana, dan K3L

```text
INPUT   : laboratorium, equipment, kapasitas, kesiapan K3L
PROCESS : utilization, maintenance, inspeksi K3L, corrective action
OUTPUT  : tingkat pemanfaatan, kondisi fasilitas, safety performance
```

### K6 — Mahasiswa dan Luaran Mahasiswa

```text
INPUT   : mahasiswa baru/aktif dan dukungan akademik
PROCESS : pembelajaran, pembinaan/layanan, monitoring kemajuan
OUTPUT  : lulusan, capaian CPL, masa studi, outcome lulusan
```

### K7 — Sistem Penjaminan Mutu

```text
INPUT   : standar, target, manual/prosedur, evidence requirement
PROCESS : measurement, verification, evaluation, finding, recommendation,
          follow-up, verification effectiveness
OUTPUT  : closure, effectiveness, tren perbaikan, bukti peningkatan mutu
```

## Rule Penyandingan Borang

Saat Phase 7 dibangun, user tidak mengisi ulang fakta. Tampilan akreditasi mengambil fakta dari source domain kemudian menyajikan:

| Framework | Kriteria | IPO | Indikator | Source | Evidence | Periode | Scope | Readiness |
|---|---|---|---|---|---|---|---|---|
| LAM Teknik 2025 | K5 | INPUT | configurable | Laboratory/Equipment | linked | 2026 | UPPS | Complete/Gap |
| LAM Teknik 2025 | K5 | PROCESS | configurable | Utilization/Maintenance/K3L | linked | 2026 | UPPS | Complete/Gap |
| LAM Teknik 2025 | K5 | OUTPUT | configurable | Resource performance | linked | 2026 | UPPS | Complete/Gap |

## Dashboard Akreditasi yang Dituju

```text
Framework: LAM Teknik 2025
Scope    : D3 Nautika / D3 KPN / UPPS
Period   : ...

INPUT
  Complete evidence : xx%
  Gap               : xx item

PROCESS
  Complete evidence : xx%
  Gap               : xx item

OUTPUT / OUTCOME
  Complete evidence : xx%
  Gap               : xx item

Filter tambahan:
  Kriteria 1–7
  Indicator/element
  Evidence status
  Evaluation status
  Follow-up status
```

Dengan struktur ini, aplikasi dapat dilihat dari dua perspektif sekaligus:

```text
OPERASIONAL JURUSAN
Domain → Workflow → Evaluation → Improvement

AKREDITASI
IPO → Kriteria → Indicator → Evidence → Readiness
```

Keduanya menunjuk ke source record yang sama.
