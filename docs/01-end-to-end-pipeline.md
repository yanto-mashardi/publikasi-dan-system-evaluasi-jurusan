# End-to-End Pipeline

## A. Planning Pipeline

```mermaid
flowchart LR
    V[Visi] --> M[Misi]
    M --> T[Tujuan]
    T --> S[Sasaran Strategis]
    S --> P[Program Strategis]
    S --> K[KPI]
    K --> TG[Target Tahunan]
```

## B. Performance Pipeline

```mermaid
flowchart LR
    TG[Target] --> R[Realisasi]
    R --> EV[Evidence]
    TG --> CALC[Calculation]
    R --> CALC
    CALC --> ACH[Capaian]
    ACH --> STATUS[Status]
```

## C. Quality Pipeline

```mermaid
flowchart LR
    A[Objek] --> B[Standar/Target]
    A --> C[Data Aktual]
    B --> D[Gap Analysis]
    C --> D
    D --> E[Analisis]
    E --> F[Temuan]
    F --> G[Akar Masalah]
    G --> H[Rekomendasi]
    H --> I[Tindak Lanjut]
    I --> J[Verifikasi]
    J --> K{Efektif?}
    K -- Ya --> L[Closed]
    K -- Tidak --> I
```

## D. Publication Pipeline

```mermaid
flowchart LR
    A[Internal Object] --> B[Verified]
    B --> C[Evaluated]
    C --> D[Approved]
    D --> E{Public Policy}
    E -- Allowed --> F[Public Projection]
    E -- Denied --> G[Internal Only]
    F --> H[Portal Publik]
```

## E. Accreditation Pipeline

```mermaid
flowchart LR
    A[Framework] --> B[Criterion]
    B --> C[Indicator]
    C --> D[Data Mapping]
    D --> E[Evidence Mapping]
    E --> F[Self Assessment]
    F --> G[Gap]
    G --> H[Improvement Action]
```

## F. Governance Loop

```text
PLAN
  ↓
EXECUTE
  ↓
MEASURE
  ↓
EVALUATE
  ↓
IMPROVE
  ↓
APPROVE
  ↓
PUBLISH
  ↓
REVIEW NEXT CYCLE
```
