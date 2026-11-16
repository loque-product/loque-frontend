// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { BarberAccountService } from "./contract"

export const httpBarberAccountService: BarberAccountService = {
  getMe: () => call("barber-account", "barber-account.getMe", {}, { read: true }),
  updateProfile: (input) => call("barber-account", "barber-account.updateProfile", { input }),
  updateEmail: (email) => call("barber-account", "barber-account.updateEmail", { email }),
  deleteAccount: (confirmation) => call("barber-account", "barber-account.deleteAccount", { confirmation }),
}
