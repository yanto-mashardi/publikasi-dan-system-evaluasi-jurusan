# Data Model

## Core Relationships

```mermaid
erDiagram
    ORGANIZATION ||--o{ STUDY_PROGRAM : manages
    ORGANIZATION ||--o{ STRATEGIC_GOAL : owns
    STRATEGIC_GOAL ||--o{ KPI : has
    KPI ||--o{ KPI_TARGET : targets
    KPI ||--o{ KPI_MEASUREMENT : measures
    KPI_MEASUREMENT ||--o{ EVIDENCE : supports
    KPI_MEASUREMENT ||--o{ EVALUATION : evaluated_by
    EVALUATION ||--o{ FINDING : produces
    EVALUATION ||--o{ RECOMMENDATION : produces
    RECOMMENDATION ||--o{ FOLLOW_UP : implemented_by
    FOLLOW_UP ||--o{ EVIDENCE : supported_by
    ORGANIZATION ||--o{ PUBLICATION : publishes
```

## Generic Subject Reference

Untuk evaluation, evidence, approval, dan publication:

```text
subject_type
subject_id
```

Contoh:

```text
subject_type = KPI_MEASUREMENT
subject_id   = 193
```

atau:

```text
subject_type = CURRICULUM
subject_id   = 28
```

Pendekatan ini mengurangi jumlah tabel lintas modul.

## Versioned Entities

Minimal:

- vision/mission;
- Renstra;
- curriculum;
- accreditation framework;
- policy/document.

Gunakan:

```text
version_number
effective_from
effective_to
status
supersedes_id
```
