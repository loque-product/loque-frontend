// @vitest-environment jsdom
import { cleanup, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { todayYmd } from "@/shared/domain/time"
import { renderRoute } from "@/test-utils"

const booking = vi.hoisted(() => ({ getDay: vi.fn(), get: vi.fn() }))
const account = vi.hoisted(() => ({
  getMe: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  deleteAccount: vi.fn(),
}))
vi.mock("../services", () => ({ barberBookingService: booking }))
vi.mock("@/features/barber-account/services", () => ({ barberAccountService: account }))

import { TodayView } from "./TodayView"

const me = (active: boolean) => ({
  id: "b1",
  slug: "fajar",
  name: "Fajar",
  email: "f@example.com",
  shopName: active ? "Toko" : null,
  membership: { active, since: null },
  photoUrl: null,
  coverUrl: null,
  bio: "",
  specialties: [],
  specialtyOptions: [],
  rating: 0,
  reviewCount: 0,
})

const at = (hhmm: string) => `${todayYmd()}T${hhmm}:00+07:00`

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe("Hari ini barber", () => {
  it("menampilkan booking, blok, dan jam kosong berurutan", async () => {
    account.getMe.mockResolvedValue(me(true))
    booking.getDay.mockResolvedValue({
      date: todayYmd(),
      window: { from: "09:00", to: "12:00" },
      closedReason: null,
      bookings: [
        {
          id: "k1",
          start: at("10:00"),
          end: at("11:00"),
          status: "confirmed",
          customerName: "Budi",
          items: [{ name: "Potong" }],
          source: "online",
        },
      ],
      blocks: [{ id: "x1", from: "11:00", to: "11:30", label: "Istirahat" }],
    })
    renderRoute(<TodayView />, { path: "/barber/hari-ini", at: "/barber/hari-ini" })
    await screen.findByText("Budi")
    const text = screen.getAllByRole("listitem").map((li) => li.textContent ?? "")
    const order = ["Kosong", "Budi", "Diblok: Istirahat"].map((t) =>
      text.findIndex((x) => x.includes(t)),
    )
    expect(order.every((i) => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })

  it("barber tanpa keanggotaan aktif melihat pesan belum terhubung", async () => {
    account.getMe.mockResolvedValue(me(false))
    renderRoute(<TodayView />, { path: "/barber/hari-ini", at: "/barber/hari-ini" })
    expect(await screen.findByText("Anda belum terhubung ke toko.")).toBeTruthy()
    expect(booking.getDay).not.toHaveBeenCalled()
  })
})
