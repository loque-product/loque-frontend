// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { CustomerAccountService } from "./contract"

export const httpCustomerAccountService: CustomerAccountService = {
  getProfile: () => call("customer-account", "customer-account.getProfile", {}, { read: true }),
  completeProfile: (input) => call("customer-account", "customer-account.completeProfile", { input }),
  updateProfile: (input) => call("customer-account", "customer-account.updateProfile", { input }),
  deleteAccount: (confirmation) => call("customer-account", "customer-account.deleteAccount", { confirmation }),
}
