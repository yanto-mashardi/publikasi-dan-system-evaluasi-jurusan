# Local Simulation Guide

Panduan ini digunakan untuk menguji repository secara lokal setelah menarik branch/commit yang sudah disiapkan.

## 1. Prasyarat

- Node.js **22.13.0 atau lebih baru**.
- npm 10+.
- MySQL 8.x berjalan di lokal.
- Git.

## 2. Siapkan Database

Contoh melalui MySQL CLI:

```sql
CREATE DATABASE IF NOT EXISTS evaluasi_jurusan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

## 3. Siapkan Environment

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Linux/macOS:

```bash
cp .env.example .env.local
```

Edit `.env.local` sesuai MySQL lokal. Contoh:

```text
DATABASE_URL=mysql://root:password_mysql_anda@127.0.0.1:3306/evaluasi_jurusan
AUTH_SECRET=ganti-dengan-random-secret-minimal-32-karakter
STORAGE_DRIVER=local
EVIDENCE_DIR=.data/evidence
BOOTSTRAP_ADMIN_NAME=Administrator UPPS
BOOTSTRAP_ADMIN_EMAIL=admin@local.test
BOOTSTRAP_ADMIN_PASSWORD=AdminLocal12345!
```

`.env.local` tidak boleh di-commit.

## 4. Install dan Setup

```bash
npm install
npm run setup:local
```

`setup:local` menjalankan:

```text
db:push
→ db:seed
→ db:backfill-scopes
→ bootstrap:admin
→ db:seed:demo
```

Seed akan membuat foundation roles/permissions, Jurusan Kemaritiman dan dua Prodi awal, publication policies, serta **LAM Teknik 2025 Reference Structure** sebagai model awal registry akreditasi. LAM Teknik tidak otomatis ditautkan ke Prodi.

Seed demo menambahkan contoh lintas-domain setelah admin tersedia: Renstra/KPI, kurikulum dan CPL, laboratorium dan K3L, SDM, penelitian, PkM, statistik mahasiswa/lulusan, kerja sama, evaluasi, tindak lanjut, serta assignment framework. Semua record contoh menggunakan awalan `CONTOH` dan seed bersifat idempotent, sehingga mudah dikenali dan tidak berlipat ketika setup diulang.

Untuk menambahkan data contoh saja pada database yang skemanya sudah mutakhir:

```bash
npm run db:seed:demo
```

## 5. Jalankan Development Server

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

Login internal:

```text
http://localhost:3000/internal/login
```

Gunakan email/password yang Anda isi pada `BOOTSTRAP_ADMIN_EMAIL` dan `BOOTSTRAP_ADMIN_PASSWORD`.

## 6. Checklist Simulasi

### Public

- `/`
- `/akademik`
- `/laboratorium`
- `/riset-pkm`
- `/mahasiswa-lulusan`
- `/kerja-sama`
- `/berita`

Data publik boleh kosong sebelum ada record yang melalui approval/publication. Kondisi kosong bukan error.

### Internal

- `/internal`
- `/internal/admin`
- `/internal/academic`
- `/internal/resources`
- `/internal/accreditation`

### Administrasi Dinamis

Uji:

1. tambah organisasi/Jurusan;
2. tambah Program Studi;
3. tambah user;
4. buat/ubah role dan permission;
5. tambah kategori berita dan berita;
6. archive/deactivate record dan aktifkan kembali bila tersedia.

### Phase 6

Uji minimal:

1. buat laboratorium pada scope UPPS;
2. tautkan laboratorium ke satu atau lebih Prodi;
3. tambah equipment;
4. tambah penggunaan/utilisasi;
5. tambah maintenance;
6. catat K3L;
7. tambah SDM;
8. tambah penelitian/PkM;
9. tambah statistik mahasiswa/lulusan;
10. tambah kerja sama.

### Registry Akreditasi

Pada `/internal/accreditation`:

1. pastikan `LAM_TEKNIK` tersedia;
2. buka `LAMTEKNIK-2025-REFERENCE`;
3. pastikan tiga klaster seed tersedia: `INPUT`, `PROCESS`, `OUTPUT_OUTCOME`;
4. pastikan K1–K7 tersedia;
5. buat lembaga akreditasi dummy;
6. buat framework DRAFT;
7. tambah klaster/kriteria/indikator/evidence requirement;
8. aktifkan framework;
9. tautkan framework ACTIVE tersebut ke satu Prodi;
10. pastikan framework ACTIVE tidak dapat diubah in-place.

## 7. Validation Command

Sebelum mengubah source code lebih jauh:

```bash
npm run check
```

Perintah tersebut menjalankan TypeScript check dan production build.

Health endpoint:

```text
http://localhost:3000/api/health
```

Respons normal:

```json
{
  "ok": true,
  "service": "upps-governance",
  "databaseConfigured": true
}
```

## 8. Bila Menggunakan Database Lama

Jangan hapus database lama. Jalankan:

```bash
npm install
npm run setup:local
```

`db:push` akan menyelaraskan schema. Seed bersifat idempotent untuk foundation utama. `db:backfill-scopes` menambahkan governance scope pada strategic object lama yang belum memiliki scope record.

Sebelum pengujian serius pada database penting, tetap buat backup MySQL terlebih dahulu.

## 9. Catatan Kurikulum

Phase 5 Academic/OBE saat ini adalah vertical slice awal. Struktur kurikulum akan disempurnakan kembali setelah seluruh domain utama berjalan. Pengujian lokal saat ini difokuskan pada kestabilan workflow, scope, data dinamis, resources, publication, dan registry akreditasi.
