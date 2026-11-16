// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { PaymentsService } from "./contract"

export const httpPaymentsService: PaymentsService = {
  listRefunds: () => call("payments", "payments.listRefunds", {}, { read: true }),
  markRefundDone: (id, reference) => call("payments", "payments.markRefundDone", { id, reference }),
  getFeeConfig: () => call("payments", "payments.getFeeConfig", {}, { read: true }),
  saveFeeConfig: (config) => call("payments", "payments.saveFeeConfig", { config }),
}
