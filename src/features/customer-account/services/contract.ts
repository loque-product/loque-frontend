import type { CustomerProfile, ProfileInput } from "../types"

export interface CustomerAccountService {
  getProfile(): Promise<CustomerProfile>
  /** Profil pertama kali. PHONE_IN_USE bila nomor dipakai akun lain (masuk sengketa nomor). */
  completeProfile(input: ProfileInput): Promise<CustomerProfile>
  updateProfile(input: ProfileInput): Promise<CustomerProfile>
  /** Konfirmasi harus "HAPUS". HAS_UPCOMING_BOOKINGS bila masih ada booking mendatang. */
  deleteAccount(confirmation: string): Promise<void>
}
