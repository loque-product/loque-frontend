import { describe, expect, it } from "vitest"
import { fromWib } from "@/shared/domain/time"
import type { Bill, VoidRequest } from "@/shared/types"
import {
  computePeriodSummary,
  isPeriodClosed,
  nextInvoiceNumber,
  nextPeriod,
  periodFor,
} from "./period"

const bill = (id: string, ymd: string, total: number, chargeable = true, voidedAt?: string): Bill =>
  ({
    id,
    bookingId: id,
    lines: [],
    status: "completed",
    total,
    creditToBill: 0,
    payAtShop: total,
    chargeable,
    completedAt: fromWib(ymd, "12:00").toISOString(),
    voidedAt,
  }) as Bill

describe("periode invoice", () => {
  it("menentukan periode 26 sampai 25", () => {
    expect(periodFor(fromWib("2026-10-03", "10:00"))).toEqual({
      start: "2026-09-26",
      end: "2026-10-25",
    })
    expect(periodFor(fromWib("2026-10-26", "00:05"))).toEqual({
      start: "2026-10-26",
      end: "2026-11-25",
    })
    expect(periodFor(fromWib("2026-01-10", "10:00"))).toEqual({
      start: "2025-12-26",
      end: "2026-01-25",
    })
    expect(nextPeriod({ start: "2026-12-26", end: "2027-01-25" })).toEqual({
      start: "2027-01-26",
      end: "2027-02-25",
    })
  })
  it("periode tutup tanggal 25 pukul 23.59.59 WIB", () => {
    const p = { start: "2026-09-26", end: "2026-10-25" }
    expect(isPeriodClosed(p, fromWib("2026-10-25", "23:59").getTime())).toBe(false)
    expect(isPeriodClosed(p, fromWib("2026-10-26", "00:00").getTime())).toBe(true)
  })
  it("menagih Rp 2.000 per transaksi yang layak dan membatalkan biaya void sebelum tutup", () => {
    const period = { start: "2026-09-26", end: "2026-10-25" }
    const bills = [
      bill("a", "2026-10-01", 50000),
      bill("b", "2026-10-02", 0),
      bill("c", "2026-10-03", 20000, false),
      bill("d", "2026-10-04", 40000, true, fromWib("2026-10-10", "10:00").toISOString()),
      bill("e", "2026-10-05", 60000, true, fromWib("2026-10-28", "10:00").toISOString()),
    ]
    const s = computePeriodSummary({
      bills,
      voids: [],
      period,
      labelOf: (b) => b.id,
    })
    expect(s.lines.map((l) => l.bookingId)).toEqual(["a", "e"])
    expect(s.total).toBe(4000)
    expect(s.notCharged).toEqual({ zero: 1, productOnly: 1 })
  })
  it("void setelah tutup menjadi kredit di periode berikutnya", () => {
    const next = { start: "2026-10-26", end: "2026-11-25" }
    const e = bill("e", "2026-10-05", 60000, true, fromWib("2026-10-28", "10:00").toISOString())
    const v = {
      id: "v1",
      billId: "e",
      status: "approved",
      decidedAt: fromWib("2026-10-28", "10:00").toISOString(),
    } as VoidRequest
    const s = computePeriodSummary({
      bills: [e, bill("f", "2026-11-02", 30000)],
      voids: [v],
      period: next,
      labelOf: (b) => b.id,
    })
    expect(s.credits).toHaveLength(1)
    expect(s.creditTotal).toBe(2000)
    expect(s.total).toBe(0)
  })
  it("nomor invoice berurutan", () => {
    expect(nextInvoiceNumber(["LQ-2026-0001", "LQ-2026-0002"], 2026)).toBe("LQ-2026-0003")
    expect(nextInvoiceNumber([], 2026)).toBe("LQ-2026-0001")
  })
})
