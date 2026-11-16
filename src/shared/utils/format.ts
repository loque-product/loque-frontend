import type { IsoDateTime, Money, YmdString } from "@/shared/types"
import { fromWib, wibParts } from "@/shared/domain/time"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const DAYS_LONG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const pad = (n: number) => String(n).padStart(2, "0")

/** Rp 45.000 */
export function formatRupiah(value: Money): string {
  const sign = value < 0 ? "-" : ""
  return `${sign}Rp ${Math.abs(Math.round(value)).toLocaleString("id-ID")}`
}

/** 31 Okt 2026 */
export function formatDate(input: IsoDateTime | Date | number | YmdString): string {
  const date = typeof input === "string" && input.length === 10 ? fromWib(input, "12:00") : input
  const p = wibParts(date)
  return `${p.d} ${MONTHS[p.m - 1]} ${p.y}`
}

/** Sel, 3 Nov */
export function formatDayShort(input: IsoDateTime | Date | number | YmdString): string {
  const date = typeof input === "string" && input.length === 10 ? fromWib(input, "12:00") : input
  const p = wibParts(date)
  return `${DAYS[p.dow]}, ${p.d} ${MONTHS[p.m - 1]}`
}

export function formatDayLong(input: IsoDateTime | Date | number | YmdString): string {
  const date = typeof input === "string" && input.length === 10 ? fromWib(input, "12:00") : input
  const p = wibParts(date)
  return `${DAYS_LONG[p.dow]}, ${p.d} ${MONTHS[p.m - 1]} ${p.y}`
}

/** 14.30 */
export function formatTime(input: IsoDateTime | Date | number): string {
  const p = wibParts(input)
  return `${pad(p.hh)}.${pad(p.mm)}`
}

/** 4 Nov 2026, 14.30 */
export function formatDateTime(input: IsoDateTime | Date | number): string {
  return `${formatDate(input)}, ${formatTime(input)}`
}

/** 14.30 WIB */
export function formatTimeWib(input: IsoDateTime | Date | number): string {
  return `${formatTime(input)} WIB`
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} menit`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} jam` : `${h} jam ${m} menit`
}

/** 26 Sep sampai 25 Okt 2026 */
export function formatPeriod(from: YmdString, to: YmdString): string {
  const a = wibParts(fromWib(from, "12:00"))
  const b = wibParts(fromWib(to, "12:00"))
  return `${a.d} ${MONTHS[a.m - 1]} sampai ${b.d} ${MONTHS[b.m - 1]} ${b.y}`
}

/** Usia relatif, misalnya "2 hari" atau "3 jam". */
export function formatAge(from: IsoDateTime, now: number = Date.now()): string {
  const min = Math.max(0, Math.round((now - new Date(from).getTime()) / 60000))
  if (min < 60) return `${min} menit`
  if (min < 60 * 24) return `${Math.floor(min / 60)} jam`
  return `${Math.floor(min / 1440)} hari`
}

/** Menjadi 0812-0000-1234 bila 12 digit. */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (d.length < 9) return raw
  return `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`
}

/** 12.40 untuk 12 menit 40 detik. */
export function formatCountdown(ms: number): string {
  const s = Math.ceil(Math.max(0, ms) / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, "0")}.${String(s % 60).padStart(2, "0")}`
}
