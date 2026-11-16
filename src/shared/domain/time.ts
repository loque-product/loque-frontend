import type { HhmmString, IsoDateTime, YmdString } from "@/shared/types"

/** Semua logika waktu memakai WIB (UTC+7) tanpa bergantung zona waktu peramban. */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000
export const MINUTE_MS = 60 * 1000
export const HOUR_MS = 60 * MINUTE_MS
export const DAY_MS = 24 * HOUR_MS

type DateInput = Date | string | number

const toMs = (d: DateInput): number => (d instanceof Date ? d.getTime() : new Date(d).getTime())

export interface WibParts {
  y: number
  m: number
  d: number
  hh: number
  mm: number
  /** 0 = Minggu */
  dow: number
}

export function wibParts(input: DateInput): WibParts {
  const x = new Date(toMs(input) + WIB_OFFSET_MS)
  return {
    y: x.getUTCFullYear(),
    m: x.getUTCMonth() + 1,
    d: x.getUTCDate(),
    hh: x.getUTCHours(),
    mm: x.getUTCMinutes(),
    dow: x.getUTCDay(),
  }
}

const pad = (n: number) => String(n).padStart(2, "0")

export function toYmd(input: DateInput): YmdString {
  const p = wibParts(input)
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`
}

export function toHhmm(input: DateInput): HhmmString {
  const p = wibParts(input)
  return `${pad(p.hh)}:${pad(p.mm)}`
}

export function hhmmToMinutes(t: HhmmString): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export function minutesToHhmm(min: number): HhmmString {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
}

/** Membuat Date dari tanggal dan jam WIB. */
export function fromWib(ymd: YmdString, hhmm: HhmmString = "00:00"): Date {
  const [y, m, d] = ymd.split("-").map(Number)
  const [hh, mm] = hhmm.split(":").map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - WIB_OFFSET_MS)
}

export function toIso(ymd: YmdString, hhmm: HhmmString = "00:00"): IsoDateTime {
  return fromWib(ymd, hhmm).toISOString()
}

export function addDaysYmd(ymd: YmdString, n: number): YmdString {
  return toYmd(fromWib(ymd).getTime() + n * DAY_MS + 12 * HOUR_MS)
}

export function dowOfYmd(ymd: YmdString): number {
  return wibParts(fromWib(ymd, "12:00")).dow
}

export function todayYmd(now: number = Date.now()): YmdString {
  return toYmd(now)
}

export function compareYmd(a: YmdString, b: YmdString): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function minutesBetween(a: DateInput, b: DateInput): number {
  return Math.round((toMs(b) - toMs(a)) / MINUTE_MS)
}

export function addMinutes(input: DateInput, min: number): Date {
  return new Date(toMs(input) + min * MINUTE_MS)
}

/** Tanggal ke-26 bulan lalu sampai ke-25 bulan ini yang memuat tanggal tertentu. */
export function ymdRange(from: YmdString, to: YmdString): YmdString[] {
  const out: YmdString[] = []
  for (let d = from; d <= to; d = addDaysYmd(d, 1)) out.push(d)
  return out
}
