# Dynamic Administration & Editorial Layer

## Prinsip

Sistem tidak boleh mengunci Jurusan, Prodi, user, role, berita, atau kategori konten di source code. Source code hanya menyimpan aturan keamanan dan workflow; struktur organisasi dan konten disimpan di database.

## Entitas yang dikelola Admin

Admin Sistem dapat:

- menambah, mengubah, mengarsipkan, dan mengaktifkan kembali organisasi/Jurusan/UPPS;
- menambah, mengubah, mengarsipkan, dan mengaktifkan kembali Program Studi;
- menambah, mengubah, menonaktifkan, dan mengaktifkan kembali user;
- membuat role baru dan menentukan kombinasi permission;
- mengarsipkan role yang tidak digunakan;
- mengelola kategori berita;
- mengelola berita;
- mengelola master data lain yang ditambahkan pada fase berikutnya.

Admin Data dapat mengelola konten/berita dan menjalankan publikasi yang sudah memperoleh approval.

## Delete Policy

Penghapusan fisik tidak digunakan untuk record yang sudah mempunyai relasi historis.

```text
NEW / UNUSED RECORD -> boleh hard delete jika aman
USED / AUDITED RECORD -> ARCHIVED / INACTIVE
```

Tujuannya menjaga audit trail, relasi KPI, evaluasi, evidence, dan laporan historis.

## Dynamic Organization

```text
Institution
  └─ Organization / Jurusan / UPPS (N)
       ├─ Study Program (N)
       ├─ Unit/Lab (fase berikutnya)
       └─ Users with scoped roles
```

Tidak ada asumsi bahwa sistem hanya memiliki satu Jurusan atau dua Prodi.

## Dynamic Role Model

Permission code merupakan capability keamanan yang stabil karena dipakai oleh application services, misalnya:

- `system.configure`
- `users.manage`
- `roles.manage`
- `master.manage`
- `news.manage`
- `publication.execute`
- `approval.final`

Role adalah konfigurasi database. Admin dapat membuat role baru dan memilih permission yang diberikan.

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

1. Tidak ada daftar Jurusan/Prodi hard-coded pada UI atau API.
2. Role creation tidak dibatasi enum source code.
3. Admin dapat CRUD/Archive Organization, Study Program, User, Role, News Category, News Article.
4. Public news hanya membaca berita hasil workflow internal.
5. Seluruh mutasi penting menghasilkan audit log.
6. Data yang sudah dipakai tidak hilang akibat hard delete.
