import type { InvoiceService } from "./contract"
import { httpInvoiceService } from "./http"

export type { InvoiceService } from "./contract"
export const invoiceService: InvoiceService = httpInvoiceService
