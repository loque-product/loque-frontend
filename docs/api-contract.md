# Kontrak API frontend Loque

Berkas ini dibuat oleh `pnpm gen:services` dari `src/features/*/services/contract.ts`. Jangan mengubah tabel di bawah; ubah `contract.ts` lalu jalankan ulang. Teks di berkas ini (di atas tabel) ada di `docs/api-contract.header.md`.

## Protokol

Semua aksi memakai satu bentuk permintaan lewat `shared/api/httpClient.ts`:

```
POST {VITE_API_BASE_URL}/functions/v1/<fitur>
Content-Type: application/json
Idempotency-Key: <uuid>        (hanya aksi ubah)
Cookie: sesi httpOnly           (credentials: include)

{ "action": "<fitur>.<aksi>", "payload": { <nama parameter>: <nilai> } }
```

Nama kunci `payload` sama dengan nama parameter metode di `contract.ts`. Respons sukses berisi nilai yang dijanjikan metode (204 untuk `void`). Respons galat:

```
{ "error": { "code": "SLOT_TAKEN", "message": "...", "details": {}, "fields": { "nama": "..." }, "retryable": false } }
```

## Kode galat

| Kode | HTTP | Perilaku frontend |
|---|---|---|
| `UNAUTHENTICATED` | 401 | Sesi dihapus, pengguna diarahkan ke `/masuk` dengan tujuan awal tersimpan. |
| `FORBIDDEN` | 403 | Toast akses ditolak. |
| `NOT_FOUND` | 404 | Keadaan galat halaman. |
| `CONFLICT` | 409 | Pesan di formulir. Contoh: slot terisi (`details.nearest`), jadwal menimpa booking (`details.bookings`), barber masih punya booking mendatang. |
| `VALIDATION` | 422 | `fields` berisi galat per kolom. Kode void salah memakai `details.attemptsLeft`. |
| `SLOT_TAKEN` | 409 | Customer kembali ke langkah jadwal. |
| `HOLD_EXISTS` | 409 | Dialog lanjutkan atau batalkan hold. |
| `HOLD_EXPIRED` | 409 | Layar waktu pembayaran habis. |
| `FEE_CHANGED` | 409 | Ringkasan terbaru dan konfirmasi ulang. |
| `PHONE_IN_USE` | 409 | Kotak peringatan nomor dipakai akun lain. |
| `HAS_UPCOMING_BOOKINGS` | 409 | Hapus akun ditolak. |
| `BLOCK_CONFLICT` | 409 | Blok waktu menimpa booking (`details.affectedBookings`). |
| `RATE_LIMITED` | 429 | Pesan di formulir. Void terkunci setelah 5 kode salah (`details.locked`). |
| `CAPTCHA_REQUIRED` | 429 | Tampilkan Turnstile. |
| `NETWORK` | - | `ErrorState` dengan tombol Coba lagi. Aksi baca diulang otomatis (maks. 2 kali) bila `retryable`. |

## Aturan yang harus dipegang server

- Token void tidak pernah dikirim ke Admin & Kasir. Hanya `billing.getVoidCode` (Owner, bukan pemohon) yang mengembalikannya.
- Pemeriksaan kode, hitungan percobaan, kunci, dan kedaluwarsa void dilakukan server.
- Fee, tagihan, nomor invoice, waktu selesai, hold, dan status kedaluwarsa dihitung server. Frontend hanya menampilkan.
- Izin ditegakkan server. `can(role, action)` di frontend hanya mengatur tampilan.
- Endpoint ekspor hanya untuk Owner; nomor telepon hanya dikembalikan bila `includePhone` benar.
- Kredensial DOKU write-only: tidak pernah dikembalikan oleh API mana pun.
- Entri audit dibuat server untuk setiap aksi yang tercatat.


## accounts

