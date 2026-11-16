import { describe, expect, it } from "vitest"
import { resolveTarget, safeNext } from "./loginContext"

describe("safeNext", () => {
  it("menerima jalur aplikasi dan menolak alihan terbuka", () => {
    expect(safeNext("/booking/layanan")).toBe("/booking/layanan")
    expect(safeNext("//evil.com")).toBeUndefined()
    expect(safeNext("https://evil.com")).toBeUndefined()
    expect(safeNext("/masuk")).toBeUndefined()
    expect(safeNext(null)).toBeUndefined()
  })
})

describe("resolveTarget", () => {
  it("next lebih dulu, lalu profil barber dengan ref, lalu beranda", () => {
    expect(resolveTarget({ next: "/booking-saya" })).toBe("/booking-saya")
    expect(resolveTarget({ barber: "reza", ref: "ig" })).toBe("/b/reza?ref=ig")
    expect(resolveTarget({})).toBe("/")
  })
})
