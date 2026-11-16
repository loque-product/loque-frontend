// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError } from "@/shared/api"
import { renderRoute } from "@/test-utils"

const svc = vi.hoisted(() => ({
  getProfile: vi.fn(),
  completeProfile: vi.fn(),
  updateProfile: vi.fn(),
  deleteAccount: vi.fn(),
}))
vi.mock("../services", () => ({ customerAccountService: svc }))
vi.mock("@/features/shop-info/services", () => ({
  shopInfoService: {
    getInfo: vi
      .fn()
      .mockResolvedValue({
        id: "s",
        name: "Toko",
        whatsapp: "081200000000",
        mapsUrl: "",
        address: "",
        tagline: "",
        instagram: "",
        tiktok: "",
        heroPhotoUrl: null,
        gallery: [],
        genders: ["male"],
        feeAmount: 10000,
        hours: { shopId: "s", days: [], holidays: [] },
      }),
  },
}))
vi.mock("@/features/auth/services", () => ({
  authService: { me: vi.fn().mockResolvedValue(null), logout: vi.fn() },
}))

import { AccountView } from "./AccountView"
import { CompleteProfile } from "./CompleteProfile"

beforeEach(() => {
  vi.clearAllMocks()
  svc.getProfile.mockResolvedValue({
    id: "c1",
    name: "Budi Santoso",
    email: "budi@example.com",
    phone: "081200001001",
  })
})
afterEach(cleanup)

describe("lengkapi profil", () => {
  it("nomor dipakai akun lain menampilkan peringatan dengan tombol WhatsApp toko", async () => {
    svc.completeProfile.mockRejectedValue(new ApiError("PHONE_IN_USE"))
    renderRoute(<CompleteProfile />, { path: "/akun/lengkapi", at: "/akun/lengkapi" })
    await waitFor(() =>
      expect((screen.getByLabelText(/Nama/) as HTMLInputElement).value).toBe("Budi Santoso"),
    )
    fireEvent.change(await screen.findByLabelText(/Nomor WhatsApp/), {
      target: { value: "0812 0000 1001" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Lanjut" }))
    expect(await screen.findByText("Nomor ini benar?")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Ya, benar" }))
    expect(
      await screen.findByText("Nomor ini sudah terdaftar di akun lain. Hubungi toko atau Loque."),
    ).toBeTruthy()
    expect(svc.completeProfile.mock.calls[0][0].phone).toBe("081200001001")
    expect(await screen.findByRole("link", { name: "WhatsApp toko" })).toBeTruthy()
  })

  it("nomor tidak valid ditolak sebelum dikirim", async () => {
    renderRoute(<CompleteProfile />, { path: "/akun/lengkapi", at: "/akun/lengkapi" })
    fireEvent.change(await screen.findByLabelText(/Nomor WhatsApp/), { target: { value: "123" } })
    fireEvent.click(screen.getByRole("button", { name: "Lanjut" }))
    expect(await screen.findByText(/Nomor WhatsApp tidak valid/)).toBeTruthy()
    expect(svc.completeProfile).not.toHaveBeenCalled()
  })
})

describe("hapus akun", () => {
  async function openDialog() {
    renderRoute(<AccountView />, { path: "/akun", at: "/akun" })
    fireEvent.click(await screen.findByRole("button", { name: "Hapus akun dan data" }))
  }

  it("tombol hapus aktif hanya setelah mengetik HAPUS", async () => {
    await openDialog()
    const confirm = screen.getByRole("button", { name: "Hapus akun" }) as HTMLButtonElement
    expect(confirm.disabled).toBe(true)
    fireEvent.change(screen.getByLabelText(/Ketik/), { target: { value: "HAPUS" } })
    expect(confirm.disabled).toBe(false)
  })

  it("ditolak bila masih ada booking mendatang", async () => {
    svc.deleteAccount.mockRejectedValue(new ApiError("HAS_UPCOMING_BOOKINGS"))
    await openDialog()
    fireEvent.change(screen.getByLabelText(/Ketik/), { target: { value: "HAPUS" } })
    fireEvent.click(screen.getByRole("button", { name: "Hapus akun" }))
    await waitFor(() => expect(screen.getByText("Batalkan booking mendatang dulu.")).toBeTruthy())
    expect(svc.deleteAccount).toHaveBeenCalledWith("HAPUS")
  })
})
