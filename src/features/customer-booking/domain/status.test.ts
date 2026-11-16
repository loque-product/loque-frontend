import { describe, expect, it } from "vitest"
import { canCancel, formatCountdown, holdActive, holdRemainingMs, tabOf } from "./status"

const now = new Date("2026-11-14T10:00:00+07:00").getTime()

describe("tabOf", () => {
  it("memetakan status ke tab; tidak hadir masuk Dibatalkan, kedaluwarsa disembunyikan", () => {
    expect(tabOf("confirmed")).toBe("upcoming")
    expect(tabOf("unpaid")).toBe("upcoming")
    expect(tabOf("completed")).toBe("done")
    expect(tabOf("no_show")).toBe("cancelled")
    expect(tabOf("cancelled_shop")).toBe("cancelled")
    expect(tabOf("expired")).toBeNull()
  })
})

describe("canCancel", () => {
  it("hanya sebelum jam mulai", () => {
    expect(canCancel({ status: "confirmed", start: "2026-11-14T10:30:00+07:00" }, now)).toBe(true)
    expect(canCancel({ status: "confirmed", start: "2026-11-14T09:59:00+07:00" }, now)).toBe(false)
    expect(canCancel({ status: "completed", start: "2026-11-15T10:00:00+07:00" }, now)).toBe(false)
  })
})

describe("hold", () => {
  it("menghitung sisa waktu dan keaktifan hold", () => {
    const exp = "2026-11-14T10:12:40+07:00"
    expect(holdRemainingMs(exp, now)).toBe(12 * 60_000 + 40_000)
    expect(holdActive({ status: "unpaid", holdExpiresAt: exp }, now)).toBe(true)
    expect(holdActive({ status: "unpaid", holdExpiresAt: "2026-11-14T09:59:00+07:00" }, now)).toBe(
      false,
    )
    expect(holdActive({ status: "confirmed", holdExpiresAt: exp }, now)).toBe(false)
    expect(holdRemainingMs(null, now)).toBe(0)
  })
  it("format hitung mundur", () => {
    expect(formatCountdown(12 * 60_000 + 40_000)).toBe("12.40")
    expect(formatCountdown(0)).toBe("00.00")
  })
})
