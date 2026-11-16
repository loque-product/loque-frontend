import type { ShareChannel } from "@/shared/domain/links"
import type {
  BookingItem,
  BookingStatus,
  FeeMode,
  Gender,
  HhmmString,
  Id,
  IsoDateTime,
  Money,
  ServiceOverride,
  YmdString,
} from "@/shared/types"
import type { CatalogService } from "./domain/cart"

export type { CatalogService }

export interface CustomerCatalog {
  services: CatalogService[]
  overrides: ServiceOverride[]
  /** Gender yang dilayani toko. Satu gender: langkah data tamu melewati pilihan gender. */
  genders: Gender[]
  /** Skema dan nominal fee saat ini. */
  feeMode: FeeMode
  feeAmount: Money
}

export type RefundState = "processing" | "done"

export interface CustomerBooking {
  id: Id
  /** Kode booking yang bisa disalin dan ditunjukkan di toko. */
  code: string
  status: BookingStatus
  start: IsoDateTime
  end: IsoDateTime
  barberId: Id
  barberSlug: string
  barberName: string
  barberPhotoUrl: string | null
  items: BookingItem[]
  serviceTotal: Money
  /** Skema dan nominal fee yang tersimpan di booking ini. */
  feeMode: FeeMode
  feeAmount: Money
  /** Sisa bayar di toko menurut skema booking ini (dihitung server). */
  payAtShop: Money
  /** Batas hold 15 menit; terisi selama Unpaid. */
  holdExpiresAt: IsoDateTime | null
  /** Pembayaran masuk setelah hold habis dan sedang diperiksa toko. */
  latePayment: boolean
  guestName: string | null
  gender: Gender
  cancelReason: string | null
  refund: RefundState | null
  /** Jadwal diubah oleh toko. */
  rescheduled: boolean
  walkIn: boolean
  reviewable: boolean
  reviewId: Id | null
  createdAt: IsoDateTime
}

export interface CustomerBookingDetail {
  booking: CustomerBooking
  shop: { name: string; address: string; mapsUrl: string; whatsapp: string }
}

export interface AvailabilityQuery {
  barberId: Id
  serviceIds: Id[]
  from: YmdString
  days: number
}
export interface DayAvailability {
  date: YmdString
  /** Jumlah slot tersedia; 0 berarti tanggal dinonaktifkan. */
  slots: number
}
export interface SlotsQuery {
  barberId: Id
  serviceIds: Id[]
  date: YmdString
}
export interface SlotOption {
  time: HhmmString
  /** false untuk jam penuh atau tertutup; ditampilkan "Tidak tersedia" tanpa alasan. */
  available: boolean
}
export interface NextAvailable {
  barberId: Id
  /** Jam kosong terdekat; null bila tidak ada dalam 45 hari. */
  at: IsoDateTime | null
}

export interface GuestInput {
  forSelf: boolean
  /** Wajib bila `forSelf` false. */
  guestName: string
  gender: Gender
}

export interface CreateCustomerBookingInput {
  guest: GuestInput
  barberId: Id
  serviceIds: Id[]
  date: YmdString
  time: HhmmString
  /** Fee yang dilihat customer; server menolak dengan FEE_CHANGED bila berbeda. */
  expectedFee: { mode: FeeMode; amount: Money }
  policyAccepted: boolean
  ref?: ShareChannel
}

export interface CreateCustomerBookingResult {
  booking: CustomerBooking
  /** false bila fee mati: booking langsung Terkonfirmasi. */
  paymentRequired: boolean
}

export interface PaymentSession {
  /** Halaman pembayaran DOKU; setelah selesai kembali ke /booking/status/:id. */
  redirectUrl: string
}

export type TransactionStatus = "paid" | "pending" | "failed" | "refund_processing" | "refunded"

export interface TransactionInfo {
  bookingId: Id
  code: string
  shopName: string
  status: TransactionStatus
  reference: string | null
  method: string | null
  amount: Money
  paidAt: IsoDateTime | null
}
