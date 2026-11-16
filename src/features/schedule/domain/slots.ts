import { SLOT_MINUTES, MIN_LEAD_MINUTES } from "@/shared/constants"
import {
  dowOfYmd,
  fromWib,
  hhmmToMinutes,
  minutesBetween,
  minutesToHhmm,
  toHhmm,
  toYmd,
} from "@/shared/domain/time"
import type {
  Booking,
  BookingStatus,
  HhmmString,
  Id,
  ScheduleBlock,
  ShopHours,
  Timeblock,
  WorkingHours,
  YmdString,
} from "@/shared/types"

export interface ScheduleContext {
  shopHours: ShopHours
  workingHours: WorkingHours[]
  blocks: ScheduleBlock[]
  /** Penutup slot per barber (rentang waktu bebas). */
  timeblocks?: Timeblock[]
}

export interface BlockedRange {
  from: number
  to: number
  label: string
  scope: "shop" | "barber"
  /** Terisi bila rentang berasal dari Timeblock, supaya bisa dibuka untuk diedit. */
  timeblockId?: string
}

/** Status yang menempati slot. */
const OCCUPYING: BookingStatus[] = ["unpaid", "confirmed", "completed", "no_show"]
export const occupiesSlot = (b: Pick<Booking, "status">) => OCCUPYING.includes(b.status)

export function shopClosedReason(ctx: ScheduleContext, date: YmdString): string | null {
  const holiday = ctx.shopHours.holidays.find((h) => date >= h.from && date <= h.to)
  if (holiday) return `Libur: ${holiday.label}`
  const day = ctx.shopHours.days[dowOfYmd(date)]
  if (!day || !day.open) return "Toko tutup pada hari ini"
  return null
}

function blockApplies(block: ScheduleBlock, date: YmdString): boolean {
  if (date < block.from || date > block.to) return false
  if (block.weekly) return dowOfYmd(date) === dowOfYmd(block.from)
  return true
}

/** Rentang menit yang tertutup untuk barber pada tanggal tertentu (blok toko dan blok barber). */
export function blockedRanges(ctx: ScheduleContext, date: YmdString, barberId: Id): BlockedRange[] {
  const fromBlocks: BlockedRange[] = ctx.blocks
    .filter((b) => (b.barberId === null || b.barberId === barberId) && blockApplies(b, date))
    .map((b) => ({
      from: b.startTime ? hhmmToMinutes(b.startTime) : 0,
      to: b.endTime ? hhmmToMinutes(b.endTime) : 24 * 60,
      label: b.label,
      scope: b.barberId === null ? ("shop" as const) : ("barber" as const),
    }))
  const dayStart = fromWib(date, "00:00").getTime()
  const dayEnd = dayStart + 24 * 60 * 60000
  const fromTimeblocks: BlockedRange[] = (ctx.timeblocks ?? [])
    .filter((t) => t.barberId === barberId)
    .flatMap((t) => {
      const start = new Date(t.startAt).getTime()
      const end = new Date(t.endAt).getTime()
      if (start >= dayEnd || end <= dayStart) return []
      return [
        {
          from: Math.round((Math.max(start, dayStart) - dayStart) / 60000),
          to: Math.round((Math.min(end, dayEnd) - dayStart) / 60000),
          label: t.reason || "Timeblock",
          scope: "barber" as const,
          timeblockId: t.id,
        },
      ]
    })
  return [...fromBlocks, ...fromTimeblocks]
}

/** Jendela kerja barber: jam toko dipotong jam kerja barber. Jadwal toko mengalahkan jam kerja barber. */
export function openWindow(
  ctx: ScheduleContext,
  date: YmdString,
  barberId: Id,
): { from: number; to: number } | null {
  if (shopClosedReason(ctx, date)) return null
  const shopDay = ctx.shopHours.days[dowOfYmd(date)]
  const barberDay = ctx.workingHours.find((w) => w.barberId === barberId)?.days[dowOfYmd(date)]
  if (!barberDay || !barberDay.open) return null
  const from = Math.max(hhmmToMinutes(shopDay.from), hhmmToMinutes(barberDay.from))
  const to = Math.min(hhmmToMinutes(shopDay.to), hhmmToMinutes(barberDay.to))
  return to > from ? { from, to } : null
}