Antarmuka: `AccountService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `accounts.list` | - | `StaffAccount[]` | baca | - |
| `accounts.create` | `input: CreateAccountInput` | `StaffAccount` | ubah | - |
| `accounts.resetPassword` | `id: string` | `{ temporaryPassword: string }` | ubah | Mengembalikan kata sandi sementara baru. |
| `accounts.setActive` | `id: string`, `active: boolean` | `void` | ubah | Menonaktifkan barber ditolak jika masih punya booking mendatang. |

## analytics

Antarmuka: `AnalyticsService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `analytics.track` | `event: AnalyticsEvent`, `props: AnalyticsProps` | `void` | ubah | Peristiwa funnel. Tanpa login; galat diabaikan klien. |

## audit

Antarmuka: `AuditService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `audit.listShop` | - | `AuditLog[]` | baca | Log audit toko (Owner). |
| `audit.listGlobal` | - | `AuditLog[]` | baca | Log audit global (Super Admin). |

## auth

Antarmuka: `AuthService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `auth.login` | `email: string`, `password: string` | `Session` | ubah | Masuk staf atau barber dengan email dan kata sandi. Server mengatur cookie sesi httpOnly. |
| `auth.startGoogleLogin` | `state: GoogleLoginState` | `{ redirectUrl: string }` | ubah | Memulai OAuth Google customer. `state` dipulihkan server sesudah masuk. |
| `auth.logout` | - | `void` | ubah | - |
| `auth.me` | - | `Session | null` | baca | Sesi saat ini dari cookie; null bila belum masuk atau sesi berakhir. |
| `auth.changePassword` | `oldPassword: string`, `newPassword: string` | `void` | ubah | - |
| `auth.completeFirstLogin` | `newPassword: string`, `acceptedStaffTerms: boolean` | `Session` | ubah | Login pertama barber: menetapkan kata sandi baru dan mencatat persetujuan Syarat staf (waktu dicatat server). |
| `auth.requestPasswordReset` | `email: string` | `void` | ubah | Selalu berhasil agar tidak membocorkan email terdaftar. Tautan reset berlaku 1 jam. |

## barber-account

Antarmuka: `BarberAccountService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `barber-account.getMe` | - | `BarberMe` | baca | Profil, keanggotaan toko, dan pilihan spesialisasi milik barber yang masuk. |
| `barber-account.updateProfile` | `input: UpdateBarberProfileInput` | `BarberMe` | ubah | Foto dan sampul diunggah lebih dulu lewat `portfolio.createUploadUrl`, lalu kuncinya dikirim di sini. |
| `barber-account.updateEmail` | `email: string` | `BarberMe` | ubah | Email dipakai untuk masuk. VALIDATION bila format salah atau sudah dipakai. |
| `barber-account.deleteAccount` | `confirmation: string` | `void` | ubah | Konfirmasi harus "HAPUS". HAS_UPCOMING_BOOKINGS bila masih ada booking mendatang. |

## barber-booking

Antarmuka: `BarberBookingService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `barber-booking.getDay` | `date: YmdString` | `BarberDay` | baca | Booking Terkonfirmasi dan Selesai milik barber pada tanggal itu, beserta jam kerja dan blok. FORBIDDEN bila keanggotaan tidak aktif. |
| `barber-booking.get` | `id: string` | `BarberBookingDetail` | baca | Detail hanya baca. NOT_FOUND bila bukan milik barber; FORBIDDEN bila keanggotaan tidak aktif. |

## barber-links

Antarmuka: `BarberLinksService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `barber-links.getMine` | - | `BarberLinkInfo` | baca | Slug, nama, dan statistik bulan berjalan per kanal (Instagram, TikTok, WhatsApp). Tetap tersedia walau keanggotaan nonaktif. |

## barber-profile

Antarmuka: `BarberService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `barber-profile.list` | - | `Barber[]` | baca | - |

## barber-schedule

