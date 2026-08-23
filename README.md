# Publikasi dan System Evaluasi Jurusan

Integrated governance, evaluation, academic/OBE, resources, and public transparency system untuk Jurusan/UPPS.

## Prinsip Utama

> **One Data → One Workflow → Evaluate → Approve → Publish**

Portal publik **bukan sistem data kedua**. Portal publik adalah read-only projection dari data internal yang telah melewati workflow, approval, dan publication policy sesuai jenis objeknya. Data yang sudah efektif/published tidak di-overwrite atau dihapus tanpa jejak; perubahan menggunakan versioning/archive.

## Arsitektur Konseptual — Klaster LAM Teknik

Arsitektur operasional dikelompokkan dalam tiga klaster **INPUT → PROCESS → OUTPUT/OUTCOME** agar mudah disandingkan dengan LED, LKPS, matriks penilaian, dan borang akreditasi LAM Teknik. Pengelompokan ini adalah **accreditation view** atas data yang sama, bukan database baru.

```mermaid
flowchart LR
    subgraph I[INPUT / MASUKAN]
      I1[Organisasi UPPS & Prodi]
      I2[VMTS · Renstra · Standar · Target KPI]
      I3[SDM]
      I4[Sarpras · Laboratorium · Equipment · K3L]
      I5[Kurikulum · Profil Lulusan · CPL · CPMK]
      I6[Mahasiswa Input]
      I7[Kerja Sama & Sumber Pendukung]
    end

    subgraph P[PROCESS / PROSES]
      P1[Tata Kelola & Pelaksanaan Renstra]
      P2[Pendidikan / Pembelajaran / OBE]
      P3[Penelitian & PkM]
      P4[Pemanfaatan Lab · Maintenance · K3L]
      P5[Measurement KPI + Evidence]
      P6[SPMI: Verifikasi · Evaluasi · Temuan]
      P7[Rekomendasi · Tindak Lanjut · Verifikasi Efektivitas]
      P8[Approval & Governance Decision]
    end

    subgraph O[OUTPUT / OUTCOME]
      O1[Capaian KPI]
      O2[Capaian CPL · Lulusan · Outcome Lulusan]
      O3[Luaran Penelitian & PkM]
      O4[Kinerja Pemanfaatan Sumber Daya]
      O5[Hasil Kerja Sama]
      O6[Efektivitas Tindak Lanjut / Peningkatan Mutu]
      O7[Laporan Kinerja & Informasi Publik]
    end

    I --> P --> O

    I --> A[Accreditation Mapping]
    P --> A
    O --> A
    A --> B[7 Kriteria LAM Teknik]
    A --> C[LED / LKPS / Evidence Readiness]

    O --> D[Publication Layer]
    D --> E[Portal Publik]
```

### Prinsip Mapping IPO

- **INPUT/Masukan** = sumber daya, kebijakan, standar, rencana, struktur, kurikulum, dan kondisi awal yang memungkinkan proses berjalan.
- **PROCESS/Proses** = pelaksanaan tridharma, tata kelola, pengukuran, SPMI, evaluasi, tindak lanjut, serta pengendalian.
- **OUTPUT/OUTCOME** = capaian kinerja, CPL/lulusan, luaran tridharma, hasil kerja sama, efektivitas peningkatan mutu, dan informasi yang dapat dipertanggungjawabkan.
- Satu domain dapat berkontribusi pada lebih dari satu klaster. Contoh laboratorium: **equipment = input**, **utilization/maintenance/K3L = process**, **utilization/safety performance = output**.
- Tujuh kriteria LAM Teknik tetap menjadi dimensi penilaian. IPO adalah pengelompokan elemen mutu untuk memudahkan crosswalk, bukan pengganti kriteria.

Lihat `docs/15-lam-teknik-ipo-crosswalk.md` untuk matriks penyandingan domain sistem dengan klaster IPO dan tujuh kriteria LAM Teknik.

## Scope

Sistem mendukung lebih dari satu Jurusan dan lebih dari satu Program Studi. Objek strategis mempunyai scope eksplisit:

```text
UPPS/Jurusan  -> studyProgramId = NULL
Program Studi -> studyProgramId = ID Prodi
```

D3 Nautika dan D3 Ketatalaksanaan Pelayaran Niaga adalah data awal Jurusan Kemaritiman, bukan batas source code.

## Dua Lapisan, Satu Sumber Data

**Internal Governance Workspace**: create/update, evidence, evaluation, follow-up, approval, archive/versioning, publication execution.

**Public Portal**: read/search/filter/visualize/download data dan dokumen yang telah disahkan untuk publik.

## Domain Sistem

1. Organisasi & Master Data
2. Perencanaan Strategis
3. Akademik & OBE
4. Sumber Daya
5. Kinerja & KPI
6. Penjaminan Mutu
7. Akreditasi & Kepatuhan
8. Publikasi & Transparansi
9. Administrasi & Audit Trail

Domain di atas tetap menjadi struktur data/aplikasi. **INPUT–PROCESS–OUTPUT/OUTCOME adalah view lintas-domain untuk kebutuhan mutu dan akreditasi.**

## Role Baseline

- **Admin Sistem** — konfigurasi, organisasi/Prodi, user, role, master teknis.
- **Admin Data** — input data/konten/evidence dan eksekusi publish setelah approval.
- **Kaprodi** — data, Renstra/KPI, kurikulum dan tindak lanjut dalam scope Prodi.
- **GKM** — verifikasi mutu, evaluasi, temuan, rekomendasi.
- **Sekjur** — koordinasi administratif dan review.
- **Kajur/UPPS** — approval tingkat UPPS dan keputusan strategis.
- **Viewer Internal** — read-only sesuai scope.
- **Publik** — read-only terhadap projection yang telah disahkan.

Role bersifat dinamis di database, sementara capability keamanan tetap dikontrol application services.

## Status Implementasi

### Phase 1–4

Implemented: authentication/dynamic RBAC, organisasi/Prodi, audit/versioning/evidence, VMTS/Renstra, KPI target–realisasi, generic Evaluation Engine, finding/recommendation/follow-up, verification, approval, publication layer, berita, public KPI/evaluation/statement dashboard.

### Phase 5 — Academic & OBE

Vertical slice awal sudah tersedia dan akan disempurnakan kembali setelah seluruh sistem berjalan, terutama struktur kurikulum/OBE dan integrasi sumber OBE lama.

### Phase 6 — Resources and Extended Domains

Sedang divalidasi pada branch `phase6-resources`: laboratorium lintas Prodi, equipment, utilization, maintenance, K3L, SDM, penelitian, PkM, mahasiswa/lulusan, dan kerja sama.

## Separation of Duties & Scope Security

Permission saja tidak cukup untuk tindakan formal. Evaluation, approval, publication, follow-up, dan verification juga memeriksa scope objek. User yang hanya mempunyai scope Prodi A tidak dapat memproses objek Prodi B atau objek UPPS tanpa UPPS write scope.

## Database Update

```bash
npm run db:push
npm run db:seed
npm run db:backfill-scopes
```

## Roadmap Berikutnya

- **Phase 6 — Resources and Extended Domains:** penyelesaian dan validasi runtime.
- **Phase 7 — Accreditation & Compliance:** configurable BAN-PT/LAM/standar lain sebagai mapping/consumer dari data Phase 1–6, termasuk crosswalk IPO dan 7 kriteria LAM Teknik.
- **Phase 8 — Analytics:** trend, early warning, KPI/OBE/lab/accreditation readiness.
- **Phase 9 — Integration:** integrasi/migrasi dengan website Jurusan yang telah ada.
