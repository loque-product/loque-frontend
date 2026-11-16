import type { BarberMe, UpdateBarberProfileInput } from "../types"

export interface BarberAccountService {
  /** Profil, keanggotaan toko, dan pilihan spesialisasi milik barber yang masuk. */
  getMe(): Promise<BarberMe>
  /** Foto dan sampul diunggah lebih dulu lewat `portfolio.createUploadUrl`, lalu kuncinya dikirim di sini. */
  updateProfile(input: UpdateBarberProfileInput): Promise<BarberMe>
  /** Email dipakai untuk masuk. VALIDATION bila format salah atau sudah dipakai. */
  updateEmail(email: string): Promise<BarberMe>
  /** Konfirmasi harus "HAPUS". HAS_UPCOMING_BOOKINGS bila masih ada booking mendatang. */
  deleteAccount(confirmation: string): Promise<void>
}
