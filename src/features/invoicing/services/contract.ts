import type { InvoiceView } from "../types"

export interface InvoiceService {
  /** Owner: invoice toko sendiri, termasuk periode berjalan. Super Admin: tentukan toko. */
  list(shopId?: string): Promise<InvoiceView[]>
  /** Tutup periode berjalan (simulasi, Super Admin). */
  closeCurrentPeriod(shopId: string): Promise<InvoiceView>
  setPaid(invoiceId: string, paid: boolean, note?: string): Promise<void>
  /** Mencatat unduhan atau ekspor invoice ke audit. */
  recordExport(invoiceId: string, kind: "pdf" | "csv"): Promise<void>
}
