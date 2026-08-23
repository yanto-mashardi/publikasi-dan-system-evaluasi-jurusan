# Roles and Permissions

## Role Matrix

| Capability | Admin Sistem | Admin Data | Kaprodi | GKM | Sekjur | Kajur |
|---|---:|---:|---:|---:|---:|---:|
| Konfigurasi sistem | ✓ |  |  |  |  |  |
| Master data | ✓ | ✓ | scope |  | ✓ |  |
| Input data |  | ✓ | ✓ | scope | ✓ |  |
| Upload evidence |  | ✓ | ✓ | ✓ | ✓ |  |
| Verifikasi evidence |  |  | scope | ✓ | ✓ |  |
| Evaluasi mutu |  |  | scope | ✓ | ✓ | ✓ |
| Menetapkan rekomendasi |  |  | scope | ✓ | ✓ | ✓ |
| Menjalankan tindak lanjut |  | scope | ✓ |  | ✓ |  |
| Verifikasi efektivitas |  |  |  | ✓ | ✓ | ✓ |
| Approval tingkat UPPS |  |  |  |  |  | ✓ |
| Merekomendasikan layak publik |  |  |  | ✓ | ✓ | ✓ |
| Approval publikasi |  |  |  |  | review | ✓ |
| Eksekusi publish setelah approval |  | ✓ |  |  | ✓ | ✓ |
| Lihat audit log | ✓ |  |  | ✓ | ✓ | ✓ |

## Separation of Duties

Sistem harus mencegah pola berikut untuk objek yang membutuhkan pengendalian mutu formal:

```text
Inputter = Evaluator = Approver
```

Admin Data boleh menyiapkan metadata publik dan menjalankan aksi publish, tetapi **tidak menentukan sendiri bahwa sebuah objek layak dipublikasikan**. Publication endpoint wajib memeriksa adanya keputusan approval yang sah.

## Scope

Kaprodi:

```text
scope = study_program_id
```

GKM:

```text
scope = UPPS + semua prodi yang menjadi ruang lingkup mutu
```

Kajur:

```text
scope = UPPS
```
