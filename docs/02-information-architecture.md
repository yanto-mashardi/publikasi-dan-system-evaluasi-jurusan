# Information Architecture

## 1. Public Portal

```text
BERANDA

PROFIL
├── Profil Jurusan / UPPS
├── Visi, Misi, Tujuan
├── Struktur Organisasi
├── Tata Kelola
└── Pimpinan

PROGRAM STUDI
└── [generated dari study_programs aktif]
    ├── D3 Nautika (data awal)
    ├── D3 Ketatalaksanaan Pelayaran Niaga (data awal)
    └── Prodi lain jika ditambahkan Admin

KINERJA
├── Renstra UPPS
├── Renstra/indikator per Prodi
├── Sasaran Strategis
├── Dashboard KPI
└── Laporan Kinerja

PENJAMINAN MUTU
├── Sistem Mutu
├── Hasil Evaluasi
├── Rekomendasi Publik
├── Tindak Lanjut
└── Progress Peningkatan

AKREDITASI
├── Status Resmi
├── Riwayat
├── Dokumen Publik
└── Evaluasi Kesiapan Internal (opsional, label harus jelas)

AKADEMIK
├── Kurikulum per Prodi
├── Profil Lulusan
├── CPL
├── Mata Kuliah
└── Riwayat Evaluasi Kurikulum

LABORATORIUM
├── Laboratorium UPPS
├── Pemanfaatan lintas Prodi
└── Informasi fasilitas publik yang disahkan

RISET & PkM

MAHASISWA & LULUSAN

KERJA SAMA

DOKUMEN & TRANSPARANSI

BERITA
```

## 2. Internal Workspace

```text
DASHBOARD

PERENCANAAN
├── VMTS UPPS
├── VMTS / visi keilmuan Prodi
├── Renstra UPPS / Prodi
├── Sasaran
├── Program Strategis
└── KPI & Target

AKADEMIK
├── Program Studi
├── Kurikulum
├── Profil Lulusan
├── CPL / CPMK
├── Mapping CPMK–CPL
└── Evaluasi Kurikulum

SUMBER DAYA
├── SDM
├── Laboratorium
└── Sarana Prasarana

KINERJA
├── Realisasi KPI
├── Penelitian
├── PkM
├── Mahasiswa & Lulusan
└── Kerja Sama

MUTU
├── Evaluasi
├── Temuan
├── Rekomendasi
├── Tindak Lanjut
└── Verifikasi Efektivitas

AKREDITASI & KEPATUHAN
├── Framework
├── Mapping
├── Self Assessment
├── Gap Analysis
└── Evidence Readiness

PUBLIKASI
├── Antrian Publikasi
├── Konten Aktif
├── Jadwal Publikasi
└── Arsip

ADMINISTRASI
├── Organizations / Jurusan
├── Program Studi
├── Users
├── Roles & Permissions
├── Master Data
├── Berita & Kategori
├── Workflow
└── Audit Log
```

## 3. Rule

Internal menu mengikuti **proses organisasi**. Public menu mengikuti **kebutuhan informasi pembaca**. Daftar Prodi, laboratorium, konten, dan objek lain dirender dari data aktif/published, bukan daftar hard-coded.

Data sumber tetap satu.