export type SlotReason = "closed" | "block" | "booked" | "past"
export interface Slot {
  time: HhmmString
  available: boolean
  reason?: SlotReason
}

export interface SlotQuery {
  date: YmdString
  barberId: Id
  /** Total durasi layanan dalam menit. */
  duration: number
  bookings: Booking[]
  now: number
  /** Walk-in staf tidak dibatasi 60 menit ke depan. */
  isWalkIn: boolean
  ignoreBookingId?: Id
}

const overlaps = (aFrom: number, aTo: number, bFrom: number, bTo: number) =>
  aFrom < bTo && bFrom < aTo

/** Slot mulai per 30 menit yang muat dengan total durasi. */
export function computeSlots(ctx: ScheduleContext, q: SlotQuery): Slot[] {
  const win = openWindow(ctx, q.date, q.barberId)
  if (!win) return []
  const blocks = blockedRanges(ctx, q.date, q.barberId)
  const busy = q.bookings
    .filter(
      (b) =>
        b.barberId === q.barberId &&
        occupiesSlot(b) &&
        b.id !== q.ignoreBookingId &&
        toYmd(b.start) === q.date,
    )
    .map((b) => ({
      from: hhmmToMinutes(toHhmm(b.start)),
      to: hhmmToMinutes(toHhmm(b.end)) || 24 * 60,
    }))

  const slots: Slot[] = []
  for (let t = win.from; t + SLOT_MINUTES <= win.to; t += SLOT_MINUTES) {
    const time = minutesToHhmm(t)
    const end = t + q.duration
    let reason: SlotReason | undefined
    if (end > win.to) reason = "closed"
    else if (blocks.some((b) => overlaps(t, end, b.from, b.to))) reason = "block"
    else if (busy.some((b) => overlaps(t, end, b.from, b.to))) reason = "booked"
    else if (!q.isWalkIn && minutesBetween(q.now, fromWib(q.date, time)) < MIN_LEAD_MINUTES)
      reason = "past"
    slots.push({ time, available: !reason, reason })
  }
  return slots
}

/** Jam kosong terdekat dari jam yang diminta. */
export function nearestAvailable(slots: Slot[], target: HhmmString, count = 3): HhmmString[] {
  const t = hhmmToMinutes(target)
  return slots
    .filter((s) => s.available)
    .sort((a, b) => Math.abs(hhmmToMinutes(a.time) - t) - Math.abs(hhmmToMinutes(b.time) - t))
    .slice(0, count)
    .map((s) => s.time)
    .sort()
}

/** Apakah booking masih muat di jadwal (tanpa memperhitungkan booking lain). */
export function bookingFitsSchedule(
  ctx: ScheduleContext,
  b: Pick<Booking, "barberId" | "start" | "end">,
): boolean {
  const date = toYmd(b.start)
  const win = openWindow(ctx, date, b.barberId)
  if (!win) return false
  const from = hhmmToMinutes(toHhmm(b.start))
  const to = hhmmToMinutes(toHhmm(b.end)) || 24 * 60
  if (from < win.from || to > win.to) return false
  return !blockedRanges(ctx, date, b.barberId).some((r) => overlaps(from, to, r.from, r.to))
}

/** Booking aktif mendatang yang tertimpa jadwal baru. */
export function findAffectedBookings(
  ctx: ScheduleContext,
  bookings: Booking[],
  now: number,
): Booking[] {
  return bookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "unpaid") &&
      new Date(b.end).getTime() > now &&
      !bookingFitsSchedule(ctx, b),
  )
}
