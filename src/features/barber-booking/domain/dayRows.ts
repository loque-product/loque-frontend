import { SLOT_MINUTES } from "@/shared/constants"
import { hhmmToMinutes, minutesToHhmm, toHhmm } from "@/shared/domain/time"
import type { HhmmString } from "@/shared/types"
import type { BarberBooking, BarberDay } from "../types"

export type DayRow =
  | { kind: "booking"; key: string; from: number; to: number; booking: BarberBooking }
  | { kind: "block"; key: string; from: number; to: number; label: string }
  | { kind: "free"; key: string; from: number; to: number }

export const rowTime = (min: number): HhmmString => minutesToHhmm(min)

const minutesOf = (iso: string) => hhmmToMinutes(toHhmm(iso))

/**
 * Menyusun baris Hari ini urut jam: booking, blok waktu, dan jam kosong di dalam jam kerja.
 * Jam kosong hanya muncul bila selisihnya minimal satu slot (30 menit).
 */
export function buildDayRows(day: BarberDay): DayRow[] {
  const rows: DayRow[] = []
  for (const b of day.bookings) {
    rows.push({
      kind: "booking",
      key: b.id,
      from: minutesOf(b.start),
      to: minutesOf(b.end),
      booking: b,
    })
  }
  const win = day.window
    ? { from: hhmmToMinutes(day.window.from), to: hhmmToMinutes(day.window.to) }
    : null
  for (const k of day.blocks) {
    const from = hhmmToMinutes(k.from)
    const to = hhmmToMinutes(k.to)
    // Blok di luar jam kerja tidak relevan bagi barber.
    const clipped = win
      ? { from: Math.max(from, win.from), to: Math.min(to, win.to) }
      : { from, to }
    if (clipped.to > clipped.from)
      rows.push({ kind: "block", key: `blk-${k.id}`, ...clipped, label: k.label })
  }
  if (win) {
    const busy = rows.map((r) => ({ from: r.from, to: r.to })).sort((a, b) => a.from - b.from)
    let cursor = win.from
    for (const r of busy) {
      if (r.from - cursor >= SLOT_MINUTES)
        rows.push({ kind: "free", key: `free-${cursor}`, from: cursor, to: r.from })
      cursor = Math.max(cursor, r.to)
    }
    if (win.to - cursor >= SLOT_MINUTES)
      rows.push({ kind: "free", key: `free-${cursor}`, from: cursor, to: win.to })
  }
  const order = { booking: 0, block: 1, free: 2 } as const
  return rows.sort((a, b) => a.from - b.from || order[a.kind] - order[b.kind])
}

/** Judul baris blok: "Diblok: Istirahat". */
export const blockLabel = (label: string): string =>
  label.trim() ? `Diblok: ${label.trim()}` : "Diblok"

/** Ringkasan layanan untuk baris: "Haircut" atau "Haircut dan 2 lainnya". */
export function itemsSummary(items: { name: string }[]): string {
  if (items.length === 0) return "Layanan"
  if (items.length === 1) return items[0].name
  return `${items[0].name} dan ${items.length - 1} lainnya`
}
