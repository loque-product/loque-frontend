import { describe, expect, it } from "vitest"
import { feeSummary } from "./feeText"

describe("feeSummary", () => {
  it("potong tagihan", () => {
    const s = feeSummary("deduct", 10000, 55000)
    expect(s.text).toBe("Booking fee Rp 10.000 dipotong dari total. Bayar di toko: Rp 45.000")
    expect(s.payLabel).toBe("Bayar Rp 10.000")
    expect(s.payAtShop).toBe(45000)
  })
  it("potong tagihan dibatasi sebesar total", () => {
    expect(feeSummary("deduct", 10000, 5000).payAtShop).toBe(0)
  })
  it("terpisah", () => {
    const s = feeSummary("separate", 10000, 45000)
    expect(s.text).toBe("Booking fee Rp 10.000 di luar tagihan. Bayar di toko: Rp 45.000")
    expect(s.online).toBe(10000)
  })
  it("mati", () => {
    const s = feeSummary("none", 10000, 55000)
    expect(s.text).toBe("Tanpa booking fee. Bayar di toko: Rp 55.000")
    expect(s.payLabel).toBe("Konfirmasi booking")
    expect(s.hasFee).toBe(false)
    expect(s.online).toBe(0)
  })
})