Antarmuka: `BarberScheduleService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `barber-schedule.getMine` | - | `BarberSchedule` | baca | Jam toko, jam kerja, dan blok milik barber. FORBIDDEN bila keanggotaan tidak aktif. |
| `barber-schedule.saveWorkingHours` | `days: DayHours[]` | `void` | ubah | Tujuh hari, kelipatan 30 menit, di dalam jam buka toko. BLOCK_CONFLICT (details.affectedBookings) bila memotong booking. |
| `barber-schedule.saveBlock` | `input: SaveBlockInput` | `ScheduleBlock` | ubah | BLOCK_CONFLICT (details.affectedBookings) bila menimpa booking. Server menolak blok yang seluruhnya jatuh pada libur toko dengan VALIDATION. |
| `barber-schedule.deleteBlock` | `id: string` | `void` | ubah | - |

## barbers

Antarmuka: `BarberDirectoryService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `barbers.list` | - | `PublicBarber[]` | baca | Barber aktif. Tanpa login. |
| `barbers.getBySlug` | `slug: string` | `BarberProfile` | baca | NOT_FOUND bila slug tidak dikenal atau barber nonaktif. Tanpa login. |

## billing

Antarmuka: `BillingService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `billing.listBills` | - | `BillRow[]` | baca | - |
| `billing.getBill` | `bookingId: string` | `BillView` | baca | - |
| `billing.completeBill` | `input: CompleteBillInput` | `Bill` | ubah | - |
| `billing.requestVoid` | `billId: string`, `reason: string` | `VoidRequestPublic` | ubah | - |
| `billing.submitVoidCode` | `voidId: string`, `code: string` | `VoidRequestPublic` | ubah | Kasir memasukkan kode dari Owner. Kode benar: void berlaku. |
| `billing.listVoids` | - | `VoidRequestPublic[]` | baca | - |
| `billing.getVoidCode` | `voidId: string` | `{ token: string; expiresAt: string }` | baca | Token hanya untuk Owner dan bukan pemohon. Tidak pernah dikirim ke Admin & Kasir. |
| `billing.rejectVoid` | `voidId: string`, `note: string` | `VoidRequestPublic` | ubah | - |
| `billing.getVoidThreshold` | - | `number` | baca | - |
| `billing.setVoidThreshold` | `amount: number` | `void` | ubah | - |

## booking

Antarmuka: `BookingService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `booking.listByDate` | `date: string` | `DayView` | baca | - |
| `booking.get` | `id: string` | `BookingDetail` | baca | - |
| `booking.getSlots` | `q: SlotQuery` | `Slot[]` | baca | - |
| `booking.createBooking` | `input: CreateBookingInput` | `Booking` | ubah | Membuat booking oleh staf (walk-in atau booking biasa). |
| `booking.update` | `input: UpdateBookingInput` | `UpdateBookingResult` | ubah | - |
| `booking.markNoShow` | `id: string`, `confirmed: boolean` | `Booking` | ubah | `confirmed` wajib true jika belum 15 menit sejak jam mulai. |
| `booking.undoNoShow` | `id: string` | `Booking` | ubah | - |
| `booking.cancelByCustomer` | `id: string`, `reason?: string` | `Booking` | ubah | - |
| `booking.cancelByShop` | `id: string`, `reason: string` | `Booking` | ubah | - |
| `booking.confirmLate` | `id: string` | `Booking` | ubah | Pembayaran terlambat: konfirmasi manual jika slot masih kosong. |

## catalog

Antarmuka: `CatalogService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `catalog.listServices` | - | `Service[]` | baca | - |
| `catalog.listOverrides` | - | `ServiceOverride[]` | baca | - |
| `catalog.saveService` | `input: ServiceInput` | `Service` | ubah | - |
| `catalog.setServiceActive` | `id: string`, `active: boolean` | `void` | ubah | - |
| `catalog.setOverride` | `input: OverrideInput` | `void` | ubah | Harga atau durasi kosong menghapus override. |
| `catalog.listExtraItems` | - | `ExtraItem[]` | baca | Master add-on, minuman atau makanan, dan produk. |
| `catalog.saveExtraItem` | `input: ExtraItemInput` | `ExtraItem` | ubah | - |
| `catalog.deleteExtraItem` | `id: string` | `void` | ubah | Baris tagihan lama tetap utuh; hanya master yang dihapus. |

## customer-account

Antarmuka: `CustomerAccountService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `customer-account.getProfile` | - | `CustomerProfile` | baca | - |
| `customer-account.completeProfile` | `input: ProfileInput` | `CustomerProfile` | ubah | Profil pertama kali. PHONE_IN_USE bila nomor dipakai akun lain (masuk sengketa nomor). |
| `customer-account.updateProfile` | `input: ProfileInput` | `CustomerProfile` | ubah | - |
| `customer-account.deleteAccount` | `confirmation: string` | `void` | ubah | Konfirmasi harus "HAPUS". HAS_UPCOMING_BOOKINGS bila masih ada booking mendatang. |

