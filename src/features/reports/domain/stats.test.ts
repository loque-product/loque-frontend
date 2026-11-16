import { describe, expect, it } from "vitest"
import { fromWib } from "@/shared/domain/time"
import type { Bill } from "@/shared/types"
import { categoryTotals, composition, percentChange, previousRange, revenueSeries } from "./stats"

const bill = (
  ymd: string,
  total: number,
  method: Bill["method"] = "cash",
  status: Bill["status"] = "completed",
): Bill =>
  ({
    id: ymd + total,
    bookingId: "b",
    lines: [],
    status,
    method,
    paidAmount: total,
    completedAt: fromWib(ymd, "12:00").toISOString(),
    total,
    creditToBill: 0,
    payAtShop: total,
    chargeable: true,
  }) as Bill

describe("statistik laporan", () => {
  it("menjumlahkan pendapatan per hari dan per metode, mengabaikan tagihan void", () => {
    const s = revenueSeries(
      [
        bill("2026-11-01", 50000),
        bill("2026-11-01", 20000, "qris"),
        bill("2026-11-01", 99000, "cash", "voided"),
      ],
      "2026-10-31",
      "2026-11-02",
    )
    expect(s.map((p) => p.total)).toEqual([0, 70000, 0])
    expect(s[1]).toMatchObject({ cash: 50000, qris: 20000 })
  })
  it("menghitung perubahan persen dan rentang pembanding", () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(5, 0)).toBeNull()
    expect(percentChange(0, 0)).toBe(0)
    expect(previousRange("2026-11-01", "2026-11-03")).toEqual({
      from: "2026-10-29",
      to: "2026-10-31",
    })
  })
})

describe("komposisi pendapatan", () => {
  const withLines = (
    ymd: string,
    lines: Bill["lines"],
    status: Bill["status"] = "completed",
  ): Bill =>
    ({
      ...bill(ymd, 1, "cash", status),
      lines,
      total: lines.reduce((a, l) => a + l.qty * l.price, 0),
    }) as Bill
  const L = (kind: Bill["lines"][number]["kind"], price: number, qty = 1) => ({
    id: kind + price,
    name: kind,
    kind,
    price,
    qty,
  })
  const bills = [
    withLines("2026-11-01", [L("service", 100000), L("addon", 10000), L("drink", 8000, 2)]),
    withLines("2026-11-02", [L("service", 50000), L("product", 65000)]),
    withLines("2026-11-02", [L("product", 999000)], "voided"),
    withLines("2026-10-01", [L("service", 777000)]),
  ]
  it("menjumlahkan baris menurut kategori dalam periode dan mengabaikan void", () => {
    expect(categoryTotals(bills, "2026-11-01", "2026-11-03")).toEqual({
      service: 150000,
      addon: 10000,
      drink: 16000,
      product: 65000,
    })
  })
  it("menghitung persen dari total penjualan", () => {
    const c = composition(bills, "2026-11-01", "2026-11-03")
    expect(c.map((s) => s.label)).toEqual(["Layanan", "Add-on", "Minuman/Makanan", "Produk"])
    expect(c.reduce((a, s) => a + s.percent, 0)).toBeCloseTo(100)
    expect(c[3].percent).toBeCloseTo((65000 / 241000) * 100)
  })
  it("periode tanpa penjualan menghasilkan persen nol", () => {
    expect(
      composition(bills, "2025-01-01", "2025-01-02").every(
        (s) => s.percent === 0 && s.amount === 0,
      ),
    ).toBe(true)
  })
})
