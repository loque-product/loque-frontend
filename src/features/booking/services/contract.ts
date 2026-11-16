import type { Slot } from "@/features/schedule"
import type { Booking } from "@/shared/types"
import type {
  BookingDetail,
  DayView,
  SlotQuery,
  UpdateBookingInput,
  UpdateBookingResult,
  CreateBookingInput,
} from "../types"

export interface BookingService {
  listByDate(date: string): Promise<DayView>
  get(id: string): Promise<BookingDetail>
  getSlots(q: SlotQuery): Promise<Slot[]>
  /** Membuat booking oleh staf (walk-in atau booking biasa). */
  createBooking(input: CreateBookingInput): Promise<Booking>
  update(input: UpdateBookingInput): Promise<UpdateBookingResult>
  /** `confirmed` wajib true jika belum 15 menit sejak jam mulai. */
  markNoShow(id: string, confirmed: boolean): Promise<Booking>
  undoNoShow(id: string): Promise<Booking>
  cancelByCustomer(id: string, reason?: string): Promise<Booking>
  cancelByShop(id: string, reason: string): Promise<Booking>
  /** Pembayaran terlambat: konfirmasi manual jika slot masih kosong. */
  confirmLate(id: string): Promise<Booking>
}
