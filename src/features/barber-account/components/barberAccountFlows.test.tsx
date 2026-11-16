// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError } from "@/shared/api"
import { renderRoute } from "@/test-utils"

const svc = vi.hoisted(() => ({
  getMe: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  deleteAccount: vi.fn(),
}))
vi.mock("../services", () => ({ barberAccountService: svc }))
vi.mock("@/features/auth/services", () => ({
  authService: { me: vi.fn().mockResolvedValue(null), logout: vi.fn() },
}))

import { BarberAccountView } from "./BarberAccountView"

const me = {
  id: "b1",
  slug: "fajar",
  name: "Fajar",
  email: "fajar@example.com",
  shopName: "Toko",
  membership: { active: true, since: "2026-01-01" },
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
  svc.getMe.mockResolvedValue(me)
})
afterEach(cleanup)

describe("akun barber", () => {
  it("hapus akun ditolak bila masih ada booking mendatang", async () => {
    svc.deleteAccount.mockRejectedValue(new ApiError("HAS_UPCOMING_BOOKINGS"))
    renderRoute(<BarberAccountView />, { path: "/barber/akun", at: "/barber/akun" })
    fireEvent.click(await screen.findByRole("button", { name: "Hapus akun dan data" }))
    const confirm = (await screen.findByRole("button", { name: "Hapus akun" })) as HTMLButtonElement
    expect(confirm.disabled).toBe(true)
    fireEvent.change(screen.getByLabelText(/Ketik/), { target: { value: "HAPUS" } })
    fireEvent.click(confirm)
    expect(
      await screen.findByText(
        "Masih ada booking mendatang. Minta Admin memindahkan atau membatalkannya dulu.",
      ),
    ).toBeTruthy()
  })
})
