import type { Slot } from "@/features/schedule"
import type {
  Barber,
  Bill,
  Booking,
  Id,
  Money,
  Refund,
  VoidRequestPublic,
  YmdString,
} from "@/shared/types"

export type { Slot }

export interface DayView {
  date: YmdString
  closedReason: string | null
  bookings: Booking[]
  updatedAt: string
}

export interface BookingDetail {
  booking: Booking
  barber: Barber
  bill: Bill | null
  refund: Refund | null
  voidRequest: VoidRequestPublic | null
  /** Booking berikutnya dari barber yang sama pada hari itu. */
  nextBooking: Booking | null
  /** Ada booking lain yang menempati slot ini jika dikonfirmasi manual. */
  slotTaken: boolean
}

export interface SlotQuery {
  date: YmdString
  barberId: Id
  serviceIds: Id[]
  isWalkIn: boolean
  ignoreBookingId?: Id
}

export interface CreateBookingInput {
  /** walkin: tanpa booking fee. booking: dibuat staf dengan skema fee aktif. */
  mode: "walkin" | "booking"
  name: string
  phone?: string
  note?: string
  barberId: Id
  date: YmdString
  time: string
  serviceIds: Id[]
}

export interface UpdateBookingInput {
  id: Id
  date: YmdString
  time: string
  barberId: Id
  serviceIds: Id[]
  name: string
  phone: string
  note?: string
}

export interface UpdateBookingResult {
  booking: Booking
  scheduleOrBarberChanged: boolean
  priceDelta: Money
  requiresCustomerApproval: boolean
  conflictWith: Booking | null
}
