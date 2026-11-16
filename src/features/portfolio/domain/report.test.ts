import { describe, expect, it } from "vitest"
import { hidesImmediately, needsCaptcha } from "./report"

describe("laporan foto", () => {
  it("dua alasan pertama menyembunyikan seketika", () => {
    expect(hidesImmediately("me_in_photo")).toBe(true)
    expect(hidesImmediately("my_child")).toBe(true)
    expect(hidesImmediately("other")).toBe(false)
  })
  it("captcha wajib setelah laporan ketiga", () => {
    expect(needsCaptcha(0)).toBe(false)
    expect(needsCaptcha(1)).toBe(false)
    expect(needsCaptcha(2)).toBe(true)
  })
})
