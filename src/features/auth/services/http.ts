// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { AuthService } from "./contract"

export const httpAuthService: AuthService = {
  login: (email, password) => call("auth", "auth.login", { email, password }),
  startGoogleLogin: (state) => call("auth", "auth.startGoogleLogin", { state }),
  logout: () => call("auth", "auth.logout", {}),
  me: () => call("auth", "auth.me", {}, { read: true }),
  changePassword: (oldPassword, newPassword) => call("auth", "auth.changePassword", { oldPassword, newPassword }),
  completeFirstLogin: (newPassword, acceptedStaffTerms) => call("auth", "auth.completeFirstLogin", { newPassword, acceptedStaffTerms }),
  requestPasswordReset: (email) => call("auth", "auth.requestPasswordReset", { email }),
}
