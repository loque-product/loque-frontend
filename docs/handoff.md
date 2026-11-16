# Serah-terima frontend Loque

Repositori ini murni frontend. Semua data datang dari backend lewat `POST /functions/v1/<fitur>`; tidak ada data tiruan, seed, atau mode demo.

## Menjalankan
1. `pnpm install`, salin `.env.example` ke `.env`, isi `VITE_API_BASE_URL`.
2. `pnpm dev` untuk pengembangan. `pnpm typecheck`, `pnpm test`, `pnpm build` harus lulus sebelum rilis.
3. `pnpm verify:prod` membuild lalu memuat aplikasi di Chromium pada root dan subpath `/app/`, dan gagal bila ada galat konsol.

## Melihat UI tanpa login (khusus dev)
Saat `pnpm dev`, buka `http://localhost:5173/?devrole=customer` untuk melewati guard dengan sesi palsu. Nilai: `customer`, `customer-new` (profil belum lengkap), `owner`, `admin_kasir`, `super_admin`, `barber`, `guest`, `off`. Pilihan tersimpan selama tab terbuka; ganti dengan memuat ulang URL dengan `?devrole=` lain. Atau isi `VITE_DEV_ROLE` di `.env.local`. Kode ada di `features/auth/domain/devSession.ts` dan tidak masuk build produksi. Sesi palsu hanya melewati guard; data tetap dari backend, jadi tanpa backend layar menampilkan keadaan galat.

## Lapisan layanan
- Tiap fitur: `services/contract.ts` (antarmuka, ditulis tangan), `services/http.ts` (adapter, **dibuat otomatis**), `services/index.ts` (mengekspor adapter).
- Menambah atau mengubah aksi: ubah `contract.ts`, jalankan `pnpm gen:services`. Skrip membuat ulang semua `http.ts` dan `docs/api-contract.md`.
- Protokol, bentuk galat, dan aturan server ada di `docs/api-contract.md`. Respons belum divalidasi Zod; tambahkan di `shared/api/httpClient.ts` bila backend belum stabil.
- Uji komponen atau hook yang memakai layanan dengan `vi.mock("@/features/<fitur>/services")` atau double yang memenuhi `contract.ts`.

## Sesi
- Sesi memakai cookie `httpOnly` dari server (`credentials: include`). `useSession` hanya cermin di memori, dipulihkan lewat `auth.me` saat aplikasi dimuat; tidak ada token di `localStorage`.
- `UNAUTHENTICATED` (401) dari query atau mutasi menghapus sesi dan mengarahkan ke `/masuk` dengan tujuan awal tersimpan (`app/providers.tsx`).
- Backend harus mengizinkan CORS dengan kredensial bila API dan frontend beda origin, dan memakai `SameSite` yang sesuai.

## Daftar periksa produksi
- `VITE_API_BASE_URL`, `VITE_APP_ENV=production`, `VITE_BASE_PATH` bila disajikan di subpath. Jalankan `pnpm verify:prod` pada base path yang dipakai.
- Pengalihan SPA: semua jalur tanpa berkas dikembalikan ke `index.html`.
- CSP yang disarankan: `default-src 'self'`; `connect-src 'self' <alamat API>`; `img-src 'self' data: https:`; `font-src 'self'`; tanpa `unsafe-eval`.
- Pemantauan galat: sambungkan `shared/lib/report-error.ts` ke layanan pemantauan.
- Identitas penerbit invoice di `features/invoicing/constants.ts` masih berisi data contoh. Ganti dengan identitas Loque sebenarnya.
- Printer struk (`features/printing/services`) belum tersambung ke perangkat; `print` menolak dengan galat sampai implementasi ESC/POS ditulis.
- Unggah foto galeri toko (`shops.addGalleryPhoto(label)`) masih berupa kontrak tiruan: butuh kontrak unggah berkas yang sebenarnya.

## Keputusan dan batas yang diketahui
- PDF dan CSV dibuat di frontend (`shared/lib/export`). Server tetap harus membatasi endpoint datanya untuk Owner dan mencatat ekspor di audit.
- Aturan impor: antar fitur hanya lewat `index.ts`.
- Satuan: semua ukuran memakai rem. Properti pustaka grafik (Recharts) dan bayangan `ring`/`outline` tidak dipakai; fokus memakai outline rem di `index.css`.
- Keamanan nyata (otorisasi, enkripsi token void, pembatasan percobaan) harus ada di server.
- Pemformat: Prettier. Jalankan hanya pada berkas yang diubah (`pnpm exec prettier --write <berkas>`); `http.ts` dan `api-contract.md` dibuat otomatis dan dikecualikan.

## Area customer dan publik

Rute (`src/app/router.tsx`):