## customer-booking

Antarmuka: `CustomerBookingService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `customer-booking.getCatalog` | - | `CustomerCatalog` | baca | Katalog, override harga, gender, dan skema fee. Tanpa login. |
| `customer-booking.getNextAvailable` | `serviceIds: Id[]`, `gender: Gender` | `NextAvailable[]` | baca | Jam kosong terdekat tiap barber untuk layanan dan gender terpilih. Tanpa login. |
| `customer-booking.getAvailability` | `q: AvailabilityQuery` | `DayAvailability[]` | baca | Jumlah slot per tanggal, 45 hari. Tanpa login. |
| `customer-booking.getSlots` | `q: SlotsQuery` | `SlotOption[]` | baca | Seluruh slot 30 menit pada tanggal itu; `available` hanya bagi yang muat dengan total durasi dan mulai paling cepat 60 menit dari sekarang. |
| `customer-booking.create` | `input: CreateCustomerBookingInput` | `CreateCustomerBookingResult` | ubah | Galat: SLOT_TAKEN, FEE_CHANGED (details: mode dan amount terbaru), HOLD_EXISTS (details: bookingId), VALIDATION. |
| `customer-booking.getHold` | - | `CustomerBooking | null` | baca | Hold belum dibayar milik akun ini, bila ada. |
| `customer-booking.cancelHold` | `id: string` | `void` | ubah | Melepas slot tanpa fee. |
| `customer-booking.startPayment` | `bookingId: string` | `PaymentSession` | ubah | Membuka sesi pembayaran DOKU. HOLD_EXPIRED bila hold habis. |
| `customer-booking.list` | - | `CustomerBooking[]` | baca | - |
| `customer-booking.get` | `id: string` | `CustomerBookingDetail` | baca | - |
| `customer-booking.cancel` | `id: string` | `CustomerBooking` | ubah | Hanya sebelum jam mulai. Booking fee tidak dikembalikan. |
| `customer-booking.getTransaction` | `id: string` | `TransactionInfo` | baca | - |

## customers

Antarmuka: `CustomerService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `customers.search` | `query: string` | `Customer[]` | baca | - |
| `customers.history` | `customerId: string` | `Booking[]` | baca | - |
| `customers.findByPhone` | `phone: string` | `Customer | null` | baca | - |

## invoicing

Antarmuka: `InvoiceService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `invoicing.list` | `shopId?: string` | `InvoiceView[]` | baca | Owner: invoice toko sendiri, termasuk periode berjalan. Super Admin: tentukan toko. |
| `invoicing.closeCurrentPeriod` | `shopId: string` | `InvoiceView` | ubah | Tutup periode berjalan (simulasi, Super Admin). |
| `invoicing.setPaid` | `invoiceId: string`, `paid: boolean`, `note?: string` | `void` | ubah | - |
| `invoicing.recordExport` | `invoiceId: string`, `kind: "pdf" | "csv"` | `void` | ubah | Mencatat unduhan atau ekspor invoice ke audit. |

## moderation

Antarmuka: `ModerationService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `moderation.listPhotoReports` | - | `PhotoReport[]` | baca | - |
| `moderation.decidePhoto` | `id: string`, `decision: PhotoDecision`, `reason: string` | `PhotoReport` | ubah | - |
| `moderation.listReviewReports` | - | `ReviewReport[]` | baca | - |
| `moderation.decideReview` | `id: string`, `decision: ReviewDecision`, `reason: string` | `ReviewReport` | ubah | - |
| `moderation.listBarbersByShop` | - | `{ shopId: string shopName: string barbers: Barber[] }[]` | baca | - |
| `moderation.hideBadge` | `barberId: string`, `reason: string` | `void` | ubah | - |
| `moderation.listDisputes` | - | `PhoneDispute[]` | baca | - |
| `moderation.openDispute` | `id: string` | `PhoneDispute` | ubah | Membuka detail sengketa mencatat audit "Super Admin membuka data pelanggan". |
| `moderation.decideDispute` | `id: string`, `decision: DisputeDecision`, `reason: string` | `PhoneDispute` | ubah | - |

