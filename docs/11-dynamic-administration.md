# Dynamic Administration & Editorial Layer

## Prinsip

Sistem tidak boleh mengunci Jurusan, Prodi, user, role, berita, kategori konten, Renstra, VMTS, sasaran, KPI, kurikulum, atau master fase berikutnya di source code. Source code hanya menyimpan aturan keamanan dan workflow; struktur organisasi dan data substantif disimpan di database.

## Pembagian Lapisan Admin

### Admin Sistem

Dapat:
- menambah, mengubah, mengarsipkan, dan mengaktifkan kembali organisasi/Jurusan/UPPS;
- menambah, mengubah, mengarsipkan, dan mengaktifkan kembali Program Studi;
- menambah, mengubah, menonaktifkan, dan mengaktifkan kembali user;
- membuat role baru dan menentukan kombinasi permission;
- mengarsipkan role yang tidak digunakan;
- mengelola master teknis yang ditambahkan pada fase berikutnya.

### Admin Data / Editorial

Dapat:
- mengelola draft data substantif sesuai scope;
- mengelola kategori berita dan berita;
- mengunggah evidence;
- menyiapkan metadata publik;
- menjalankan publikasi yang sudah memperoleh approval.

Admin Sistem tidak otomatis menjadi editor berita/evaluator. Admin Data tidak otomatis menjadi evaluator atau approver.

## Delete Policy

Penghapusan fisik tidak digunakan untuk record yang sudah mempunyai relasi historis.

```text
NEW / UNUSED RECORD -> boleh hard delete jika aman
USED / AUDITED RECORD -> ARCHIVED / INACTIVE
EFFECTIVE / APPROVED / PUBLISHED -> revisi/versioning atau retirement
```

Tujuannya menjaga audit trail, relasi KPI, evaluasi, evidence, kurikulum, dan laporan historis.

## Dynamic Organization

```text
Institution
  └─ Organization / Jurusan / UPPS (N)
       ├─ Study Program (N)
       ├─ Unit/Lab (fase berikutnya)
       └─ Users with scoped roles
```

Tidak ada asumsi bahwa sistem hanya memiliki satu Jurusan atau dua Prodi. D3 Nautika dan D3 KPN adalah data awal untuk Jurusan Kemaritiman, bukan batas source code.

## Dynamic Role Model

Permission code merupakan capability keamanan yang stabil karena dipakai oleh application services, misalnya:

- `system.configure`
- `users.manage`
- `roles.manage`
- `master.manage`
- `news.manage`
- `publication.execute`
- `approval.final`

Role adalah konfigurasi database. Admin Sistem dapat membuat role baru dan memilih permission yang diberikan, dengan tetap menjaga separation-of-duties.

## News Workflow

```text
DRAFT
  ↓
SUBMITTED
  ↓
APPROVED
  ↓
PUBLISHED
  ↓
ARCHIVED
```

Berita publik harus mempunyai record internal yang sama. Portal membaca projection dari berita yang sudah `PUBLISHED`; tidak ada tabel `public_news` terpisah.

## Acceptance Criteria sebelum pengembangan lanjut

1. Tidak ada daftar Jurusan/Prodi hard-coded sebagai batas sistem pada UI atau API.
2. Role creation tidak dibatasi enum source code.
3. Lapisan Admin dapat CRUD/Archive Organization, Study Program, User, Role, News Category, News Article, dan objek strategis sesuai authority.
4. Public news hanya membaca berita hasil workflow internal.
5. Seluruh mutasi penting menghasilkan audit log.
6. Data yang sudah dipakai tidak hilang akibat hard delete.
7. Objek efektif/published menggunakan versioning atau retirement, bukan overwrite diam-diam.
