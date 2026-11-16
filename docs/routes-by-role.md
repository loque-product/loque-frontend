# Rute per peran dan kemampuannya

Sumber: `src/app/router.tsx`, `src/app/routes/routeConfig.ts`, dan matriks izin `can()` di `src/features/auth/domain/permissions.ts`. Untuk rute staf, kemampuan per layar diturunkan dari matriks izin dan dari tempat layar memanggil `can()`. Pemanggilan `can()` hanya saya periksa di detail booking, tagihan, laporan, dan staf; layar lain belum saya baca satu per satu.

## Tamu (belum masuk)

| Rute | Yang bisa dilakukan |
|---|---|
| `/` | Melihat beranda, "Booking Baru" (diarahkan ke login) |
| `/barber`, `/b/:slug` | Menelusuri dan menyaring barber, melihat profil, galeri, ulasan, melaporkan foto (tanpa login) |
| `/toko` | Info toko, jam buka, galeri, melaporkan foto |
| `/syarat`, `/privasi`, `/bantuan` | Membaca syarat, privasi, FAQ |
| `/masuk` | Login Google (Customer) |
| `/masuk/kembali` | Titik kembali setelah login Google |
| `/staf/masuk` | Login email dan kata sandi (Staf dan Barber) |

## Customer

Semua rute kecuali `/akun/lengkapi` juga mewajibkan profil lengkap. Tanpa profil lengkap, customer diarahkan ke `/akun/lengkapi`.

| Rute | Yang bisa dilakukan |
|---|---|
| `/` dan halaman publik di atas | Sama dengan tamu, ditambah kartu booking mendatang, "Pesan lagi", lonceng, dan tab bawah |
| `/akun/lengkapi` | Mengisi nama dan nomor WhatsApp |
| `/booking/data-tamu`, `/layanan`, `/barber`, `/jadwal`, `/ringkasan` | Membuat booking: pilih tamu, layanan, barber, jam, lalu bayar. Ditolak selama masih ada hold |
| `/booking/status/:id` | Memantau hold 15 menit, mencoba bayar lagi, melihat sukses, habis waktu, atau pembayaran terlambat |
| `/booking-saya` | Daftar booking sendiri: Mendatang, Selesai, Dibatalkan |
| `/booking-saya/:id` | Detail, bayar, tambah ke kalender, WhatsApp toko, batalkan (hanya sebelum jam mulai) |
| `/booking-saya/:id/transaksi` | Melihat transaksi dan mengunduh bukti PNG |
| `/ulasan/:bookingId` | Menulis, mengubah, atau menghapus ulasan (hanya booking Selesai, satu per booking) |
| `/ulasan-saya` | Daftar, ubah, dan hapus ulasan sendiri |
| `/notifikasi` | Membaca notifikasi, tandai semua dibaca |
| `/akun` | Ubah nama dan telepon, keluar, hapus akun (ditolak bila ada booking mendatang) |

## Barber

Area barber ada di `/barber/*` (lihat `docs/handoff.md`); kata sandi sementara dialihkan ke `/staf/ganti-password`. Barber tidak punya izin staf. Halaman `/barber` (daftar) bersifat publik.

## Admin & Kasir

Rute berikut terbuka untuk Admin & Kasir, Owner, dan Super Admin. Super Admin baru bisa masuk setelah memilih toko.

| Rute | Kemampuan (aksi `can()`) |
|---|---|
| `/staf/timeline` | Melihat jadwal. Walk-in ada di `/staf/walk-in` dan butuh `booking.manage` |
| `/staf/booking/:id` | `booking.manage`, `void.request` (bila ada tagihan) |
| `/staf/tagihan`, `/staf/tagihan/:bookingId` | `billing.manage`: tambah layanan, selesaikan booking. `void.request` |
| `/staf/pelanggan` | `customers.view` |
| `/staf/ringkasan` | `summary.view` |
| `/staf/refund` | `refund.manage` |
| `/staf/notifikasi` | `notifications.view` |
| `/staf/kelola/katalog` | `catalog.manage` |
| `/staf/kelola/jadwal` | `schedule.manage` |
| `/staf/kelola/fee` | `fee.manage` |
| `/staf/kelola/staf` | Hanya `staff.create.barber` |
| `/staf/kelola/tautan` | `links.view` |

Admin & Kasir tidak bisa memutuskan void, membuat admin atau owner, atau membuka `/owner` dan `/sa`.

## Owner

Owner mendapat semua rute dan kemampuan Admin & Kasir, ditambah:

| Rute | Kemampuan |
|---|---|
| `/owner` | `owner.dashboard` |
| `/owner/void` | `owner.voidList`, `void.decide` |
| `/owner/laporan` | `owner.reports`, `owner.export` (tombol ekspor tersembunyi tanpa izin ini) |
| `/owner/invoice` | `owner.invoice` |
| `/owner/audit` | `owner.audit` |
| `/owner/toko` | `owner.shopProfile` |
| `/staf/kelola/staf` | `staff.create.barber` dan `staff.create.admin` |

## Super Admin

Super Admin mendapat semua kemampuan Owner untuk toko yang dipilih (mode toko), ditambah area tingkat Loque:

| Rute | Kemampuan |
|---|---|
| `/sa/toko`, `/sa/toko/:shopId` | `sa.shops`: daftar toko, penyiapan toko, memilih toko untuk dikelola |
| `/sa/moderasi/foto` | `sa.moderation`: antrean foto |
| `/sa/moderasi/ulasan` | `sa.moderation`: antrean ulasan |
| `/sa/sengketa` | `sa.disputes`: sengketa nomor |
| `/sa/invoice` | `sa.billing` |
| `/sa/audit` | `sa.audit` |
| `/staf/kelola/staf` | Juga `staff.create.owner` |

## Catatan

- Guard dan `can()` hanya mengatur tampilan di frontend. Backend harus menegakkan aturan yang sama.
- Pengguna yang membuka rute di luar perannya mendapat toast "tidak memiliki akses" dan dialihkan ke beranda perannya (`ROLE_HOME`).
- Tamu yang membuka rute terlindungi diarahkan ke `/masuk` untuk rute customer, atau `/staf/masuk` untuk `/staf`, `/owner`, `/sa`, dan `/barber/*`.
- Super Admin yang membuka rute `/staf` atau `/owner` tanpa toko terpilih dialihkan ke `/sa/toko`.
