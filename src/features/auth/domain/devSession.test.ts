// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { readDevSession } from "./devSession"

afterEach(() => {
  sessionStorage.clear()
  window.history.replaceState(null, "", "/")
  vi.unstubAllEnvs()
})

describe("readDevSession", () => {
  it("nonaktif tanpa pilihan", () => {
    expect(readDevSession()).toBeUndefined()
  })
  it("membaca peran dari URL dan menyimpannya", () => {
    window.history.replaceState(null, "", "/?devrole=customer")
    expect(readDevSession()).toMatchObject({ role: "customer", profileComplete: true })
    window.history.replaceState(null, "", "/")
    expect(readDevSession()).toMatchObject({ role: "customer" })
  })
  it("customer-new belum melengkapi profil; guest berarti tamu; off mematikan", () => {
    window.history.replaceState(null, "", "/?devrole=customer-new")
    expect(readDevSession()).toMatchObject({ profileComplete: false })
    window.history.replaceState(null, "", "/?devrole=guest")
    expect(readDevSession()).toBeNull()
    window.history.replaceState(null, "", "/?devrole=off")
    expect(readDevSession()).toBeUndefined()
  })
  it("peran tak dikenal diabaikan", () => {
    window.history.replaceState(null, "", "/?devrole=hacker")
    expect(readDevSession()).toBeUndefined()
  })
})
