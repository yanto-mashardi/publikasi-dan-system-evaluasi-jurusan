# Federasi aplikasi Jurusan

## Prinsip

- Satu instalasi aplikasi dan satu database hanya untuk satu Jurusan/UPPS.
- Program Studi di bawah Jurusan tersebut tetap dikelola dalam instalasi yang sama.
- Jurusan lain menggunakan instalasi dan database baru.
- Super Admin pusat tidak mengubah data operasional Jurusan lain. Pusat hanya menarik ringkasan monitoring.

## Konfigurasi aplikasi Jurusan

Tambahkan nilai berikut pada `.env.local` setiap instalasi Jurusan:

```text
FEDERATION_APPLICATION_CODE=KEMARITIMAN
FEDERATION_APPLICATION_NAME=Jurusan Kemaritiman
FEDERATION_EXPORT_TOKEN=ganti-dengan-token-acak-minimal-24-karakter
```

Gunakan token berbeda untuk setiap aplikasi Jurusan. Jangan memasukkan token ke Git.

Endpoint yang dibaca pusat:

```text
GET /api/federation/summary
Authorization: Bearer <FEDERATION_EXPORT_TOKEN>
```

Endpoint hanya mengirim identitas aplikasi dan hitungan ringkas. Password, evidence, isi LED, data personal, serta transaksi rinci tidak dikirim.

## Konfigurasi Super Admin pusat

1. Masuk sebagai Super Admin.
2. Buka **Monitoring Aplikasi Jurusan**.
3. Isi kode aplikasi, nama Jurusan, URL dasar, dan token aplikasi tujuan.
4. Tekan **Tambah aplikasi**.
5. Tekan **Sinkronkan** untuk memeriksa koneksi dan memperbarui snapshot.
6. Gunakan **Hapus dari monitoring** untuk melepaskan koneksi. Tindakan ini hanya mengarsipkan registry pusat dan tidak menghapus database Jurusan.

Token koneksi disimpan terenkripsi menggunakan kunci turunan dari `AUTH_SECRET`.
