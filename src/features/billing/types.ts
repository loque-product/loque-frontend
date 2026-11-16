import type {
  Bill,
  BillLine,
  Booking,
  FeeMode,
  Money,
  PayMethod,
  VoidRequestPublic,
  VoidStatus,
} from "@/shared/types"

export interface BillRow {
  booking: Booking
  bill: Bill | null
  voidStatus: VoidStatus | null
}

export interface BillView {
  booking: Booking
  /** Tagihan yang sudah selesai, jika ada. */
  bill: Bill | null
  /** Baris tagihan: dari booking (harga tersimpan) ditambah baris bebas yang sudah dicatat. */
  lines: BillLine[]
  feeMode: FeeMode
  feeAmount: Money
  voidRequest: VoidRequestPublic | null
  voidThreshold: Money
  /** Data untuk struk. */
  shop: { name: string; address: string }
  barberName: string
}

export interface CompleteBillInput {
  bookingId: string
  extraLines: Omit<BillLine, "id">[]
  method: PayMethod
  paidAmount: Money
}

export type VoidCodeError = { attemptsLeft?: number; locked?: boolean }
