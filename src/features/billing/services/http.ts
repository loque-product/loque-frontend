// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { BillingService } from "./contract"

export const httpBillingService: BillingService = {
  listBills: () => call("billing", "billing.listBills", {}, { read: true }),
  getBill: (bookingId) => call("billing", "billing.getBill", { bookingId }, { read: true }),
  completeBill: (input) => call("billing", "billing.completeBill", { input }),
  requestVoid: (billId, reason) => call("billing", "billing.requestVoid", { billId, reason }),
  submitVoidCode: (voidId, code) => call("billing", "billing.submitVoidCode", { voidId, code }),
  listVoids: () => call("billing", "billing.listVoids", {}, { read: true }),
  getVoidCode: (voidId) => call("billing", "billing.getVoidCode", { voidId }, { read: true }),
  rejectVoid: (voidId, note) => call("billing", "billing.rejectVoid", { voidId, note }),
  getVoidThreshold: () => call("billing", "billing.getVoidThreshold", {}, { read: true }),
  setVoidThreshold: (amount) => call("billing", "billing.setVoidThreshold", { amount }),
}
