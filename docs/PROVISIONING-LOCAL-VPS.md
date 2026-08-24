# Provisioning aplikasi Jurusan

Satu Jurusan menggunakan satu instance aplikasi Tenant dan satu database terpisah. Master menyimpan template LAM, membuat database dan akun awal, mendistribusikan instrumen ke Prodi, serta memantau Tenant melalui federasi.

## Pilihan simulasi lokal

Pilih **Simulasi lokal — buat folder Tenant otomatis** pada menu Aplikasi Jurusan. Master akan:

1. membuat database Tenant;
2. mengisi Jurusan, Prodi, instrumen aktif, role, dan Admin Jurusan;
3. membuat folder baru dengan nama Jurusan di `LOCAL_TENANT_ROOT` atau di samping folder Master;
4. menyalin codebase tanpa `.git`, `.next`, `node_modules`, cache, atau environment Master;
5. membuat `.env.local` Tenant yang mengarah ke database baru.

Master tidak menjalankan proses Tenant otomatis agar port tidak bentrok. Setelah berhasil, buka PowerShell pada folder yang ditampilkan dan jalankan:

```powershell
npm install
npm run dev -- -p 3006
```

Jika port tersebut dipakai, gunakan port lain. Login Tenant berada di `http://localhost:PORT/internal/login`. Gunakan email dan password Admin Jurusan yang dimasukkan saat provisioning.

Folder dengan nama yang sama tidak pernah ditimpa. Pindahkan folder lama atau gunakan identitas Jurusan yang benar sebelum mencoba lagi.

## Pilihan server/VPS

Pilih **Server/VPS — siapkan konfigurasi deployment**. Master membuat database, data awal, distribusi instrumen, token federasi, dan registry, tetapi tidak membuat folder pada laptop serta tidak membuat domain langsung online.

Pada VPS:

1. pull atau clone codebase yang sama;
2. buat satu direktori deployment untuk Tenant;
3. buat `.env.local` dengan `APP_MODE=TENANT`, URL database Tenant, `AUTH_SECRET` unik, dan `FEDERATION_EXPORT_TOKEN` hasil provisioning;
4. jalankan `npm install`, `npm run build`, lalu `npm run start` menggunakan process manager;
5. arahkan DNS dan reverse proxy domain ke port Tenant;
6. sinkronkan aplikasi melalui menu Federasi pada Master.

Jangan memakai `.env.local` Master pada Tenant. Jangan menggunakan satu `AUTH_SECRET` atau token federasi untuk beberapa Jurusan.

## Arti status

- `DATABASE_READY`: database dan data awal tersedia, aplikasi belum dinyatakan berjalan.
- `TENANT_LOCAL_READY`: folder serta `.env.local` lokal tersedia, tetapi proses aplikasi masih harus dijalankan.
- `ONLINE`: endpoint federasi Tenant telah berhasil dijangkau oleh Master.
- `FAILED`: provisioning gagal; baca pesan kesalahan dan jangan menganggap database atau domain siap.
