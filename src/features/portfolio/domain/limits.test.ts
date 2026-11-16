import { describe, expect, it } from "vitest"
import { PORTFOLIO_MAX_PHOTOS } from "@/shared/constants"
import { canAddMore, canSubmitUpload, moveId } from "./limits"

describe("batas portofolio", () => {
  it("maksimal 9 foto", () => {
    expect(PORTFOLIO_MAX_PHOTOS).toBe(9)
    expect(canAddMore(8)).toBe(true)
    expect(canAddMore(9)).toBe(false)
  })
  it("tombol unggah mati tanpa persetujuan", () => {
    expect(canSubmitUpload({ ready: true, consent: false, count: 2, busy: false })).toBe(false)
    expect(canSubmitUpload({ ready: true, consent: true, count: 2, busy: false })).toBe(true)
  })
  it("tombol unggah mati saat kuota penuh, belum ada foto, atau sedang berjalan", () => {
    expect(canSubmitUpload({ ready: true, consent: true, count: 9, busy: false })).toBe(false)
    expect(canSubmitUpload({ ready: false, consent: true, count: 2, busy: false })).toBe(false)
    expect(canSubmitUpload({ ready: true, consent: true, count: 2, busy: true })).toBe(false)
  })
  it("urutan bisa digeser naik dan turun, tidak keluar batas", () => {
    expect(moveId(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"])
    expect(moveId(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"])
    expect(moveId(["a", "b", "c"], 0, -1)).toBeNull()
    expect(moveId(["a", "b", "c"], 2, 1)).toBeNull()
  })
})
