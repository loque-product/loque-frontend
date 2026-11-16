import type { Invoice } from "@/shared/types"

export interface InvoiceView {
  invoice: Invoice
  shopId: string
  shopName: string
  notCharged: { zero: number; productOnly: number }
  closesAt: string
  /** Periode berjalan belum ditutup. */
  isOpen: boolean
}
