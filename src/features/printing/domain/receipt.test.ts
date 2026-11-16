import { describe, expect, it } from "vitest"
import type { BillLine } from "@/shared/types"
import { PAPER_COLUMNS, type ReceiptSource } from "../types"
import { billNumber, buildReceipt, formatReceiptText } from "./receipt"

const line = (
  id: string,
  name: string,
  kind: BillLine["kind"],
  price: number,
  qty = 1,
): BillLine => ({ id, name, kind, price, qty })
const base: ReceiptSource = {
  shop: {
    name: "Barber Indra Hair Studio",
    address: "Jl. Nata Endah 1 Blok A, No 12, Kabupaten Bandung",
  },
  booking: { id: "bk-1050", customerName: "Budi Santoso" },
  barberName: "Reza",
  feeMode: "deduct",
  feeAmount: 10000,
  cashierName: "Dewi Lestari",
  lines: [
    line("1", "Haircut", "service", 55000),
    line("2", "Hair tonic", "addon", 10000),
    line("3", "Kopi hitam", "drink", 8000, 2),
    line("4", "Pomade", "product", 65000),
  ],
  bill: null,
}

describe("buildReceipt", () => {
  it("mengelompokkan baris menurut jenis dan menghitung total", () => {
    const r = buildReceipt(base, 0)
    expect(r.sections.map((s) => s.title)).toEqual([
      "Layanan",
      "Add-on",
      "Minuman dan makanan",
      "Produk",
    ])
    expect(r.sections[2].lines[0]).toMatchObject({ qty: 2, unitPrice: 8000, total: 16000 })
    expect(r.subtotal).toBe(146000)
    expect(r.total).toBe(146000)
  })
  it("memperhitungkan booking fee sesuai skema booking", () => {
    expect(buildReceipt(base, 0)).toMatchObject({
      bookingFeePaid: 10000,
      feeCredit: 10000,
      remaining: 136000,
    })
    expect(buildReceipt({ ...base, feeMode: "separate" }, 0)).toMatchObject({
      bookingFeePaid: 10000,
      feeCredit: 0,
      remaining: 146000,
    })
    expect(buildReceipt({ ...base, feeMode: "none" }, 0)).toMatchObject({
      bookingFeePaid: 0,
      feeCredit: 0,
      remaining: 146000,
    })
  })
  it("kredit dibatasi sebesar tagihan", () => {
    const r = buildReceipt({ ...base, lines: [line("1", "Trim", "addon", 5000)] }, 0)
    expect(r).toMatchObject({ feeCredit: 5000, remaining: 0 })
  })
  it("tagihan belum selesai ditandai BELUM LUNAS", () => {
    const r = buildReceipt(base, 0)
    expect(r.status).toBe("unpaid")
    expect(r.paidAtShop).toBeNull()
    expect(formatReceiptText(r, 80).join("\n")).toContain("BELUM LUNAS")
    expect(billNumber(base)).toBe("TG-1050-DRAF")
  })
  it("tagihan lunas memuat metode, nominal, kasir, dan tidak ada tulisan belum lunas", () => {
    const r = buildReceipt(
      {
        ...base,
        bill: {
          id: "bill-1234",
          status: "completed",
          method: "qris",
          paidAmount: 136000,
          completedAt: "2026-11-03T05:00:00Z",
          cashierName: "Bagas Saputra",
        },
      },
      0,
    )
    expect(r).toMatchObject({
      status: "paid",
      paymentMethod: "QRIS toko",
      paidAtShop: 136000,
      remaining: 0,
      cashier: "Bagas Saputra",
      billNumber: "TG-1234",
    })
    const text = formatReceiptText(r, 58).join("\n")
    expect(text).not.toContain("BELUM LUNAS")
    expect(text).toContain("Bayar (QRIS toko)")
  })
  it("tagihan void ditandai VOID", () => {
    const r = buildReceipt(
      {
        ...base,
        bill: {
          id: "bill-9",
          status: "voided",
          method: "cash",
          paidAmount: 1,
          completedAt: "2026-11-03T05:00:00Z",
          cashierName: "x",
        },
      },
      0,
    )
    expect(r.status).toBe("void")
    expect(formatReceiptText(r, 58).join("\n")).toContain("VOID")
  })
})

describe("formatReceiptText", () => {
  it.each([58, 80] as const)("tidak ada baris yang melebihi %i mm", (w) => {
    const text = formatReceiptText(buildReceipt(base, 0), w)
    expect(text.every((l) => l.length <= PAPER_COLUMNS[w])).toBe(true)
    expect(text[0]).toContain("BARBER INDRA")
  })
})
