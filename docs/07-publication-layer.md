# Publication Layer

## Rule

Portal publik tidak melakukan direct read ke seluruh tabel internal. Portal membaca projection publik, endpoint publik terkontrol, dan dokumen dengan visibility `PUBLIC`.

## Publication Decision

```text
publication_id
subject_type
subject_id
policy_id
visibility
public_title
public_summary
field_policy_snapshot
publication_start
publication_end
approved_by
published_by
published_at
status
```

## Field Policy

Contoh KPI yang boleh dipublikasikan: nama indikator, target, realisasi, capaian, status, tren, `public_summary`, dan progres tindak lanjut yang telah disahkan. Data internal seperti catatan auditor mentah, identitas responden, evidence privat, komentar reviewer, data personal, dan working score yang belum disahkan tetap internal.

## Publication Queue

```text
READY FOR PUBLICATION
WAITING APPROVAL
SCHEDULED
PUBLISHED
EXPIRED
ARCHIVED
```

## Separation of Publication Decision and Execution

```text
Evaluator/GKM → recommendation for publication
Sekjur → review administratif
Kajur/authorized approver → APPROVED
Admin Data → publication.execute
Portal Publik → read-only projection
```

Admin Data tidak menentukan kelayakan publikasi. Endpoint publikasi memeriksa approval, policy aktif, dan status sumber sebelum membuat record `PUBLISHED`.

Tombol yang benar adalah `Publish this approved version`, bukan `Create public copy`.
