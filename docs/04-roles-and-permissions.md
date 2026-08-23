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
| Menandai publishable |  | scope |  | ✓ | ✓ | ✓ |
| Publish |  | ✓ |  |  | ✓ | ✓ |
| Lihat audit log | ✓ |  |  | ✓ | ✓ | ✓ |

## Separation of Duties

Sistem harus dapat mencegah pola:

```text
Inputter = Evaluator = Approver
```

untuk objek yang membutuhkan pengendalian mutu formal.

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
