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