| Jalur | Isi | Akses |
|---|---|---|
| `/`, `/barber`, `/b/:slug`, `/toko`, `/syarat`, `/privasi`, `/bantuan` | Halaman publik; customer yang masuk melihatnya dengan tab bawah | Tamu dan customer (staf dan barber dialihkan ke areanya) |
| `/masuk`, `/masuk/kembali` | Login Google customer dan titik kembali OAuth | Tamu |
| `/staf/masuk` | Login email dan kata sandi untuk staf dan barber | Tamu |
| `/akun/lengkapi` | Melengkapi nama dan nomor | Customer |
| `/booking/data-tamu` sampai `/booking/ringkasan` | Wizard 5 langkah | Customer dengan profil lengkap |
| `/booking/status/:id`, `/booking-saya`, `/booking-saya/:id`, `/booking-saya/:id/transaksi`, `/ulasan/:bookingId`, `/ulasan-saya`, `/notifikasi`, `/akun` | Aplikasi customer | Customer dengan profil lengkap |

Perubahan dari toko-sisi yang disengaja: login staf pindah dari `/masuk` ke `/staf/masuk` karena `/masuk` kini milik customer. `loginPathFor` di `app/guards` memilih halaman masuk menurut area.

Alur yang perlu backend:
- **Login Google.** `auth.startGoogleLogin` mengembalikan `redirectUrl` OAuth. Server harus mengembalikan pengguna ke `{base}/masuk/kembali` setelah mengatur cookie sesi. Konteks (barber, `ref`, tujuan awal) juga disimpan di `sessionStorage` dan dipulihkan di sana; `next` hanya diterima bila jalur aplikasi.
- **Pembayaran.** `customerBooking.create` membuat hold 15 menit, lalu `customerBooking.startPayment` mengembalikan URL DOKU. DOKU harus mengembalikan pengguna ke `/booking/status/:id`; layar itu memeriksa tiap 3 detik. Status Confirmed hanya boleh berubah lewat webhook server.
- **Fee dan sisa bayar** (`payAtShop`) dihitung server dan ditampilkan apa adanya di detail; wizard memakai `feeSummary` untuk teks sebelum bayar dan mengirim `expectedFee` agar server bisa menjawab `FEE_CHANGED`.
- **Slot.** `getSlots` mengembalikan semua slot 30 menit dengan `available`; jam penuh tampil "Tidak tersedia" tanpa alasan.
- **Turnstile.** Isi `VITE_TURNSTILE_SITE_KEY`. Tanpa kunci, laporan foto mulai laporan ketiga akan menampilkan peringatan dan tidak bisa dikirim.

Belum dikerjakan di area ini:
- Pratinjau tautan `/b/:slug` untuk Instagram dan TikTok perlu Cloudflare Pages Function (SPA tidak dirender di server).
- Teks Syarat dan Privasi adalah draf; tinjau secara hukum sebelum rilis.
- Toko dengan satu gender: langkah data tamu tetap tampil (untuk "Untuk orang lain"), hanya pilihan gender yang disembunyikan.
- Peristiwa analitik di luar sembilan jenis bertipe (mis. perpindahan antar langkah wizard) tidak dikirim; tambahkan ke `features/analytics/types.ts` bila funnel membutuhkannya.

Pengecualian aturan impor: `customer-booking/domain/cart.ts` mengimpor `@/features/catalog/domain/pricing` langsung agar uji tidak menarik komponen React.

## Area barber

Guard berlapis: `RequireAuth`, `RequireBarber`, `RequirePasswordChanged` (sesi dengan `mustChangePassword` dialihkan ke `/staf/ganti-password`), lalu `BarberLayout` (tab Hari ini, Jadwal, Profil, Ulasan, Akun; lonceng ke Notifikasi; lebar maks. 48 rem pada layar lebar).

| Jalur | Isi |
|---|---|
| `/staf/ganti-password` | Ganti kata sandi pertama dan setujui Syarat staf (`auth.completeFirstLogin`; kata sandi lama tidak ditanyakan) |
| `/barber/hari-ini`, `/barber/booking/:id` | Strip 7 hari, baris berurutan jam (booking, "Kosong", "Diblok: ..."), polling 60 detik, tarik untuk muat ulang, detail hanya baca |
| `/barber/jadwal` | Jam kerja, blok waktu (sebagian, sehari penuh, rentang, mingguan), kalender bulanan hanya baca |
| `/barber/profil`, `/barber/profil/pratinjau` | Foto, sampul, bio, spesialisasi, portofolio maks. 9 foto; pratinjau tampilan customer tanpa pelacakan dan tanpa tombol booking |
| `/barber/tautan` | Tautan `ref` ig/tt/wa, salin dan bagikan, QR PNG, statistik bulan berjalan per kanal |
| `/barber/ulasan` | Ringkasan, sebaran, laporkan ulasan (Dilaporkan, Ditinjau, Dihapus, Dipertahankan) |
| `/barber/notifikasi`, `/barber/akun` | Notifikasi; email, keanggotaan, kata sandi, Syarat staf, Privasi, hapus akun, keluar |

Barber tanpa keanggotaan aktif (`barberAccount.getMe().membership.active = false`) melihat "Anda belum terhubung ke toko." di Hari ini dan Jadwal; Profil, Tautan, Ulasan, dan Akun tetap bisa dipakai.

