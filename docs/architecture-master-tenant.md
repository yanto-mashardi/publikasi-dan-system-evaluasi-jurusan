# Arsitektur Master–Tenant

## Batas aplikasi

`APP_MODE=MASTER` adalah control plane. Ia menyimpan registry aplikasi Jurusan, pekerjaan provisioning, registry LAM/template global, distribusi template, dan snapshot federasi. Master tidak menjadi tempat pengisian KPI atau evidence Jurusan.

Database Master disiapkan dengan `npm run db:push` lalu `npm run bootstrap:master`. Bootstrap ini hanya membuat identitas teknis control-plane dan akun Super Admin; ia tidak membuat Prodi contoh.

`APP_MODE=TENANT` adalah satu aplikasi untuk satu Jurusan/UPPS. Setiap Tenant memakai domain dan database sendiri, tetapi menjalankan release/codebase yang sama.

## Kepemilikan tabel

| Kelompok | Pemilik |
|---|---|
| `master_tenant_applications`, `master_tenant_provisioning_jobs`, `master_tenant_template_distributions`, `federated_applications` | MASTER |
| `accreditation_agencies`, `accreditation_frameworks`, klaster, kriteria, indikator, variabel, rubrik, evidence requirements | MASTER sebagai sumber; salinan versi immutable didistribusikan ke TENANT |
| `organizations`, `study_programs`, `users`, role/scope lokal | TENANT |
| Renstra, VMTS, OBE, KPI, pengukuran, evidence, evaluasi, temuan, tindak lanjut | TENANT |
| Assessment akreditasi, nilai variabel, sumber evidence, approval, publikasi | TENANT |
| Berita dan data portal publik | TENANT |
| `audit_logs` | Keduanya, tetapi hanya mencatat aktivitas database aplikasi masing-masing |

## Provisioning

Master mencatat identitas Tenant, domain, nama database, Prodi, dan admin awal. Bila `MASTER_DATABASE_ADMIN_URL` tersedia, Master membuat database baru, menyalin struktur tabel Tenant tanpa data operasional, menyalin baseline role/permission/policy, lalu membuat organisasi, Prodi, dan akun Admin Jurusan.

Deployment domain tetap menjadi tanggung jawab platform hosting. Instance memakai `APP_MODE=TENANT`, `DATABASE_URL` menuju database baru, `AUTH_SECRET` unik, serta `FEDERATION_EXPORT_TOKEN` unik.

## Workflow Tenant

Admin/Kaprodi mengisi variabel dan evidence → mesin menghitung berdasarkan rumus/rubrik immutable → Kaprodi/GKM menganalisis → Kajur menyetujui atau mengembalikan → Kajur/UPPS menerbitkan hanya kandidat publik yang memenuhi policy → Master membaca ringkasan melalui API federasi, bukan database Tenant secara langsung.
