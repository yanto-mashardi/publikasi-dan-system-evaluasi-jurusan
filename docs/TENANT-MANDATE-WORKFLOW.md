# Mandat kerja instrumen pada aplikasi Jurusan

Master menetapkan LAM, framework, struktur indikator, variabel, dan rubrik yang digunakan setiap Prodi. Tenant tidak mengubah template global; Tenant membagi tanggung jawab pemenuhannya.

## Urutan kerja

1. Admin Jurusan membuka **Akun & Mandat Indikator**.
2. Admin Jurusan membuat satu akun Kaprodi untuk setiap Prodi dan satu akun Kajur untuk scope seluruh Jurusan.
3. Admin Jurusan membaca nama indikator dan memetakannya:
   - **Prodi — Kaprodi** untuk kurikulum, pembelajaran, OBE, mahasiswa/lulusan, dan indikator lain yang menjadi kewenangan Prodi;
   - **Jurusan/UPPS — Admin Jurusan** untuk laboratorium bersama, SDM dan sumber daya bersama, tata kelola UPPS, serta indikator lain yang menjadi kewenangan Jurusan.
4. Penanggung jawab mengisi variabel, evidence, perhitungan, analisis, evaluasi, catatan LED, dan keputusan kandidat publik, lalu mengajukan hasil.
5. Kajur memvalidasi atau mengembalikan hasil.
6. Hanya Kajur yang dapat mempublikasikan hasil berstatus disetujui dan bertanda kandidat publik.

Pemetaan disimpan per pasangan assignment instrumen Prodi dan indikator. Nama indikator tetap berasal dari template yang didistribusikan Master. Perubahan mandat dicatat dalam audit log.

## Batas akses

- Admin Jurusan hanya dapat membuat akun `KAPRODI` dan `KAJUR` dalam Jurusannya.
- Akun Kaprodi wajib memiliki tepat satu scope Prodi dan tidak dapat mengisi indikator Prodi lain.
- Akun Kajur memakai scope organisasi/Jurusan dan menjadi validator.
- Indikator yang belum dipetakan tidak dapat diisi.
- Tombol pada cockpit mengikuti mandat, tetapi pembatasan utama juga diterapkan pada API sehingga tidak dapat dilewati melalui permintaan langsung.

## Memperbarui Tenant lokal

Codebase Tenant lokal adalah salinan terpisah. Setelah Master menerima versi baru, buka **Detail** aplikasi Jurusan dan klik **Perbarui kode aplikasi lokal**. Master memverifikasi `.env.local` serta nama database sebelum menyalin perubahan dan tidak menimpa konfigurasi Tenant.

Setelah sinkronisasi, jalankan pada folder Tenant:

```powershell
npm install
npm run db:push
npm run dev -- -p 3006
```
