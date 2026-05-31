E-LIBRARY ADMIN PANEL
=====================

Versi ini disesuaikan dengan screenshot desain Figma yang dikirim.

Cara menjalankan:
1. Ekstrak ZIP.
2. Buka folder e-library-admin-figma-final.
3. Klik dua kali index.html.
4. Login dummy:
   Email    : admin@elibrary.com
   Password : admin123

Halaman:
- index.html
- dashboard.html
- data-buku.html
- form-buku.html
- data-kategori.html
- data-anggota.html
- peminjaman.html
- pengembalian.html
- laporan.html
- laporan-detail.html
- pengaturan.html

Fitur aktif:
- Login validation
- Toggle sidebar responsive
- Search dan sort data buku
- Detail buku via modal
- Form tambah buku dengan validasi
- Upload cover mock/preview nama file
- Data kategori tambah, edit, hapus via modal
- Data anggota tambah, edit, hapus via modal
- Filter role anggota
- Peminjaman mock submit
- Pengembalian proses kembali via modal
- Laporan filter mock
- Cetak laporan
- Export mock
- Pengaturan profil simpan mock

Catatan:
Project ini client-side only. Data belum terhubung ke database.


PATCH KHUSUS PERMINTAAN TERAKHIR
================================
Versi ini mempertahankan tampilan dari desain sebelumnya.
Yang diubah hanya fungsi yang diminta:
- Login hanya bisa masuk dengan email admin@elibrary.com dan password admin123.
- Search icon tetap kecil dan search tabel berfungsi.
- Foto profil bisa diganti dan dihapus.
- Tab Sistem & Denda dan Keamanan berfungsi.
- Print laporan dirapikan agar mudah dibaca.
- Data peminjaman baru masuk ke halaman Peminjaman, Pengembalian, dan Laporan.
- Tambah anggota punya ID otomatis, No Telepon, dan Tanggal Bergabung.
- Kategori baru sinkron ke form tambah buku dan filter data buku.

PATCH TERBARU:
- Logo login memakai logo Universitas Pamulang.
- Search di topbar aktif untuk data buku, kategori, anggota, peminjaman, pengembalian, dan laporan.
- Notifikasi kanan atas menampilkan jumlah keterlambatan dan info penting lain.
- Export Excel aktif dan mengunduh file .xls.
- Data awal berisi 14 kategori, masing-masing 50 buku, total 700 buku.
- Data awal anggota berisi 50 orang.
- Pagination Data Buku, Data Kategori, Data Anggota, dan Laporan aktif.
- Dashboard dan grafik disinkronkan dengan data lokal.
- Login hanya berhasil memakai email admin@elibrary.com dan password admin123.
