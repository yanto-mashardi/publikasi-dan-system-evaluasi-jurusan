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

## Menghapus provisioning yang salah

Gunakan tombol **Hapus permanen** hanya dari daftar **Aplikasi Jurusan**. Super Admin harus mengetik ulang kode Jurusan. Sistem menghapus database Tenant, distribusi template, riwayat pekerjaan provisioning, registry federasi, dan record aplikasi Master. Untuk provisioning lokal baru, folder Tenant ikut dihapus hanya setelah `.env.local` di dalamnya terbukti memakai mode `TENANT` dan menunjuk ke database yang sama. Folder yang tidak dapat diverifikasi tidak akan dihapus otomatis.

Penghapusan permanen tidak dapat dibatalkan. Jangan menggunakannya pada Tenant produksi sebelum database dan berkas evidence dicadangkan.

## Detail dan pemulihan akun Jurusan

Tombol **Detail** pada daftar Aplikasi Jurusan membaca database Tenant dan menampilkan identitas, Prodi, instrumen yang terpasang, serta akun pengelola dan role-nya. Password lama tidak pernah ditampilkan karena hanya hash yang disimpan. Jika pengguna lupa password, Super Admin dapat menetapkan password baru minimal 10 karakter dari panel detail; tindakan ini dicatat dalam audit log tanpa menyimpan password baru pada log.

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

## Image Docker untuk VPS kecil

Laptop lokal tetap memakai `npm run dev`. Docker hanya digunakan pada VPS. Repository menghasilkan satu image yang sama untuk mode `MASTER` dan `TENANT`; perbedaannya ditentukan oleh environment saat container dijalankan.

GitHub Actions menerbitkan image ke GitHub Container Registry dengan tag branch, tag commit `sha-...`, tag rilis, dan `stable` khusus `main`. Untuk pengujian branch Docker gunakan tag branch. Untuk produksi gunakan tag rilis atau SHA, bukan mengandalkan tag bergerak.

VPS 1 vCPU/2 GB RAM tidak melakukan build. VPS hanya menjalankan `docker pull`. MySQL dan Caddy tetap berjalan langsung pada host. Container aplikasi mengakses MySQL host melalui `host.docker.internal`, dipublikasikan hanya ke `127.0.0.1:PORT`, lalu Caddy meneruskan domain ke port lokal tersebut.

Template uji tersedia di `deploy/docker/compose.instance.yml`:

1. salin `.env.instance.example` menjadi `.env` dan isi image, nama container, port lokal, serta nama volume;
2. salin `.env.runtime.example` menjadi `.env.runtime` dan isi mode aplikasi serta rahasia unik;
3. pastikan akun MySQL hanya menerima koneksi dari jaringan bridge Docker dan tidak membuka port 3306 ke internet;
4. jalankan `docker compose -f compose.instance.yml pull` lalu `docker compose -f compose.instance.yml up -d`;
5. pastikan `docker inspect --format '{{.State.Health.Status}}' NAMA_CONTAINER` menghasilkan `healthy`;
6. baru arahkan Caddy ke `127.0.0.1:HOST_PORT`.

File `.env.runtime` tidak boleh disimpan ke Git. Evidence ditempatkan pada volume Docker permanen. Mengganti image/container tidak menghapus database atau volume evidence.

## Arti status

- `DATABASE_READY`: database dan data awal tersedia, aplikasi belum dinyatakan berjalan.
- `TENANT_LOCAL_READY`: folder serta `.env.local` lokal tersedia, tetapi proses aplikasi masih harus dijalankan.
- `ONLINE`: endpoint federasi Tenant telah berhasil dijangkau oleh Master.
- `FAILED`: provisioning gagal; baca pesan kesalahan dan jangan menganggap database atau domain siap.
