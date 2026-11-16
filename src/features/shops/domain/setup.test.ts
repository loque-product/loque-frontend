import { describe, expect, it } from "vitest"
import type { Shop } from "@/shared/types"
import { computeSetup } from "./setup"

const base = {
  status: "draft",
  doku: { status: "connected", checkedAt: null, credentialsSaved: true },
  setup: {
    ownerCreated: true,
    dokuConnected: true,
    catalogFilled: false,
    hoursSet: false,
    paymentTested: false,
  },
} as Shop

describe("computeSetup", () => {
  it("menghitung 3 dari 7 langkah dan daftar yang kurang", () => {
    const r = computeSetup(base)
    expect(r.doneCount).toBe(3)
    expect(r.canOpen).toBe(false)
    expect(r.missing).toEqual([
      "Isi katalog layanan dan harga",
      "Atur jam buka dan jadwal",
      "Tes pembayaran",
    ])
  })
  it("bisa dibuka setelah langkah 1 sampai 6 selesai", () => {
    const r = computeSetup({
      ...base,
      setup: {
        ...base.setup,
        catalogFilled: true,
        hoursSet: true,
        paymentTested: true,
      },
    })
    expect(r.canOpen).toBe(true)
  })
  it("DOKU bermasalah menghalangi pembukaan", () => {
    const r = computeSetup({
      ...base,
      doku: { ...base.doku, status: "problem" },
      setup: {
        ...base.setup,
        catalogFilled: true,
        hoursSet: true,
        paymentTested: true,
      },
    })
    expect(r.canOpen).toBe(false)
  })
})
