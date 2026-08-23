# Architecture Audit — 23 August 2026

## Audit Objective

Memastikan perubahan menjadi sistem dinamis tidak menggeser tujuan awal aplikasi sebagai **Integrated UPPS Governance, Evaluation, and Public Transparency System** untuk Jurusan.

## Rule Utama yang Dipertahankan

1. **Single Source of Truth** — portal publik tidak mempunyai fakta substantif sendiri.
2. **Internal First** — data dibuat/dikelola pada workspace internal.
3. **Evaluate Before Publish** — data kinerja/mutu yang dipublikasikan harus melewati workflow yang relevan.
4. **Separation of Duties** — input, evaluation, approval, dan execution of publication dipisahkan.
5. **Generic Evaluation & Follow-up** — KPI, kurikulum, laboratorium, akreditasi dan domain lain memakai evaluation/follow-up engine yang sama.
6. **Accreditation as Consumer** — akreditasi memetakan data domain, bukan meminta input ulang fakta.
7. **Dynamic Administration** — Jurusan, Prodi, user, role, konten, Renstra, KPI, kurikulum, lab dan master lain dikelola dari database.
8. **Auditability** — record historis diarsipkan/versioned, tidak dihapus apabila sudah dipakai.

## Relevance to Jurusan / UPPS

Kebutuhan inti Jurusan tetap tercakup:

- tata pamong dan struktur organisasi;
- VMTS dan Renstra tingkat UPPS;
- visi keilmuan/strategi dan kinerja per Program Studi;
- KPI target–realisasi–evidence–evaluation–follow-up;
- kurikulum, profil lulusan, CPL, CPMK dan evaluasi kurikulum;
- laboratorium bersama lintas Prodi, equipment, utilization, maintenance dan K3L;
- SDM, penelitian, PkM, mahasiswa/lulusan dan kerja sama;
- penjaminan mutu dan bukti peningkatan berkelanjutan;
- akreditasi configurable;
- berita, dokumen dan transparansi publik.

## Regulatory Fit

Arsitektur tetap relevan terhadap kerangka Penjaminan Mutu Pendidikan Tinggi yang berlaku. Permendiktisaintek Nomor 39 Tahun 2025 mengatur SN Dikti, standar yang ditetapkan perguruan tinggi, SPM Dikti, akreditasi dan PDDikti. Permendiktisaintek Nomor 10 Tahun 2026 mengubah sebagian ketentuan tersebut, terutama terkait Program Studi, akreditasi, BAN-PT dan LAM, dengan orientasi penjaminan mutu yang adaptif dan peningkatan berkelanjutan.

Referensi:
- https://peraturan.bpk.go.id/Details/333967
- https://peraturan.bpk.go.id/Details/352678/permendikti-saintek-no-10-tahun-2026

Instrumen LAM Teknik 2025 juga menekankan hubungan VMTS UPPS, visi keilmuan Prodi, Renstra, kurikulum, CPL/CPMK, keterlibatan stakeholder dalam evaluasi kurikulum, tata pamong, tridharma, SDM, mahasiswa/luaran dan efektivitas SPMI. Arsitektur sistem sengaja menyimpan domain-domain tersebut sebagai source data yang kemudian dapat dipetakan ke framework akreditasi.

Referensi:
- https://lamteknik.or.id/akreditasi/instrumen-akreditasi
- https://lamteknik.or.id/akreditasi/kriteria-akreditasi-program-studi

## Findings and Corrections

### A. Program Study Scope

**Finding:** model awal cukup kuat untuk UPPS tetapi belum eksplisit untuk Renstra/VMTS/KPI per Prodi.

**Correction:** seluruh strategic object harus dapat memiliki scope UPPS atau Program Studi. Phase 5 tidak boleh dibangun sebelum scope ini tersedia.

### B. Roadmap Ordering

**Finding:** accreditation sebelumnya berada sebelum resource/extended domains.

**Correction:** Phase Resources dipindahkan sebelum Accreditation. Akreditasi harus membaca data yang telah tersedia.

### C. Role Documentation

**Finding:** role matrix lama belum sepenuhnya sama dengan dynamic RBAC implementation.

**Correction:** Admin Sistem mengelola master/system; Admin Data mengelola data/editorial; Kajur melakukan approval; evaluator dan verifier tetap terpisah.

### D. Dynamic Rendering

**Finding:** dokumentasi public menu masih menyebut dua Prodi secara literal.

**Correction:** daftar Prodi harus dihasilkan dari `study_programs` aktif. Nautika dan KPN adalah current data/seed, bukan batas arsitektur.

## Gate for Phase 5

Phase 5 boleh dimulai setelah:

- scope UPPS/Prodi diterapkan pada strategic objects;
- role/roadmap/documentation sinkron;
- Academic/OBE domain menggunakan dynamic/versioned data;
- curriculum evaluation menggunakan generic evaluation engine;
- public curriculum hanya berasal dari approved/published projection.
