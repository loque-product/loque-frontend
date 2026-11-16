// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { InvoiceService } from "./contract"

export const httpInvoiceService: InvoiceService = {
  list: (shopId) => call("invoicing", "invoicing.list", { shopId }, { read: true }),
  closeCurrentPeriod: (shopId) => call("invoicing", "invoicing.closeCurrentPeriod", { shopId }),
  setPaid: (invoiceId, paid, note) => call("invoicing", "invoicing.setPaid", { invoiceId, paid, note }),
  recordExport: (invoiceId, kind) => call("invoicing", "invoicing.recordExport", { invoiceId, kind }),
}
