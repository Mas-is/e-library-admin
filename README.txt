E-LIBRARY ADMIN PANEL
=====================

Versi ini disesuaikan dengan screenshot desain Figma yang dikirim.

Cara menjalankan:
1. Ekstrak ZIP.
2. Buka folder e-library-admin-figma-final.
3. Klik dua kali index.html.
4. Login menggunakan akun admin atau anggota yang sudah disiapkan pada sistem.

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
- Login admin menggunakan validasi email dan password.
- Search icon tetap kecil dan search tabel berfungsi.
- Foto profil bisa diganti dan dihapus.
- Tab Sistem & Denda dan Keamanan berfungsi.
- Print laporan dirapikan agar mudah dipinjam.
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
- Login admin dan anggota menggunakan validasi akun.

UPDATE MEMBER PORTAL
- Login anggota menggunakan email anggota yang ada di data anggota dan password yang sudah disiapkan pada sistem.
- Halaman anggota: anggota-dashboard.html, anggota-katalog.html, anggota-riwayat.html, anggota-profil.html
- Tampilan anggota mengikuti existing UI admin: sidebar kiri, topbar, stat card, panel, tabel, katalog buku.


UPDATE PORTAL ANGGOTA:
- Login mendukung admin dan anggota, tanpa menampilkan kredensial di UI.
- Halaman anggota: dashboard, katalog buku, peminjaman saya, pengembalian, riwayat, profil.
- Profil anggota mendukung foto profil, role readonly, dan data tersinkron ke tampilan anggota.
- Pengembalian anggota menggunakan alur ajukan pengembalian lalu admin konfirmasi.
- Notifikasi anggota menampilkan jatuh tempo dekat, terlambat, dan menunggu konfirmasi.

UPDATE FINAL:
- Tombol Buka Dokumentasi aktif dan membuka halaman dokumentasi admin.
- Portal anggota memiliki halaman Bantuan.
- Cover buku dibuat otomatis dari judul, kategori, penulis, dan tahun.
- Tampilan diperkuat agar tetap nyaman dibuka di desktop maupun handphone.

UPDATE FIX BUG DETAIL & STATUS PEMINJAMAN:
- Modal Detail Buku diperbaiki agar teks dan tabel tidak keluar area modal.
- Cover buku dibuat lebih variatif berdasarkan judul dan kategori, bukan seragam biru.
- Buku yang sudah dipinjam anggota dapat dipantau melalui fitur Lihat Status.
- Tombol Lihat Status muncul untuk memantau status pengajuan/peminjaman, bukan untuk membuka konten buku online.
- Ditambahkan akun anggota role Dosen di data awal sistem tanpa menampilkan kredensial di UI.
- Data memakai localStorage versi baru agar perubahan tampil bersih setelah deploy.


UPDATE FINAL - REGISTER & APPROVAL AKUN
- Portal login sudah memiliki menu daftar akun anggota.
- Akun baru berstatus Menunggu Persetujuan dan belum bisa login sebelum disetujui admin.
- Admin dapat menyetujui atau menolak pendaftaran melalui menu Data Anggota.
- Admin juga dapat membuat akun anggota manual dengan role Mahasiswa atau Dosen serta mengisi kata sandi akun.
- Kredensial akun tidak ditampilkan pada halaman login.
