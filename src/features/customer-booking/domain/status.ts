import { HOLD_MINUTES } from "@/shared/constants"
import type { BookingStatus, IsoDateTime } from "@/shared/types"

export type BookingTab = "upcoming" | "done" | "cancelled"

/** Tab Booking saya. Booking kedaluwarsa (hold habis) tidak ditampilkan. */
export function tabOf(status: BookingStatus): BookingTab | null {
  switch (status) {
    case "unpaid":
    case "confirmed":
      return "upcoming"
    case "completed":
      return "done"
    case "cancelled_customer":
    case "cancelled_shop":
    case "no_show":
      return "cancelled"
    case "expired":
      return null
  }
}

/** Customer boleh membatalkan sampai jam mulai. */
export function canCancel(b: { status: BookingStatus; start: IsoDateTime }, now: number): boolean {
  return (b.status === "confirmed" || b.status === "unpaid") && now < new Date(b.start).getTime()
}

/** Sisa waktu hold dalam milidetik; 0 bila habis. */
export function holdRemainingMs(
  holdExpiresAt: IsoDateTime | null | undefined,
  now: number,
): number {
  if (!holdExpiresAt) return 0
  return Math.max(0, new Date(holdExpiresAt).getTime() - now)
}

export const holdActive = (
  b: { status: BookingStatus; holdExpiresAt?: IsoDateTime | null },
  now: number,
) => b.status === "unpaid" && holdRemainingMs(b.holdExpiresAt, now) > 0

export const HOLD_TOTAL_MS = HOLD_MINUTES * 60_000

export { formatCountdown } from "@/shared/utils/format"
