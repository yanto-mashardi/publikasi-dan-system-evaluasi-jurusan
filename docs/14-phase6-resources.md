# Phase 6 — Resources and Extended Domains

## Tujuan

Phase 6 menyediakan governed source data untuk sumber daya dan luaran Jurusan/UPPS sebelum modul akreditasi dibangun. Rule utama tetap:

```text
One Data
→ Evidence
→ Evaluation bila relevan
→ Follow-up
→ Approval
→ Publication
→ Accreditation Mapping / Reporting
```

Akreditasi pada Phase 7 membaca domain ini dan tidak meminta input ulang fakta yang sama.

## 1. Laboratorium sebagai Sumber Daya UPPS

Laboratorium dimiliki/dikelola pada scope UPPS dan dapat digunakan oleh satu atau lebih Program Studi.

```text
UPPS
 └─ Laboratory
     ├─ Versioned Profile
     ├─ Program Mappings (N)
     ├─ Equipment
     ├─ Usage
     ├─ Maintenance
     ├─ K3L Checks
     ├─ Evidence
     └─ Generic Evaluation / Follow-up
```

`laboratories` menyimpan identitas stabil. `laboratory_profiles` menyimpan versi profil yang dapat disahkan dan dipublikasikan. Peralatan, penggunaan, maintenance, dan K3L tetap menjadi record operasional internal.

Saat profil laboratorium memperoleh approval, pemetaan Program Studi disalin ke `laboratory_profile_programs`. Portal publik membaca snapshot ini sehingga perubahan mapping operasional setelah approval tidak mengubah halaman publik secara diam-diam.

## 2. Lifecycle Profil Laboratorium

```text
DRAFT
→ SUBMITTED
→ APPROVED
→ PUBLISHED
→ ARCHIVED / superseded by new profile version
```

Versi published tidak diedit in-place. Revisi dibuat sebagai versi baru.

## 3. Equipment & Maintenance

Equipment menyimpan:

- kode aset;
- nama/kategori;
- jumlah dan unit;
- kondisi;
- tahun perolehan;
- status aktif/arsip.

Maintenance terkait ke equipment dan menyimpan jenis pekerjaan, jadwal, penyelesaian, biaya, provider, dan status.

Data rinci ini internal. Ringkasan publik/akreditasi dapat diturunkan kemudian melalui analytics/reporting yang disahkan.

## 4. Laboratory Utilization

Penggunaan dapat berasal dari:

- praktikum;
- penelitian;
- PkM;
- pelatihan;
- kegiatan lain.

Jika penggunaan diklaim untuk satu Program Studi, laboratorium harus sudah dipetakan sebagai fasilitas Prodi tersebut.

## 5. K3L

Pemeriksaan K3L mempunyai tanggal, checklist, score, temuan, corrective action, evaluator dan status. K3L dapat menjadi subject generic Evaluation Engine jika dibutuhkan.

Raw checklist/temuan tidak otomatis dipublikasikan.

## 6. SDM

`personnel` menjadi master sumber daya manusia untuk dosen, staf, teknisi laboratorium, dan kategori lain. Record dapat mempunyai scope UPPS atau Program Studi.

Data SDM pada Phase 6 merupakan sumber internal. Publication individual tidak dibuka secara default untuk menghindari publikasi data pribadi tanpa policy khusus.

## 7. Penelitian dan PkM

Research dan community service mempunyai scope UPPS/Prodi serta lifecycle:

```text
DRAFT → SUBMITTED → APPROVED → PUBLISHED
```

Record dapat dilengkapi evidence dan dievaluasi oleh generic Evaluation Engine.

## 8. Mahasiswa dan Lulusan

Phase 6 menggunakan data agregat:

- statistik mahasiswa tahunan per Prodi;
- outcome lulusan per tahun lulus.

Tidak ada data pribadi mahasiswa/alumni pada projection publik.

Outcome mendukung jumlah terlacak, bekerja, wirausaha, studi lanjut, masa tunggu, dan relevansi pekerjaan.

## 9. Kerja Sama

Kerja sama dapat berada pada scope UPPS atau Prodi dan menyimpan partner, jenis partner, ruang lingkup, periode, implementasi, serta status.

Hanya record yang telah approved/published masuk ke portal.

## 10. Permissions

Capability Phase 6:

```text
resources.read
resources.manage
resources.contribute
```

Default:

- Admin Sistem: read dan override sistem untuk administrasi;
- Admin Data: manage;
- Kaprodi: contribute pada scope Prodi;
- GKM: read + generic evaluation;
- Sekjur: manage pada scope UPPS;
- Kajur: read + final approval;
- Viewer: read.

Permission selalu dikombinasikan dengan object scope.

## 11. Internal Workspace

```text
/internal/resources
```

Workspace mencakup lab, mapping Prodi, equipment, usage, maintenance, K3L, SDM, penelitian, PkM, mahasiswa/lulusan, kerja sama dan workflow publication.

## 12. Public Projection

```text
/laboratorium
/riset-pkm
/mahasiswa-lulusan
/kerja-sama
```

Portal tidak membaca draft/operational record yang belum mendapat publication record.

## 13. Database Update

Setelah menarik Phase 6:

```bash
npm install
npm run db:push
npm run db:seed
npm run db:backfill-scopes   # diperlukan jika database sudah berisi strategic record lama
npm run dev
```

Untuk instalasi pertama, jalankan `npm run bootstrap:admin` setelah `.env.local` diisi.

## 14. Validation Gate

CI Phase 6 wajib lolos:

1. dependency installation;
2. TypeScript `tsc --noEmit`;
3. MySQL service health;
4. `db:push` pada database kosong;
5. foundation seed;
6. bootstrap admin;
7. Next.js production build;
8. server start;
9. public page smoke tests;
10. authenticated internal workspace smoke test;
11. authenticated laboratory create API smoke test.

Phase 6 tidak dianggap siap untuk `main` sebelum seluruh gate tersebut sukses.
