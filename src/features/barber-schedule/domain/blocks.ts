import { SLOT_MINUTES } from "@/shared/constants"
import { addDaysYmd, dowOfYmd, hhmmToMinutes, todayYmd } from "@/shared/domain/time"
import type { DayHours, ScheduleBlock, ShopHours, YmdString } from "@/shared/types"
import type { BlockForm, SaveBlockInput } from "../types"

export type FieldErrors = Partial<Record<"date" | "endDate" | "endTime" | "repeatUntil", string>>

const onSlot = (t: string) => hhmmToMinutes(t) % SLOT_MINUTES === 0

/** Memeriksa isian blok dan mengembalikan galat per kolom (kosong bila valid). */
export function validateBlockForm(f: BlockForm): FieldErrors {
  const e: FieldErrors = {}
  if (!f.date) e.date = "Pilih tanggal."
  if (f.kind === "range" && f.endDate < f.date)
    e.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai."
  if (f.kind === "partial") {
    if (!f.startTime || !f.endTime) e.endTime = "Isi jam mulai dan jam selesai."
    else if (!onSlot(f.startTime) || !onSlot(f.endTime)) e.endTime = "Jam berkelipatan 30 menit."
    else if (hhmmToMinutes(f.endTime) <= hhmmToMinutes(f.startTime))
      e.endTime = "Jam selesai harus setelah jam mulai."
  }
  if (f.weekly && f.kind !== "range" && f.repeatUntil < f.date)
    e.repeatUntil = "Batas pengulangan tidak boleh sebelum tanggal mulai."
  return e
}

/** Mengubah isian formulir menjadi bentuk yang dikirim ke server. Pengulangan mingguan tidak berlaku untuk rentang tanggal. */
export function toSaveInput(f: BlockForm): SaveBlockInput {
  const weekly = f.weekly && f.kind !== "range"
  const to = f.kind === "range" ? f.endDate : weekly ? f.repeatUntil : f.date
  return {
    from: f.date,
    to,
    startTime: f.kind === "partial" ? f.startTime : null,
    endTime: f.kind === "partial" ? f.endTime : null,
    weekly,
    label: f.reason.trim(),
  }
}

/** Tanggal yang tercakup blok (pengulangan mingguan hanya pada hari yang sama dengan tanggal mulai). */
export function datesCovered(
  b: Pick<SaveBlockInput, "from" | "to" | "weekly">,
  limit = 400,
): YmdString[] {
  const out: YmdString[] = []
  const dow = dowOfYmd(b.from)
  for (let d = b.from; d <= b.to && out.length < limit; d = addDaysYmd(d, 1)) {
    if (!b.weekly || dowOfYmd(d) === dow) out.push(d)
  }
  return out
}

/** Alasan toko tutup pada tanggal itu, atau null bila toko buka. */
export function shopClosedOn(shop: ShopHours, date: YmdString): string | null {
  const holiday = shop.holidays.find((h) => date >= h.from && date <= h.to)
  if (holiday) return `Libur: ${holiday.label}`
  const day = shop.days[dowOfYmd(date)]
  return !day || !day.open ? "Toko tutup" : null
}

/** True bila setiap tanggal blok sudah ditutup toko, sehingga blok tidak diperlukan. */
export function coveredByShopClosure(b: SaveBlockInput, shop: ShopHours): boolean {
  const dates = datesCovered(b)
  return dates.length > 0 && dates.every((d) => shopClosedOn(shop, d) !== null)
}

/** Memeriksa jam kerja: kelipatan 30 menit, selesai setelah mulai, dan di dalam jam buka toko. */
export function validateWorkingHours(days: DayHours[], shop: ShopHours): Record<number, string> {
  const errors: Record<number, string> = {}
  days.forEach((d, i) => {
    if (!d.open) return
    const limit = shop.days[i]
    if (!limit?.open) return void (errors[i] = "Toko tutup pada hari ini.")
    if (!onSlot(d.from) || !onSlot(d.to)) return void (errors[i] = "Jam berkelipatan 30 menit.")
    if (hhmmToMinutes(d.to) <= hhmmToMinutes(d.from))
      return void (errors[i] = "Jam selesai harus setelah jam mulai.")
    if (
      hhmmToMinutes(d.from) < hhmmToMinutes(limit.from) ||
      hhmmToMinutes(d.to) > hhmmToMinutes(limit.to)
    )
      errors[i] = "Jam kerja harus di dalam jam buka toko."
  })
  return errors
}

export type DayKind = "shop-closed" | "blocked" | "off" | "working"

/** Penanda satu tanggal pada kalender bulanan hanya baca. Prioritas: toko tutup, libur barber, blok, hari kerja. */
export function dayKind(
  date: YmdString,
  shop: ShopHours,
  hours: DayHours[],
  blocks: ScheduleBlock[],
): { kind: DayKind; label?: string } {
  const closed = shopClosedOn(shop, date)
  if (closed) return { kind: "shop-closed", label: closed }
  const wh = hours[dowOfYmd(date)]
  if (!wh?.open) return { kind: "off", label: "Libur" }
  const hit = blocks.find((b) => blockHitsDate(b, date))
  if (hit) return { kind: "blocked", label: hit.label || "Blok waktu" }
  return { kind: "working" }
}

export function blockHitsDate(
  b: Pick<ScheduleBlock, "from" | "to" | "weekly">,
  date: YmdString,
): boolean {
  if (date < b.from || date > b.to) return false
  return b.weekly ? dowOfYmd(date) === dowOfYmd(b.from) : true
}

/** Ringkasan rentang blok untuk daftar. */
export function blockSummary(b: ScheduleBlock): {
  kind: string
  range: string
  repeat: string | null
} {
  const same = b.from === b.to
  const kind = b.startTime
    ? "Sebagian jam"
    : same || b.weekly
      ? "Satu hari penuh"
      : "Rentang tanggal"
  const time = b.startTime
    ? `${b.startTime.replace(":", ".")} sampai ${b.endTime?.replace(":", ".")}`
    : "Sehari penuh"
  return { kind, range: time, repeat: b.weekly ? "Berulang tiap minggu" : null }
}

export const defaultRepeatUntil = (date: YmdString = todayYmd()): YmdString => addDaysYmd(date, 84)

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const

const pad = (n: number) => String(n).padStart(2, "0")

/** Awal bulan (YYYY-MM-01) untuk tanggal tertentu, dan geser bulan. */
export const monthStart = (date: YmdString): YmdString => `${date.slice(0, 7)}-01`
export function shiftMonth(first: YmdString, delta: number): YmdString {
  const y = Number(first.slice(0, 4))
  const m = Number(first.slice(5, 7)) - 1 + delta
  return `${y + Math.floor(m / 12)}-${pad((((m % 12) + 12) % 12) + 1)}-01`
}
export const monthLabel = (first: YmdString): string =>
  `${MONTH_NAMES[Number(first.slice(5, 7)) - 1]} ${first.slice(0, 4)}`

/** Kisi kalender bulanan, minggu mulai Senin. Sel di luar bulan bernilai null. */
export function monthGrid(first: YmdString): (YmdString | null)[][] {
  const y = Number(first.slice(0, 4))
  const m = Number(first.slice(5, 7))
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const lead = (dowOfYmd(first) + 6) % 7
  const cells: (YmdString | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: total }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (YmdString | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}
