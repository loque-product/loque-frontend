import { describe, expect, it } from "vitest"
import { canTransition, noShowState } from "./stateMachine"

describe("state machine booking", () => {
  it("mengizinkan perpindahan yang sah", () => {
    expect(canTransition("unpaid", "confirmed")).toBe(true)
    expect(canTransition("unpaid", "expired")).toBe(true)
    expect(canTransition("confirmed", "completed")).toBe(true)
    expect(canTransition("confirmed", "no_show")).toBe(true)
    expect(canTransition("no_show", "confirmed")).toBe(true)
  })
  it("menolak perpindahan lain", () => {
    expect(canTransition("completed", "confirmed")).toBe(false)
    expect(canTransition("expired", "confirmed")).toBe(false)
    expect(canTransition("no_show", "completed")).toBe(false)
    expect(canTransition("cancelled_shop", "confirmed")).toBe(false)
  })
})

describe("noShowState", () => {
  const start = new Date("2030-01-09T03:00:00Z").getTime()
  const at = (min: number) => start + min * 60000
  it("belum aktif sebelum jam mulai", () => {
    expect(
      noShowState({ start: new Date(start).toISOString(), status: "confirmed" }, at(-1)).enabled,
    ).toBe(false)
  })
  it("meminta konfirmasi sebelum 15 menit dan menampilkan WhatsApp mulai menit ke-10", () => {
    const s = noShowState({ start: new Date(start).toISOString(), status: "confirmed" }, at(10))
    expect(s).toMatchObject({
      enabled: true,
      needsConfirm: true,
      contactVisible: true,
    })
    expect(
      noShowState({ start: new Date(start).toISOString(), status: "confirmed" }, at(9))
        .contactVisible,
    ).toBe(false)
    expect(
      noShowState({ start: new Date(start).toISOString(), status: "confirmed" }, at(15))
        .needsConfirm,
    ).toBe(false)
  })
})
