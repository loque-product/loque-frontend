import { describe, expect, it } from "vitest"
import type { PublicBarber } from "../types"
import { allSpecialties, filterBarbers } from "./filter"

const b = (name: string, specialties: string[]): PublicBarber => ({
  id: name,
  slug: name,
  name,
  photoUrl: null,
  specialties,
  rating: 0,
  reviewCount: 0,
  lastReviewAt: null,
  badgeHidden: false,
  genders: ["male"],
  startingPrice: null,
})
const list = [b("Indra", ["Fade", "Classic"]), b("Reza", ["Perm"]), b("Najib", ["Fade"])]

describe("filterBarbers", () => {
  it("mencari nama tanpa peka huruf besar", () => {
    expect(filterBarbers(list, " rez ", null).map((x) => x.name)).toEqual(["Reza"])
  })
  it("menyaring spesialisasi", () => {
    expect(filterBarbers(list, "", "fade").map((x) => x.name)).toEqual(["Indra", "Najib"])
  })
  it("gabungan yang tidak cocok kosong", () => {
    expect(filterBarbers(list, "reza", "Fade")).toEqual([])
  })
  it("daftar spesialisasi unik dan terurut", () => {
    expect(allSpecialties(list)).toEqual(["Classic", "Fade", "Perm"])
  })
})
