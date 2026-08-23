# Simulasi alur akreditasi dinamis

Dokumen ini menjelaskan pembagian ruang kerja. Semua akun di bawah hanya untuk simulasi lokal dan dibuat oleh `npm run setup:local`.

| Peran | Akun simulasi | Password awal | Tugas |
| --- | --- | --- | --- |
| Super Admin | akun dari `.env.local` | dari `.env.local` | Membuat Jurusan/UPPS, Prodi, pengguna, role, lembaga, framework, kriteria, indikator, variabel, rumus, rubrik, kebutuhan evidence, assignment, dan kebijakan publikasi. Tidak mengisi atau menyetujui evaluasi unit. |
| Admin Jurusan | `admin.jurusan@local.test` | `AdminJurusan123!` | Mengisi data dan evidence, menyimpan draf, menghitung indikator, menulis analisis/evaluasi/catatan LED, lalu mengajukan evaluasi. |
| Kaprodi D3 Nautika | `kaprodi.nautika@local.test` | `Kaprodi123!` | Mengisi dan menyetujui evaluasi hanya dalam scope D3 Nautika. |
| Kajur/UPPS | `kajur.kemaritiman@local.test` | `Kajur123!` | Menyetujui pada lingkup UPPS dan memublikasikan record yang sudah disetujui serta ditandai kandidat publik. |

Password simulasi dibuat oleh script bootstrap dan dapat diganti melalui Super Admin. Jangan gunakan password simulasi di server produksi.

## Urutan simulasi

1. Masuk sebagai Super Admin dan buka **Registry Instrumen Akreditasi**.
2. Buat framework DRAFT atau gunakan konfigurasi demo yang berlabel `CONTOH`.
3. Dalam framework DRAFT, tambah/ubah/arsipkan klaster INPUT–PROCESS–OUTPUT/OUTCOME, kriteria, indikator, variabel, rumus, rubrik, dan kebutuhan evidence.
4. Tautkan framework ACTIVE ke Program Studi melalui assignment.
5. Keluar, lalu masuk sebagai Admin Jurusan atau Kaprodi dan buka **Cockpit Akreditasi**.
6. Pilih Jurusan/Prodi, framework, periode, dan kriteria. Isi variabel; sistem menghitung hasil, skor rubrik, dan skor berbobot. Lengkapi evidence, analisis, evaluasi/gap, serta catatan LED. Simpan draf atau ajukan.
7. Kaprodi menyetujui record scope Prodi. Kajur/UPPS menerbitkan record yang sudah `APPROVED` dan `PUBLIC_CANDIDATE`. Hasilnya muncul di `/akreditasi`.

VMTS diisi manual pada **VMTS & Renstra**. Pernyataan DRAFT dapat ditambah dan diarsipkan. Setelah persetujuan menjadi `EFFECTIVE`, Kajur/UPPS dapat menerbitkannya sesuai kebijakan publikasi.

## Batas data resmi

Framework `LAMTEKNIK-2025-DEMO-D3` dan seluruh record berawalan `CONTOH` adalah data simulasi, bukan matriks resmi LAM Teknik. Registry memang disiapkan agar indikator resmi dapat dimasukkan atau diimpor tanpa mengubah kode aplikasi. Jangan mengaktifkan framework institusional sebelum kode, rumus, rubrik, bobot, dan kebutuhan evidence diverifikasi terhadap dokumen resmi untuk jenjang/skema yang dipilih.
