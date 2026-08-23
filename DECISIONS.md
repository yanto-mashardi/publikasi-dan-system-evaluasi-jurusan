# Architecture Decision Records

## ADR-001 — One Source of Truth
**Decision:** portal publik dan sistem internal menggunakan data sumber yang sama. **Consequence:** dilarang membuat tabel publik terpisah untuk objek substantif.

## ADR-002 — Public Portal as Projection
**Decision:** portal publik hanya menampilkan objek yang memenuhi publication policy. **Consequence:** perubahan publik selalu dapat ditelusuri ke record internal.

## ADR-003 — Generic Evaluation Engine
**Decision:** seluruh objek mutu menggunakan satu mekanisme evaluasi generik. **Consequence:** KPI, kurikulum, laboratorium, akreditasi, dan domain lain tidak memerlukan mesin evaluasi sendiri.

## ADR-004 — Generic Follow-up Engine
**Decision:** tindak lanjut berasal dari rekomendasi/temuan dan dikelola lintas domain.

## ADR-005 — Accreditation as Mapping Layer
**Decision:** data akreditasi tidak diduplikasi. Instrumen memetakan kriteria ke data dan evidence yang telah ada.

## ADR-006 — Modular Monolith First
**Decision:** fase awal menggunakan modular monolith. **Rationale:** sederhana, ringan, auditable, dan sesuai skala organisasi Jurusan/UPPS.

## ADR-007 — Separation of Duties
**Decision:** inputter, verifier, evaluator, approver, dan publisher merupakan hak yang berbeda. **Consequence:** Admin Sistem/Admin Data tidak otomatis memiliki hak evaluasi mutu.

## ADR-008 — Publication Decision Is Separate from Execution
**Decision:** evaluator/reviewer/approver menentukan kelayakan publikasi; Admin Data hanya mengeksekusi publication terhadap objek yang sudah memenuhi approval dan publication policy. **Consequence:** Admin Data tidak dapat mem-bypass evaluation dan approval.
