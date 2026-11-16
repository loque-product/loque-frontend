import type { GoogleLoginState, Session } from "../types"

export interface AuthService {
  /** Masuk staf atau barber dengan email dan kata sandi. Server mengatur cookie sesi httpOnly. */
  login(email: string, password: string): Promise<Session>
  /** Memulai OAuth Google customer. `state` dipulihkan server sesudah masuk. */
  startGoogleLogin(state: GoogleLoginState): Promise<{ redirectUrl: string }>
  logout(): Promise<void>
  /** Sesi saat ini dari cookie; null bila belum masuk atau sesi berakhir. */
  me(): Promise<Session | null>
  changePassword(oldPassword: string, newPassword: string): Promise<void>
  /** Login pertama barber: menetapkan kata sandi baru dan mencatat persetujuan Syarat staf (waktu dicatat server). */
  completeFirstLogin(newPassword: string, acceptedStaffTerms: boolean): Promise<Session>
  /** Selalu berhasil agar tidak membocorkan email terdaftar. Tautan reset berlaku 1 jam. */
  requestPasswordReset(email: string): Promise<void>
}
