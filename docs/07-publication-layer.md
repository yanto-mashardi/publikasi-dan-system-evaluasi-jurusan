# Publication Layer

## Rule

Portal publik tidak melakukan direct read ke seluruh tabel internal.

Portal membaca:

1. view/projection publik;
2. endpoint publik terkontrol;
3. dokumen dengan visibility `PUBLIC`.

## Publication Decision

```text
publication_id
subject_type
subject_id
version_id
visibility
public_title
public_summary
field_policy
publication_start
publication_end
approved_by
published_by
published_at
status
```

## Field Policy

Contoh KPI:

Public:
- nama indikator;
- definisi ringkas;
- target;
- realisasi;
- capaian;
- status;
- tren;
- public_summary;
- progress tindak lanjut.

Internal only:
- catatan auditor;
- identitas responden;
- evidence privat;
- komentar reviewer;
- data personal;
- working score yang belum disahkan.

## Public View Example

```sql
CREATE VIEW public_kpi_projection AS
SELECT
    k.id,
    k.code,
    k.name,
    t.target_value,
    m.actual_value,
    m.achievement_percent,
    m.status,
    p.public_summary,
    p.published_at
FROM kpis k
JOIN kpi_targets t ON t.kpi_id = k.id
JOIN kpi_measurements m ON m.kpi_id = k.id
JOIN publications p
  ON p.subject_type = 'KPI_MEASUREMENT'
 AND p.subject_id = m.id
WHERE p.visibility = 'PUBLIC'
  AND p.status = 'PUBLISHED';
```

## Publication Queue

Admin publikasi melihat:

```text
READY FOR PUBLICATION
WAITING APPROVAL
SCHEDULED
PUBLISHED
EXPIRED
ARCHIVED
```

## Important

Tombol yang benar:

```text
Publish this approved version
```

Bukan:

```text
Create public copy
```
