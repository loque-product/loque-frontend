import { describe, expect, it } from "vitest"
import type { Barber } from "@/shared/types"
import { bestRated, photoSla } from "./sla"

const now = new Date("2026-11-03T05:00:00Z").getTime()
const ago = (h: number) => new Date(now - h * 3600000).toISOString()

describe("SLA moderasi", () => {
  it("foto tersembunyi memakai batas 48 jam", () => {
    expect(photoSla({ reportedAt: ago(20), hidden: true }, now).level).toBe("ok")
    expect(photoSla({ reportedAt: ago(40), hidden: true }, now).level).toBe("near")
    expect(photoSla({ reportedAt: ago(50), hidden: true }, now).level).toBe("over")
  })
  it("laporan biasa memakai batas 7 hari", () => {
    expect(photoSla({ reportedAt: ago(50), hidden: false }, now).level).toBe("ok")
    expect(photoSla({ reportedAt: ago(24 * 6 + 12), hidden: false }, now).level).toBe("near")
    expect(photoSla({ reportedAt: ago(24 * 8), hidden: false }, now).level).toBe("over")
  })
})

describe("bestRated", () => {
  const b = (
    id: string,
    rating: number,
    reviewCount: number,
    last = "2026-10-01T00:00:00Z",
    badgeHidden = false,
  ) => ({ id, rating, reviewCount, lastReviewAt: last, badgeHidden }) as Barber
  it("butuh minimal 5 ulasan dan memilih rata-rata tertinggi", () => {
    const rows = bestRated([b("a", 5, 4), b("b", 4.5, 10), b("c", 4.2, 30)])
    expect(rows.find((r) => r.badge)?.barber.id).toBe("b")
  })
  it("seri diputus ulasan terbanyak lalu ulasan terbaru", () => {
    expect(bestRated([b("a", 4.8, 10), b("b", 4.8, 12)]).find((r) => r.badge)?.barber.id).toBe("b")
    expect(
      bestRated([
        b("a", 4.8, 10, "2026-10-02T00:00:00Z"),
        b("b", 4.8, 10, "2026-10-01T00:00:00Z"),
      ]).find((r) => r.badge)?.barber.id,
    ).toBe("a")
  })
  it("lencana yang disembunyikan dikecualikan", () => {
    expect(
      bestRated([b("a", 4.9, 20, undefined, true), b("b", 4.5, 10)]).find((r) => r.badge)?.barber
        .id,
    ).toBe("b")
  })
})
