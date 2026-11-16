import { describe, expect, it } from "vitest"
import { bestRatedId, reviewerName, validateReview } from "./rules"

describe("reviewerName", () => {
  it("nama depan dan inisial belakang", () => {
    expect(reviewerName("Budi Santoso")).toBe("Budi S.")
    expect(reviewerName("  Sari  Putri Wulandari ")).toBe("Sari W.")
    expect(reviewerName("Budi")).toBe("Budi")
    expect(reviewerName("")).toBe("Pelanggan")
  })
})

describe("validateReview", () => {
  it("bintang dan panjang komentar", () => {
    expect(validateReview(0, "")).not.toBeNull()
    expect(validateReview(5, "x".repeat(301))).not.toBeNull()
    expect(validateReview(5, "x".repeat(300))).toBeNull()
  })
})

describe("bestRatedId", () => {
  const b = (
    id: string,
    rating: number,
    reviewCount: number,
    lastReviewAt = "2026-11-01T00:00:00Z",
  ) => ({ id, rating, reviewCount, lastReviewAt })
  it("butuh minimal 5 ulasan", () => {
    expect(bestRatedId([b("a", 5, 4)])).toBeNull()
  })
  it("rata-rata tertinggi menang", () => {
    expect(bestRatedId([b("a", 4.6, 10), b("b", 4.8, 6)])).toBe("b")
  })
  it("seri: ulasan terbanyak, lalu terbaru", () => {
    expect(bestRatedId([b("a", 4.8, 6), b("b", 4.8, 9)])).toBe("b")
    expect(
      bestRatedId([b("a", 4.8, 6, "2026-11-10T00:00:00Z"), b("b", 4.8, 6, "2026-11-01T00:00:00Z")]),
    ).toBe("a")
  })
  it("lencana yang disembunyikan tidak dihitung", () => {
    expect(bestRatedId([{ ...b("a", 5, 9), badgeHidden: true }, b("b", 4.5, 6)])).toBe("b")
  })
})
