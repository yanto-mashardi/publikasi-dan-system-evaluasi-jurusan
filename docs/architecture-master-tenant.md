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

### Provisioning lokal dan server/VPS

- **Simulasi lokal:** Master membuat database, menyalin codebase tanpa `.git`, `.next`, `node_modules`, cache, dan `.env.local` Master ke folder Tenant baru, lalu menulis `.env.local` khusus Tenant. Lokasi induk dapat ditentukan melalui `LOCAL_TENANT_ROOT`; jika tidak diisi, folder dibuat di samping folder Master. `npm install` dan proses `npm run dev` tetap dijalankan pengguna agar port dapat dipilih dengan aman.
- **Server/VPS:** Master membuat database, akun awal, distribusi instrumen, registry federasi, dan menampilkan konfigurasi deployment. Master tidak membuat folder pada laptop dan tidak menganggap domain sudah online. Codebase harus dipasang pada VPS, environment Tenant diisi, aplikasi di-build/dijalankan, kemudian DNS dan reverse proxy diarahkan ke instance tersebut.

Status yang digunakan harus dibaca secara harfiah: `DATABASE_READY` berarti database tersedia tetapi aplikasi belum online; `TENANT_LOCAL_READY` berarti folder dan konfigurasi lokal sudah dibuat tetapi proses aplikasi belum dijalankan; status koneksi federasi `ONLINE` baru diperoleh setelah endpoint Tenant benar-benar dapat dijangkau.

## Workflow Tenant

Admin/Kaprodi mengisi variabel dan evidence → mesin menghitung berdasarkan rumus/rubrik immutable → Kaprodi/GKM menganalisis → Kajur menyetujui atau mengembalikan → Kajur/UPPS menerbitkan hanya kandidat publik yang memenuhi policy → Master membaca ringkasan melalui API federasi, bukan database Tenant secara langsung.
