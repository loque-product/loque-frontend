# Catatan desain: audit visual Prompt 4

Satu baris per perubahan. Keputusan akhir mengikuti keterbacaan.

## Tanda khas AI
- Emoji: tidak ditemukan di kode sumber; tidak ada yang dihapus.
- Ungu dan gradien: tidak ditemukan. `.hatch` (garis arsir blok waktu) dipertahankan karena fungsional, bukan hiasan.
- Button `secondary`: border dihapus; kini latar `slate-100` (hover `slate-200`).
- Card: border dihapus; pemisahan dengan latar dan satu bayangan `shadow-card`.
- Banner dan StatCard: border berwarna dihapus; nada dibedakan dengan latar dan teks.
- Kotak, daftar, dan pemilih pilihan (`rounded-lg border ...`) di fitur booking, billing, toko, jadwal, invoice, pembayaran, laporan, dan struk: border diganti latar `slate-50`; pilihan terpilih memakai `bg-primary-100`.
- Slot jam di wizard: border dihapus; tersedia `slate-100`, tak tersedia `slate-50`, terpilih `primary-700`.
- Timeline staf: garis aksen kiri (`border-l-4`) dan border blok dihapus; status dibedakan latar dan teks. Legenda disesuaikan.
- Kartu ringkasan Void: garis aksen kiri dan ikon dalam lingkaran berwarna dihapus; ikon 1rem sejajar dengan label; angka memakai `tabular-nums`.
- StatCard: ikon dalam kotak berwarna dihapus; ikon 1rem sejajar dengan label.
- EmptyState dan ErrorState: lingkaran ikon dihapus, rata kiri, teks singkat dan satu aksi. Prop `icon` dihapus.
- Layar status booking: lingkaran centang dan tengah-rata dihapus; rata kiri.
- Avatar profil barber: tumpang tindih dengan sampul dan border putih dihapus.
- Ikon `size-5` dan `size-6` pada tombol dan baris: diperkecil menjadi 1rem (21 tempat). Tab bawah tetap 1,25rem.
- Huruf kapital semua: dihapus dari judul kolom tabel, grup combobox, label sidebar, legenda ServicePicker.
- Jarak huruf lebar pada kode booking, kata sandi sementara, dan hitung mundur: dihapus.
- `Booking Baru`, `Catatan Owner`: menjadi sentence case.
- Label tombol dan teks: tidak ada teks promosi ditemukan; hero Beranda sudah rata kiri dengan foto sebagai konten utama.
- Placeholder nama toko tetap ("Barber Indra Hair Studio"): diganti "Loque" atau "Toko".
- Gambar: `loading="lazy"` dan `decoding="async"` ditambahkan pada galeri, moderasi, profil toko, dan unggah.

## Tipografi
- Skala Tailwind dikunci ke 0,75, 0,875, 1, 1,25, 1,75 (`text-display`), dan 2,5 rem (`text-hero`); ukuran bawaan lain dimatikan di `index.css`.
- `text-title` 1,5 menjadi 1,25rem; `text-section` 1,125 menjadi 1rem. Alasan: judul halaman aplikasi terbaca lebih rapat dan sesuai skala; judul besar saja memakai Newsreader.
- `text-lg`, `text-3xl`, `text-4xl` diganti ke `text-base`, `text-display`, `text-hero`.
- Newsreader hanya pada judul 1,75rem atau lebih (hero Beranda, Info toko, nama barber). Judul Tautan saya tidak lagi memakai Newsreader.
- Bobot: `font-bold` diganti `font-semibold`.
- Tinggi baris isi 1,5 dan judul 1,2 lewat token teks.
- Kode booking dan angka penting memakai `tabular-nums`.

## Komponen
- Tombol kecil: 2rem (`h-8`) dengan area sentuh 2,75rem lewat elemen semu tak terlihat; `icon-sm` 2rem dengan area sentuh yang sama. Tombol utama tetap 2,75rem.
- Input, combobox, dan pilihan formulir tetap memakai border 1px; pemisah daftar dan tabel tetap.
- Skeleton: tetap berdenyut halus (indikator pemuatan fungsional) dan dimatikan oleh `prefers-reduced-motion`.
- Gerak lain hanya `transition-colors` dan transisi tinggi 150 ms.

## Yang tidak diubah
- Token warna, struktur folder, alur, dan kontrak layanan tidak diubah (hanya penambahan kontrak barber di Prompt 3).
- Cek manual pada lebar 20 sampai 80 rem sebaiknya dilakukan di peramban dengan backend sungguhan; belum ada pemeriksaan visual otomatis.