Kontrak baru (semua di `docs/api-contract.md`): `barber-booking`, `barber-schedule`, `barber-account`, `barber-links`, serta tambahan di `auth` (`completeFirstLogin`, `requestPasswordReset`), `portfolio` (`listMine`, `createUploadUrl`, `addPhoto`, `updateCaption`, `reorder`, `removePhoto`), dan `reviews` (`listAboutMe`, `reportReview`). Kontrak staf lama tidak diubah.

Unggah foto: klien memampatkan (sisi terpanjang maks. 1.600 piksel, maks. 1,5 MB, WebP atau JPEG, EXIF hilang karena digambar ulang lewat kanvas dan diverifikasi), memanggil `portfolio.createUploadUrl`, lalu `PUT` ke URL itu (`shared/api/upload.ts`), lalu `portfolio.addPhoto` dengan `objectKey` dan `consent: true`. Server tetap harus memeriksa ukuran, tipe, dan menghapus EXIF sendiri.

## Urutan menyambung backend

1. `auth` (login staf, Google, `me`, `completeFirstLogin`, `requestPasswordReset`, `logout`): semua rute bergantung padanya.
2. `shop-info`, `barber-profile` dan `catalog`: halaman publik dan wizard.
3. `schedule` dan `barber-schedule`: slot, jam kerja, blok (`BLOCK_CONFLICT` membawa `details.affectedBookings`).
4. `booking`, `customer-booking`, `payments`, `barber-booking`: hold 15 menit, webhook DOKU, `FEE_CHANGED`, `SLOT_TAKEN`.
5. `reviews`, `portfolio`, `moderation`: ulasan, unggah foto dan moderasi.
6. `barber-account`, `barber-links`, `notifications`, `analytics`.

Menguji tiap aksi: panggil dari `curl` dengan bentuk di bagian Protokol `docs/api-contract.md`; di UI, isi `VITE_API_BASE_URL`, lalu masuk sesuai peran. `pnpm check:contract` memastikan tiap aksi di `contract.ts` punya `http.ts` dan baris dokumentasi.

## Hasil verifikasi (rilis ini)

- `pnpm typecheck`, `pnpm test` (aksesibilitas axe, guard tiga peran dan barber, kompresi gambar, blok, Hari ini, hapus akun ditolak, alur customer), `pnpm build`, `pnpm check:contract`, `pnpm verify:prod` (root dan `/app/`): lulus.
- Demo: tidak ada kode demo, seed, atau data tiruan di `src` di luar berkas uji, sehingga `VITE_ENABLE_DEMO` tidak diperlukan. Satu-satunya jalur pintas adalah `VITE_DEV_ROLE` / `?devrole=`, yang hanya ada pada `pnpm dev`.
- Ukuran muat awal (HTML, JS, dan CSS yang di-preload di `/`): sekitar 235 kB gzip. Anggaran: 250 kB gzip; target lanjutan 200 kB (kandidat: Zod mini, memecah barrel `shared/components`). `recharts`, `jspdf`, `html2canvas`, `qrcode`, `html-to-image`, dan kompresor gambar dimuat dinamis.
- Lighthouse mobile (build produksi, tanpa backend, throttling simulasi): Performa 86, Aksesibilitas 100, Praktik terbaik 96, SEO 100. Performa belum 90 karena FCP 2,5 dtk di profil lambat; ulangi dengan backend dan CDN. Praktik terbaik turun hanya karena galat konsol saat API tidak ada.

## Keamanan

- Tidak ada rahasia di bundel; hanya `VITE_*` publik. Tidak ada `dangerouslySetInnerHTML`. Tautan eksternal memakai `rel="noopener noreferrer"` atau `noreferrer`.
- Sesi: cookie `httpOnly`, `Secure`, `SameSite=Lax` (atau `None` bila beda origin) dari server; tidak ada token di penyimpanan peramban.
- CSP: lihat daftar periksa produksi; tambahkan `img-src` untuk domain penyimpanan foto dan `connect-src` untuk URL unggah (PUT) dari `createUploadUrl`.
- Semua unggahan dan nilai masukan wajib divalidasi ulang di server.

## Risiko yang diketahui

- Respons backend belum divalidasi Zod di klien.
- Polling Hari ini (60 dtk) membebani server bila banyak barber; pertimbangkan ETag.
- Lighthouse belum diukur terhadap backend asli.
- Perubahan global Prompt 4 (tanpa border) menyentuh layar staf, owner, dan super admin; periksa visual tiap layar sebelum rilis.

## Sengaja belum ada (peningkatan masa depan)

- PWA: manifest, service worker, halaman luring, `InstallPrompt` ("Pasang ke layar HP").
- Pemilih peran untuk orang yang punya lebih dari satu peran.
- Push, pengingat, dan jadwal ulang mandiri oleh customer.
- Pratinjau tautan `/b/:slug` untuk Instagram dan TikTok: Cloudflare Pages Function yang membaca slug lalu mengembalikan `index.html` dengan meta Open Graph barber.
