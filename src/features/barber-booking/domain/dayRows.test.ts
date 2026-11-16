import { describe, expect, it } from "vitest"
import type { BarberBooking, BarberDay } from "../types"
import { blockLabel, buildDayRows } from "./dayRows"

const booking = (id: string, start: string, end: string): BarberBooking => ({
  id,
  start: `2026-11-16T${start}:00+07:00`,
  end: `2026-11-16T${end}:00+07:00`,
  status: "confirmed",
  customerName: "Budi",
  items: [{ serviceId: "s", name: "Potong", price: 50000, duration: 30 }] as BarberBooking["items"],
  source: "online",
})

const day = (patch: Partial<BarberDay>): BarberDay => ({
  date: "2026-11-16",
  window: { from: "09:00", to: "13:00" },
  closedReason: null,
  bookings: [],
  blocks: [],
  ...patch,
})

describe("baris Hari ini", () => {
  it("urut jam dengan booking, blok, dan jam kosong", () => {
    const rows = buildDayRows(
      day({
        // Sengaja tidak berurutan dari server.
        bookings: [booking("b2", "11:00", "12:00"), booking("b1", "09:00", "10:00")],
        blocks: [{ id: "k1", from: "10:00", to: "10:30", label: "Istirahat" }],
      }),
    )
    expect(rows.map((r) => `${r.kind}:${r.from}`)).toEqual([
      "booking:540",
      "block:600",
      "free:630",
      "booking:660",
      "free:720",
    ])
  })
  it("blok di luar jam kerja dipotong atau dibuang", () => {
    const rows = buildDayRows(
      day({ blocks: [{ id: "k", from: "07:00", to: "08:00", label: "Pagi" }] }),
    )
    expect(rows.some((r) => r.kind === "block")).toBe(false)
  })
  it("hari libur tanpa jam kerja tidak punya jam kosong", () => {
    expect(buildDayRows(day({ window: null }))).toEqual([])
  })
  it("judul blok memakai alasan bila ada", () => {
    expect(blockLabel("Istirahat")).toBe("Diblok: Istirahat")
    expect(blockLabel("  ")).toBe("Diblok")
  })
})
