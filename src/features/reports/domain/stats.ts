import { addDaysYmd, toYmd, ymdRange } from "@/shared/domain/time"
import type { Bill, Booking, PayMethod, VoidRequest } from "@/shared/types"
import {
  COMPOSITION_LABEL,
  type CompositionKey,
  type CompositionSegment,
  type RangeStats,
  type RevenuePoint,
} from "../types"

const inRange = (iso: string | undefined, from: string, to: string) =>
  iso !== undefined && toYmd(iso) >= from && toYmd(iso) <= to
const countedBill = (b: Bill) => b.status !== "voided" && b.completedAt !== undefined

export function rangeStats(input: {
  bills: Bill[]
  bookings: Booking[]
  voids: VoidRequest[]
  from: string
  to: string
}): RangeStats {
  const { bills, bookings, voids, from, to } = input
  return {
    completed: bills.filter((b) => countedBill(b) && inRange(b.completedAt, from, to)).length,
    noShow: bookings.filter((b) => b.status === "no_show" && inRange(b.start, from, to)).length,
    cancelled: bookings.filter(
      (b) =>
        (b.status === "cancelled_customer" || b.status === "cancelled_shop") &&
        inRange(b.start, from, to),
    ).length,
    voids: voids.filter((v) => v.status === "approved" && inRange(v.decidedAt, from, to)).length,
    revenue: bills
      .filter((b) => countedBill(b) && inRange(b.completedAt, from, to))
      .reduce((a, b) => a + b.total, 0),
  }
}

export function revenueSeries(bills: Bill[], from: string, to: string): RevenuePoint[] {
  const map = new Map<string, RevenuePoint>(
    ymdRange(from, to).map((d) => [
      d,
      { date: d, total: 0, cash: 0, qris: 0, transfer: 0, other: 0 },
    ]),
  )
  for (const b of bills) {
    if (!countedBill(b) || !b.completedAt) continue
    const p = map.get(toYmd(b.completedAt))
    if (!p) continue
    p.total += b.total
    const key: Record<PayMethod, "cash" | "qris" | "transfer" | "other"> = {
      cash: "cash",
      qris: "qris",
      transfer: "transfer",
      other: "other",
    }
    if (b.method) p[key[b.method]] += b.paidAmount ?? b.payAtShop
  }
  return [...map.values()]
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

/** Rentang pembanding dengan panjang sama tepat sebelum rentang saat ini. */
export function previousRange(from: string, to: string): { from: string; to: string } {
  const len = ymdRange(from, to).length
  return { from: addDaysYmd(from, -len), to: addDaysYmd(from, -1) }
}

const KEYS: CompositionKey[] = ["service", "addon", "drink", "product"]

/** Jumlah per kategori dari baris tagihan yang sudah dibayar (tidak termasuk tagihan yang di-void). */
export function categoryTotals(
  bills: Bill[],
  from: string,
  to: string,
): Record<CompositionKey, number> {
  const out: Record<CompositionKey, number> = { service: 0, addon: 0, drink: 0, product: 0 }
  for (const b of bills) {
    if (!countedBill(b) || !inRange(b.completedAt, from, to)) continue
    for (const l of b.lines) out[l.kind] += l.qty * l.price
  }
  return out
}

/** Komposisi pendapatan: nominal dan persen dari total penjualan tiap kategori. */
export function composition(bills: Bill[], from: string, to: string): CompositionSegment[] {
  const totals = categoryTotals(bills, from, to)
  const sum = KEYS.reduce((a, k) => a + totals[k], 0)
  return KEYS.map((key) => ({
    key,
    label: COMPOSITION_LABEL[key],
    amount: totals[key],
    percent: sum === 0 ? 0 : (totals[key] / sum) * 100,
  }))
}
