import { describe, expect, it } from "vitest"
import { computeFee } from "./computeFee"

describe("computeFee", () => {
  it("potong tagihan: kredit sebesar fee", () => {
    expect(computeFee("deduct", 10000, 55000)).toEqual({
      onlineAmount: 10000,
      creditToBill: 10000,
      payAtShop: 45000,
    })
  })
  it("potong tagihan: kredit dibatasi sebesar tagihan", () => {
    expect(computeFee("deduct", 10000, 5000)).toEqual({
      onlineAmount: 10000,
      creditToBill: 5000,
      payAtShop: 0,
    })
  })
  it("terpisah: tagihan dibayar penuh", () => {
    expect(computeFee("separate", 10000, 55000)).toEqual({
      onlineAmount: 10000,
      creditToBill: 0,
      payAtShop: 55000,
    })
  })
  it("mati: tanpa pembayaran online", () => {
    expect(computeFee("none", 10000, 55000)).toEqual({
      onlineAmount: 0,
      creditToBill: 0,
      payAtShop: 55000,
    })
  })
})
