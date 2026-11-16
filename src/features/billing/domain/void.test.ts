import { describe, expect, it } from "vitest"
import {
  canDecideVoid,
  checkVoidCode,
  effectiveVoidStatus,
  formatWait,
  generateVoidToken,
  summarizeVoids,
} from "./void"

const now = new Date("2030-01-09T05:00:00Z").getTime()
const base = {
  status: "pending" as const,
  expiresAt: new Date(now + 3600000).toISOString(),
  attempts: 0,
  token: "123456",
}

describe("aturan void", () => {
  it("membuat token 6 digit angka", () => {
    for (let i = 0; i < 50; i++) expect(generateVoidToken()).toMatch(/^\d{6}$/)
  })
  it("kode benar menyetujui", () => {
    expect(checkVoidCode(base, "123456", now).outcome).toEqual({
      result: "approved",
    })
  })
  it("kode salah mengurangi sisa percobaan dan terkunci setelah 5 kali", () => {
    let attempts = 0
    for (let i = 1; i <= 4; i++) {
      const r = checkVoidCode({ ...base, attempts }, "000000", now)
      expect(r.outcome).toEqual({ result: "wrong", attemptsLeft: 5 - i })
      attempts = r.nextAttempts
    }
    expect(checkVoidCode({ ...base, attempts }, "000000", now).outcome).toEqual({
      result: "locked",
    })
  })
  it("kode benar ditolak setelah terkunci atau kedaluwarsa", () => {
    expect(checkVoidCode({ ...base, status: "locked" }, "123456", now).outcome).toEqual({
      result: "locked",
    })
    const old = { ...base, expiresAt: new Date(now - 1000).toISOString() }
    expect(effectiveVoidStatus(old, now)).toBe("expired")
    expect(checkVoidCode(old, "123456", now).outcome).toEqual({
      result: "expired",
    })
  })
  it("pemohon tidak boleh memutus permintaannya sendiri", () => {
    expect(canDecideVoid({ requesterId: "a" }, "a")).toBe(false)
    expect(canDecideVoid({ requesterId: "a" }, "b")).toBe(true)
  })
})

describe("ringkasan daftar void", () => {
  const at = (iso: string) => iso
  const now = new Date("2026-11-03T05:00:00Z").getTime()
  const v = (
    status: "pending" | "approved" | "rejected",
    amount: number,
    createdAt: string,
    decidedAt?: string,
    who = "Dewi",
  ) => ({ status, amount, createdAt, decidedAt, requesterName: who })
  it("menghitung menunggu, di atas ambang, rata-rata tunggu, dan perbandingan bulan", () => {
    const s = summarizeVoids(
      [
        v("pending", 395000, at("2026-11-03T03:00:00Z")),
        v("pending", 60000, at("2026-11-02T03:00:00Z"), undefined, "Bagas"),
        v("approved", 50000, at("2026-11-01T01:00:00Z"), at("2026-11-01T03:15:00Z")),
        v("approved", 50000, at("2026-10-10T01:00:00Z"), at("2026-10-10T02:00:00Z")),
        v("rejected", 90000, at("2026-11-01T01:00:00Z"), at("2026-11-01T02:00:00Z"), "Bagas"),
      ],
      200000,
      now,
    )
    expect(s).toMatchObject({
      pending: 2,
      pendingAbove: 1,
      approvedThisMonth: 1,
      approvedLastMonth: 1,
    })
    expect(s.avgWaitMs).toBe((135 * 60000 + 60 * 60000) / 2)
    expect(s.perCashier).toEqual([
      { name: "Dewi", count: 2 },
      { name: "Bagas", count: 2 },
    ])
  })
  it("tanpa permintaan disetujui rata-rata kosong dan format mudah dibaca", () => {
    expect(summarizeVoids([], 200000, now).avgWaitMs).toBeNull()
    expect(formatWait(null)).toBe("-")
    expect(formatWait(135 * 60000)).toBe("2 j 15 m")
    expect(formatWait(45 * 60000)).toBe("45 m")
  })
})
