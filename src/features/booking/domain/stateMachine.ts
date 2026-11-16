import { NO_SHOW_CONTACT_MINUTES, NO_SHOW_WAIT_MINUTES } from "@/shared/constants"
import { minutesBetween } from "@/shared/domain/time"
import type { Booking, BookingStatus } from "@/shared/types"

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  unpaid: ["confirmed", "expired", "cancelled_customer", "cancelled_shop"],
  confirmed: ["completed", "cancelled_customer", "cancelled_shop", "no_show"],
  no_show: ["confirmed"],
  completed: [],
  expired: [],
  cancelled_customer: [],
  cancelled_shop: [],
}

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to))
    throw new Error(`Perpindahan status ${from} ke ${to} tidak diizinkan.`)
}

export interface NoShowState {
  enabled: boolean
  needsConfirm: boolean
  contactVisible: boolean
  minutesSinceStart: number
}

export function noShowState(b: Pick<Booking, "start" | "status">, now: number): NoShowState {
  const since = minutesBetween(b.start, now)
  const confirmed = b.status === "confirmed"
  return {
    enabled: confirmed && since >= 0,
    needsConfirm: since < NO_SHOW_WAIT_MINUTES,
    contactVisible: confirmed && since >= NO_SHOW_CONTACT_MINUTES,
    minutesSinceStart: since,
  }
}

/** Booking fee hangus pada batal pelanggan dan tidak hadir; dikembalikan saat toko membatalkan. */
export function feeOutcome(status: BookingStatus): "forfeit" | "refund" | null {
  if (status === "cancelled_customer" || status === "no_show") return "forfeit"
  if (status === "cancelled_shop") return "refund"
  return null
}
