// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { AccountService } from "./contract"

export const httpAccountService: AccountService = {
  list: () => call("accounts", "accounts.list", {}, { read: true }),
  create: (input) => call("accounts", "accounts.create", { input }),
  resetPassword: (id) => call("accounts", "accounts.resetPassword", { id }),
  setActive: (id, active) => call("accounts", "accounts.setActive", { id, active }),
}
