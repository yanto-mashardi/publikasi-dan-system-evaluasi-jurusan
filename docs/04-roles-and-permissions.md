# Roles and Permissions

## Role Matrix

| Capability | Admin Sistem | Admin Data | Kaprodi | GKM | Sekjur | Kajur |
|---|---:|---:|---:|---:|---:|---:|
| Konfigurasi sistem | ✓ |  |  |  |  |  |
| Kelola master organisasi/Prodi | ✓ |  |  |  |  |  |
| Kelola user & role | ✓ |  |  |  |  |  |
| Input data substantif |  | ✓ | ✓ (scope) | scope | ✓ |  |
| Kelola berita/konten |  | ✓ |  |  | review | approval |
| Upload evidence |  | ✓ | ✓ | ✓ | ✓ |  |
| Verifikasi evidence |  |  | scope | ✓ | ✓ |  |
| Evaluasi mutu |  |  | scope | ✓ | ✓ | ✓ |
| Menetapkan rekomendasi |  |  | scope | ✓ | ✓ | ✓ |
| Menjalankan tindak lanjut |  | scope | ✓ |  | ✓ |  |
| Verifikasi efektivitas |  |  |  | ✓ | ✓ | ✓ |
| Approval tingkat UPPS |  |  |  |  |  | ✓ |
| Merekomendasikan layak publik |  |  |  | ✓ | ✓ | ✓ |
| Review publikasi |  |  |  | ✓ | ✓ | ✓ |
| Eksekusi publish setelah approval |  | ✓ |  |  |  |  |
| Lihat audit log | ✓ |  |  | ✓ | ✓ | ✓ |

## Separation of Duties

Sistem harus mencegah pola berikut untuk objek yang membutuhkan pengendalian mutu formal:

```text
Inputter = Evaluator = Approver
```

Admin Sistem mengelola konfigurasi, organisasi, Prodi, user, role, dan capability. Admin Data mengelola data/konten dan menjalankan aksi publish terhadap objek yang sudah memenuhi approval serta publication policy. Admin Sistem maupun Admin Data tidak otomatis menjadi evaluator substansi mutu.

## Scope

Kaprodi:

```text
scope = study_program_id
```

GKM:

```text
scope = UPPS + semua prodi dalam ruang lingkup mutu
```

Sekjur:

```text
scope = UPPS untuk koordinasi, review, dan verifikasi administratif
```

Kajur:

```text
scope = UPPS untuk approval dan keputusan strategis
```

Role tetap dinamis di database. Matriks ini adalah baseline separation-of-duties; role tambahan boleh dibuat selama tidak memberikan kombinasi capability yang menghilangkan kontrol input–evaluation–approval untuk objek formal.
