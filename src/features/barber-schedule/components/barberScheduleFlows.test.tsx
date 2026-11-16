// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError } from "@/shared/api"
import type { ShopHours } from "@/shared/types"
import { renderRoute } from "@/test-utils"

const svc = vi.hoisted(() => ({
  getMine: vi.fn(),
  saveWorkingHours: vi.fn(),
  saveBlock: vi.fn(),
  deleteBlock: vi.fn(),
}))
vi.mock("../services", () => ({ barberScheduleService: svc }))

import { BlockSheet } from "./BlockSheet"

const day = { open: true, from: "09:00", to: "20:00" }
const shop: ShopHours = { shopId: "s1", days: Array.from({ length: 7 }, () => day), holidays: [] }
const closedShop: ShopHours = {
  shopId: "s1",
  days: Array.from({ length: 7 }, () => ({ ...day, open: false })),
  holidays: [],
}

const renderSheet = (s: ShopHours) =>
  renderRoute(<BlockSheet open onOpenChange={() => undefined} shop={s} />, {
    path: "/barber/jadwal",
    at: "/barber/jadwal",
  })

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe("blok waktu", () => {
  it("BLOCK_CONFLICT menampilkan jumlah booking terdampak", async () => {
    svc.saveBlock.mockRejectedValue(
      new ApiError("BLOCK_CONFLICT", undefined, { details: { affectedBookings: 3 } }),
    )
    renderSheet(shop)
    fireEvent.click(await screen.findByRole("button", { name: "Simpan blok" }))
    expect(
      await screen.findByText(
        "3 booking terdampak. Minta Admin memindahkan atau membatalkan booking itu dulu.",
      ),
    ).toBeTruthy()
  })

  it("blok pada hari toko tutup tidak dikirim dan diberi info", async () => {
    renderSheet(closedShop)
    fireEvent.click(await screen.findByRole("button", { name: "Simpan blok" }))
    expect(await screen.findByText("Sudah ditutup toko. Blok tidak diperlukan.")).toBeTruthy()
    expect(svc.saveBlock).not.toHaveBeenCalled()
  })
})
