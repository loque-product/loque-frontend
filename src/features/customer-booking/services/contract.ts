import type { Gender, Id } from "@/shared/types"
import type {
  AvailabilityQuery,
  CreateCustomerBookingInput,
  CreateCustomerBookingResult,
  CustomerBooking,
  CustomerBookingDetail,
  CustomerCatalog,
  DayAvailability,
  NextAvailable,
  PaymentSession,
  SlotOption,
  SlotsQuery,
  TransactionInfo,
} from "../types"

export interface CustomerBookingService {
  /** Katalog, override harga, gender, dan skema fee. Tanpa login. */
  getCatalog(): Promise<CustomerCatalog>
  /** Jam kosong terdekat tiap barber untuk layanan dan gender terpilih. Tanpa login. */
  getNextAvailable(serviceIds: Id[], gender: Gender): Promise<NextAvailable[]>
  /** Jumlah slot per tanggal, 45 hari. Tanpa login. */
  getAvailability(q: AvailabilityQuery): Promise<DayAvailability[]>
  /** Seluruh slot 30 menit pada tanggal itu; `available` hanya bagi yang muat dengan total durasi dan mulai paling cepat 60 menit dari sekarang. */
  getSlots(q: SlotsQuery): Promise<SlotOption[]>
  /** Galat: SLOT_TAKEN, FEE_CHANGED (details: mode dan amount terbaru), HOLD_EXISTS (details: bookingId), VALIDATION. */
  create(input: CreateCustomerBookingInput): Promise<CreateCustomerBookingResult>
  /** Hold belum dibayar milik akun ini, bila ada. */
  getHold(): Promise<CustomerBooking | null>
  /** Melepas slot tanpa fee. */
  cancelHold(id: string): Promise<void>
  /** Membuka sesi pembayaran DOKU. HOLD_EXPIRED bila hold habis. */
  startPayment(bookingId: string): Promise<PaymentSession>
  list(): Promise<CustomerBooking[]>
  get(id: string): Promise<CustomerBookingDetail>
  /** Hanya sebelum jam mulai. Booking fee tidak dikembalikan. */
  cancel(id: string): Promise<CustomerBooking>
  getTransaction(id: string): Promise<TransactionInfo>
}
