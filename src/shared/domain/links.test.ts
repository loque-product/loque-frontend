import { describe, expect, it } from "vitest"
import { buildBarberLink, buildGoogleCalendarLink, isShareChannel } from "./links"

describe("tautan", () => {
  it("tautan barber membawa ref bila ada", () => {
    expect(buildBarberLink("https://loque.id/", "reza", "ig")).toBe(
      "https://loque.id/b/reza?ref=ig",
    )
    expect(buildBarberLink("https://loque.id", "reza")).toBe("https://loque.id/b/reza")
  })
  it("hanya ref yang dikenal diterima", () => {
    expect(isShareChannel("ig")).toBe(true)
    expect(isShareChannel("fb")).toBe(false)
    expect(isShareChannel(null)).toBe(false)
  })
  it("tautan Google Calendar memakai waktu UTC", () => {
    const url = new URL(
      buildGoogleCalendarLink({
        title: "Potong rambut",
        start: "2026-11-15T14:00:00+07:00",
        end: "2026-11-15T14:30:00+07:00",
      }),
    )
    expect(url.searchParams.get("dates")).toBe("20261115T070000Z/20261115T073000Z")
    expect(url.searchParams.get("text")).toBe("Potong rambut")
  })
})