## notifications

Antarmuka: `NotificationService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `notifications.list` | - | `AppNotification[]` | baca | - |
| `notifications.markRead` | `id: string` | `void` | ubah | - |
| `notifications.markAllRead` | - | `void` | ubah | - |

## payments

Antarmuka: `PaymentsService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `payments.listRefunds` | - | `Refund[]` | baca | - |
| `payments.markRefundDone` | `id: string`, `reference: string` | `Refund` | ubah | - |
| `payments.getFeeConfig` | - | `FeeConfig` | baca | - |
| `payments.saveFeeConfig` | `config: FeeConfig` | `void` | ubah | Berlaku untuk booking baru. Booking lama memakai snapshot. |

## portfolio

Antarmuka: `PortfolioService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `portfolio.reportPhoto` | `input: PhotoReportInput` | `PhotoReportResult` | ubah | Tanpa login. Galat: RATE_LIMITED (5 per jam), CAPTCHA_REQUIRED. |
| `portfolio.listMine` | - | `PortfolioPhoto[]` | baca | Portofolio milik barber yang masuk, urut tampil, termasuk foto yang disembunyikan. |
| `portfolio.createUploadUrl` | `input: UploadUrlInput` | `UploadTarget` | ubah | URL unggah bertanda tangan untuk foto portofolio, foto profil, atau sampul. Klien mengompres dan menghapus EXIF lebih dulu. |
| `portfolio.addPhoto` | `input: AddPhotoInput` | `PortfolioPhoto` | ubah | Menyimpan foto yang sudah diunggah. VALIDATION bila sudah 9 foto, persetujuan tidak ada, atau berkas masih memuat EXIF ("File mengandung metadata. Coba foto lain."). |
| `portfolio.updateCaption` | `id: string`, `caption: string` | `PortfolioPhoto` | ubah | - |
| `portfolio.reorder` | `ids: string[]` | `PortfolioPhoto[]` | ubah | Urutan baru berupa daftar ID lengkap. |
| `portfolio.removePhoto` | `id: string` | `void` | ubah | - |

## printing

Antarmuka: `ReceiptPrinter`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `printing.print` | `receipt: Receipt`, `options: PrintOptions` | `void` | ubah | - |

## reports

Antarmuka: `ReportService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `reports.todaySummary` | - | `TodaySummary` | baca | - |
| `reports.dashboard` | - | `DashboardData` | baca | - |
| `reports.report` | `range: Range` | `ReportData` | baca | - |
| `reports.exportRows` | `tab: ReportTab`, `range: Range`, `includePhone: boolean` | `ExportTable` | baca | Data mentah untuk CSV. Hanya Owner. Nomor telepon hanya disertakan bila diminta. |
| `reports.recordExport` | `description: string`, `includePhone: boolean` | `void` | ubah | Mencatat ekspor ke log audit. |

## reviews

