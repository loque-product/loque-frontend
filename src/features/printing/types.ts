import type { Bill, BillLine, FeeMode, Money } from "@/shared/types"

export type PaperWidth = 58 | 80

/** Jumlah karakter per baris untuk tiap lebar kertas thermal. */
export const PAPER_COLUMNS: Record<PaperWidth, number> = { 58: 32, 80: 48 }

/** Data sumber struk. Struktur ini sengaja longgar supaya `BillView` dapat dipakai langsung. */
export interface ReceiptSource {
  shop: { name: string; address: string }
  booking: { id: string; customerName: string }
  barberName: string
  lines: BillLine[]
  feeMode: FeeMode
  feeAmount: Money
  bill: Pick<Bill, "id" | "status" | "method" | "paidAmount" | "completedAt" | "cashierName"> | null
  /** Dipakai bila tagihan belum selesai. */
  cashierName?: string
}

export interface ReceiptLine {
  label: string
  qty: number
  unitPrice: Money
  total: Money
}
export interface ReceiptSection {
  title: string
  lines: ReceiptLine[]
}
export type ReceiptStatus = "paid" | "unpaid" | "void"

export interface Receipt {
  shopName: string
  shopAddress: string
  dateTime: string
  billNumber: string
  customer: string
  cashier: string
  barber: string
  sections: ReceiptSection[]
  subtotal: Money
  /** Booking fee yang dibayar online sesuai skema booking (0 bila tanpa fee). */
  bookingFeePaid: Money
  /** Potongan booking fee atas tagihan. */
  feeCredit: Money
  total: Money
  paymentMethod: string | null
  /** Nominal diterima di toko; null bila belum lunas. */
  paidAtShop: Money | null
  remaining: Money
  status: ReceiptStatus
  thanks: string
}

export interface PrintOptions {
  width: PaperWidth
}
