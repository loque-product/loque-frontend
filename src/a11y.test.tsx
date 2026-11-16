// @vitest-environment jsdom
import { cleanup, screen } from "@testing-library/react"
import axe from "axe-core"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { todayYmd } from "@/shared/domain/time"
import { EmptyState, ErrorState } from "@/shared/components"
import { renderRoute } from "@/test-utils"

const booking = vi.hoisted(() => ({ getDay: vi.fn(), get: vi.fn() }))
const account = vi.hoisted(() => ({
  getMe: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  deleteAccount: vi.fn(),
}))
vi.mock("@/features/barber-booking/services", () => ({ barberBookingService: booking }))
vi.mock("@/features/barber-account/services", () => ({ barberAccountService: account }))

import LoginRoute from "@/app/routes/LoginRoute"
import { BarberAccountView, FirstPasswordView } from "@/features/barber-account"
import { TodayView } from "@/features/barber-booking"

/** Contrast tidak dapat dihitung di jsdom; kontras diperiksa lewat token warna dan Lighthouse. */
async function violations() {
  const r = await axe.run(document.body, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  })
  return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)
}

const me = {
  id: "b1",
  slug: "fajar",
  name: "Fajar",
  email: "f@example.com",
  shopName: "Toko",
  membership: { active: true, since: null },
  photoUrl: null,
  coverUrl: null,
  bio: "",
  specialties: [],
  specialtyOptions: [],
  rating: 0,
  reviewCount: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  account.getMe.mockResolvedValue(me)
  booking.getDay.mockResolvedValue({
    date: todayYmd(),
    window: { from: "09:00", to: "12:00" },
    closedReason: null,
    bookings: [],
    blocks: [],
  })
})
afterEach(cleanup)

describe("aksesibilitas (axe)", () => {
  it("keadaan kosong dan galat", async () => {
    renderRoute(
      <>
        <EmptyState title="Belum ada data." description="Coba lagi nanti." />
        <ErrorState onRetry={() => undefined} />
      </>,
      { path: "/", at: "/" },
    )
    expect(await violations()).toEqual([])
  })
  it("masuk staf", async () => {
    renderRoute(<LoginRoute />, { path: "/staf/masuk", at: "/staf/masuk" })
    expect(await violations()).toEqual([])
  })
  it("ganti kata sandi pertama", async () => {
    renderRoute(<FirstPasswordView />, { path: "/staf/ganti-password", at: "/staf/ganti-password" })
    await screen.findAllByRole("button")
    expect(await violations()).toEqual([])
  })
  it("Hari ini barber", async () => {
    renderRoute(<TodayView />, { path: "/barber/hari-ini", at: "/barber/hari-ini" })
    await screen.findByText(/Belum ada booking/)
    expect(await violations()).toEqual([])
  })
  it("akun barber", async () => {
    renderRoute(<BarberAccountView />, { path: "/barber/akun", at: "/barber/akun" })
    await screen.findAllByRole("button")
    await screen.findByDisplayValue("f@example.com").catch(() => undefined)
    expect(await violations()).toEqual([])
  })
})