Antarmuka: `ReviewService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `reviews.listForBarber` | `slug: string` | `PublicReview[]` | baca | Ulasan barber, terbaru lebih dulu. Tanpa login. |
| `reviews.listMine` | - | `MyReview[]` | baca | - |
| `reviews.getTarget` | `bookingId: string` | `ReviewTarget` | baca | FORBIDDEN bila booking belum Selesai atau bukan milik customer. |
| `reviews.save` | `draft: ReviewDraft` | `MyReview` | ubah | Membuat atau mengubah (menandai "Diedit"). Satu ulasan per booking. |
| `reviews.remove` | `reviewId: string` | `void` | ubah | Rating barber dihitung ulang server. |
| `reviews.listAboutMe` | - | `BarberReviewsData` | baca | Ulasan tentang barber yang masuk, ringkasan, dan status laporan tiap ulasan. Tetap tersedia walau keanggotaan nonaktif. |
| `reviews.reportReview` | `input: ReportReviewInput` | `void` | ubah | Barber melaporkan ulasan ke Super Admin. CONFLICT bila ulasan itu sudah dilaporkan. |

## schedule

Antarmuka: `ScheduleService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `schedule.getSchedule` | - | `ScheduleData` | baca | - |
| `schedule.saveSchedule` | `next: ScheduleData`, `summary: string` | `void` | ubah | Menyimpan jadwal. Jika menimpa booking aktif, melempar ApiError CONFLICT dengan `details: { bookings }` dan tidak menyimpan apa pun. |
| `schedule.saveTimeblock` | `input: TimeblockInput` | `Timeblock` | ubah | Menyimpan Timeblock (baru atau ubah). Jika ada booking aktif di rentangnya, melempar ApiError CONFLICT dengan `details: { bookings }` dan tidak menyimpan apa pun. |
| `schedule.deleteTimeblock` | `id: string` | `void` | ubah | - |

## shop-info

Antarmuka: `ShopInfoService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `shop-info.getInfo` | - | `ShopInfo` | baca | Info publik toko: tanpa login. |

## shops

Antarmuka: `ShopService`

| Aksi | Input | Output | Jenis | Catatan |
|---|---|---|---|---|
| `shops.getProfile` | - | `Shop` | baca | - |
| `shops.updateProfile` | `input: ShopProfileInput` | `Shop` | ubah | - |
| `shops.addGalleryPhoto` | `label: string` | `Shop` | ubah | Foto galeri (unggah tiruan). |
| `shops.getPaymentStatus` | - | `Shop["doku"]` | baca | - |
| `shops.listShops` | - | `ShopRow[]` | baca | - |
| `shops.getShopDetail` | `shopId: string` | `ShopDetail` | baca | - |
| `shops.getSetupData` | `shopId: string` | `ShopSetupData` | baca | - |
| `shops.createShop` | `input: BasicsInput` | `Shop` | ubah | - |
| `shops.saveBasics` | `shopId: string`, `input: BasicsInput` | `Shop` | ubah | Langkah 1. Hanya toko Draf. |
| `shops.saveOwner` | `shopId: string`, `input: OwnerInput` | `void` | ubah | Langkah 2. Membuat akun Owner, atau mengubahnya bila sudah ada. |
| `shops.saveDokuCredentials` | `shopId: string`, `input: DokuInput` | `void` | ubah | Langkah 3. Write-only: nilai kredensial tidak pernah dikembalikan. |
| `shops.testDoku` | `shopId: string` | `Shop["doku"]` | ubah | - |
| `shops.saveCatalog` | `shopId: string`, `rows: CatalogDraftRow[]` | `void` | ubah | Langkah 4. Mengganti katalog awal; minimal satu layanan. |
| `shops.saveHours` | `shopId: string`, `input: HoursInput` | `void` | ubah | Langkah 5. Jam buka, istirahat, dan barber awal. |
| `shops.runPaymentTestStep` | `shopId: string`, `step: "create" | "refund"`, `amount: number` | `Shop` | ubah | Langkah 6. Simulasi bertahap: booking fee uji lalu refund uji. |
| `shops.completePaymentTest` | `shopId: string` | `void` | ubah | - |
| `shops.openShop` | `shopId: string` | `Shop` | ubah | - |
| `shops.freezeShop` | `shopId: string`, `reason: string` | `Shop` | ubah | - |
| `shops.unfreezeShop` | `shopId: string` | `Shop` | ubah | - |
| `shops.deleteShop` | `shopId: string`, `reason: string`, `confirmName: string` | `void` | ubah | Hanya toko Draf yang belum pernah dibuka. Nama toko harus diketik persis. |
