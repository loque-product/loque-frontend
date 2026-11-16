import { describe, expect, it } from "vitest"
import type { ShopHours } from "@/shared/types"
import { openStatus } from "./openStatus"

const hours: ShopHours = {
  shopId: "s",
  days: Array.from({ length: 7 }, () => ({ open: true, from: "09:00", to: "21:00" })),
  holidays: [{ id: "h", from: "2026-11-20", to: "2026-11-20", label: "Libur toko" }],
}
const at = (iso: string) => new Date(iso).getTime()

describe("openStatus", () => {
  it("buka di dalam jam buka", () => {
    expect(openStatus(hours, at("2026-11-14T10:00:00+07:00"))).toEqual({
      open: true,
      label: "Buka hari ini 09.00 sampai 21.00",
    })
  })
  it("tutup di luar jam buka", () => {
    expect(openStatus(hours, at("2026-11-14T22:00:00+07:00")).open).toBe(false)
    expect(openStatus(hours, at("2026-11-14T08:59:00+07:00")).open).toBe(false)
  })
  it("tutup pada hari libur dan hari tutup mingguan", () => {
    expect(openStatus(hours, at("2026-11-20T12:00:00+07:00")).label).toBe(
      "Tutup hari ini: Libur toko",
    )
    const closedSunday = {
      ...hours,
      days: hours.days.map((d, i) => (i === 0 ? { ...d, open: false } : d)),
    }
    expect(openStatus(closedSunday, at("2026-11-15T12:00:00+07:00")).label).toBe("Tutup hari ini")
  })
})
