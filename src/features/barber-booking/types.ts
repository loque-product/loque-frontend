import type {
  BookingItem,
  BookingSource,
  HhmmString,
  Id,
  IsoDateTime,
  Money,
  YmdString,
} from "@/shared/types"

export type BarberBookingStatus = "confirmed" | "completed"

export interface BarberBooking {
  id: Id
  start: IsoDateTime
  end: IsoDateTime
  /** Booking Unpaid tidak pernah dikirim ke barber. */
  status: BarberBookingStatus
  customerName: string
  items: BookingItem[]
  source: BookingSource
}

export interface BarberBookingDetail extends BarberBooking {
  code: string
  /** Nomor customer; null untuk walk-in tanpa nomor. Hanya untuk urusan booking. */
  customerPhone: string | null
  /** Kanal tautan bila booking datang dari tautan pribadi. */
  channel?: "instagram" | "tiktok" | "whatsapp"
  serviceTotal: Money
  barberName: string
  shopName: string
}

export interface DayBlock {
  id: Id
  from: HhmmString
  to: HhmmString
  label: string
}

export interface BarberDay {
  date: YmdString
  /** Jam kerja barber pada hari itu; null bila libur atau toko tutup. */
  window: { from: HhmmString; to: HhmmString } | null
  /** Alasan toko tutup pada hari itu, bila ada. */
  closedReason: string | null
  bookings: BarberBooking[]
  blocks: DayBlock[]
}
