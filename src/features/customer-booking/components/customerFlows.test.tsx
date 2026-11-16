// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError } from "@/shared/api"
import { renderRoute } from "@/test-utils"
import type { CustomerBooking, CustomerBookingDetail } from "../types"

const svc = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  create: vi.fn(),
  startPayment: vi.fn(),
  get: vi.fn(),
  getHold: vi.fn(),
  cancel: vi.fn(),
  cancelHold: vi.fn(),
  list: vi.fn(),
  getNextAvailable: vi.fn(),
  getAvailability: vi.fn(),
  getSlots: vi.fn(),
  getTransaction: vi.fn(),
}))
const go = vi.hoisted(() => vi.fn())

vi.mock("../services", () => ({ customerBookingService: svc }))
vi.mock("@/shared/lib/external-navigation", () => ({ goExternal: go }))
vi.mock("@/features/barbers/services", () => ({
  barberDirectoryService: {
    list: vi
      .fn()
      .mockResolvedValue([
        {
          id: "b1",
          slug: "reza",
          name: "Reza",
          photoUrl: null,
          specialties: ["Fade"],
          rating: 0,
          reviewCount: 0,
          lastReviewAt: null,
          badgeHidden: false,
          genders: ["male"],
          startingPrice: 45000,
        },
      ]),
    getBySlug: vi.fn(),
  },
}))

import { useWizard } from "../store/wizard"
import StepSummary from "./wizard/StepSummary"
import { BookingStatusView } from "./BookingStatusView"
import { BookingDetailView } from "./BookingDetailView"

const catalog = (feeMode: "deduct" | "separate" | "none") => ({
  services: [
    {
      id: "haircut",
      shopId: "s",
      name: "Haircut",
      category: "haircut",
      basePrice: 45000,
      duration: 30,
      startingFrom: false,
      active: true,
      genders: ["male"],
    },
  ],
  overrides: [],
  genders: ["male"],
  feeMode,
  feeAmount: 10000,
})

const booking = (o: Partial<CustomerBooking> = {}): CustomerBooking => ({
  id: "bk1",
  code: "LQ-1234",
  status: "confirmed",
  start: "2099-01-01T10:00:00+07:00",
  end: "2099-01-01T10:30:00+07:00",
  barberId: "b1",
  barberSlug: "reza",
  barberName: "Reza",
  barberPhotoUrl: null,
  items: [{ serviceId: "haircut", name: "Haircut", price: 45000, duration: 30 }],
  serviceTotal: 45000,
  feeMode: "deduct",
  feeAmount: 10000,
  payAtShop: 35000,
  holdExpiresAt: null,
  latePayment: false,
  guestName: null,
  gender: "male",
  cancelReason: null,
  refund: null,
  rescheduled: false,
  walkIn: false,
  reviewable: false,
  reviewId: null,
  createdAt: "2098-12-31T10:00:00+07:00",
  ...o,
})
const detail = (o: Partial<CustomerBooking> = {}): CustomerBookingDetail => ({
  booking: booking(o),
  shop: {
    name: "Indra Hair Studio",
    address: "Jl. Contoh 1",
    mapsUrl: "https://maps.example",
    whatsapp: "081200000000",
  },
})

function fillWizard() {
  useWizard
    .getState()
    .start({
      gender: "male",
      serviceIds: ["haircut"],
      barberId: "b1",
      date: "2099-01-01",
      time: "10:00",
    })
}
async function acceptAndPay(label: string) {
  fireEvent.click(await screen.findByRole("checkbox", { name: /Saya memahami kebijakan ini/ }))
  fireEvent.click(screen.getAllByRole("button", { name: label })[0]!)
}

beforeEach(() => {
  vi.clearAllMocks()
  svc.getHold.mockResolvedValue(null)
  svc.getNextAvailable.mockResolvedValue([])
})
afterEach(cleanup)

describe("ringkasan dan bayar", () => {
  it("teks fee mengikuti skema", async () => {
    for (const [mode, text, label] of [
      [
        "deduct",
        "Booking fee Rp 10.000 dipotong dari total. Bayar di toko: Rp 35.000",
        "Bayar Rp 10.000",
      ],
      [
        "separate",
        "Booking fee Rp 10.000 di luar tagihan. Bayar di toko: Rp 45.000",
        "Bayar Rp 10.000",
      ],
      ["none", "Tanpa booking fee. Bayar di toko: Rp 45.000", "Konfirmasi booking"],
    ] as const) {
      svc.getCatalog.mockResolvedValue(catalog(mode))
      fillWizard()
      renderRoute(<StepSummary />, { path: "/booking/ringkasan", at: "/booking/ringkasan" })
      expect(await screen.findByText(text)).toBeTruthy()
      expect(screen.getAllByRole("button", { name: label }).length).toBeGreaterThan(0)
      cleanup()
    }
  })

  it("tombol bayar menunggu kotak kebijakan", async () => {
    svc.getCatalog.mockResolvedValue(catalog("deduct"))
    fillWizard()
    renderRoute(<StepSummary />, { path: "/booking/ringkasan", at: "/booking/ringkasan" })
    const pay = (
      await screen.findAllByRole("button", { name: "Bayar Rp 10.000" })
    )[0] as HTMLButtonElement
    expect(pay.disabled).toBe(true)
  })

  it("membuat hold lalu membuka pembayaran DOKU dan membersihkan wizard", async () => {
    svc.getCatalog.mockResolvedValue(catalog("deduct"))
    svc.create.mockResolvedValue({ booking: booking({ status: "unpaid" }), paymentRequired: true })
    svc.startPayment.mockResolvedValue({ redirectUrl: "https://doku.example/pay" })
    fillWizard()
    renderRoute(<StepSummary />, { path: "/booking/ringkasan", at: "/booking/ringkasan" })
    await acceptAndPay("Bayar Rp 10.000")
    await waitFor(() => expect(go).toHaveBeenCalledWith("https://doku.example/pay"))
    expect(svc.create.mock.calls[0][0]).toMatchObject({
      barberId: "b1",
      expectedFee: { mode: "deduct", amount: 10000 },
      policyAccepted: true,
    })
    expect(useWizard.getState().serviceIds).toEqual([])
  })

  it("SLOT_TAKEN kembali ke jadwal dengan pesan", async () => {
    svc.getCatalog.mockResolvedValue(catalog("deduct"))
    svc.create.mockRejectedValue(new ApiError("SLOT_TAKEN"))
    fillWizard()
    renderRoute(<StepSummary />, { path: "/booking/ringkasan", at: "/booking/ringkasan" })
    await acceptAndPay("Bayar Rp 10.000")
    expect(await screen.findByText("Jam ini baru saja diambil. Pilih jam lain.")).toBeTruthy()
    expect(screen.getByTestId("path").textContent).toBe("/booking/jadwal")
  })

  it("FEE_CHANGED meminta konfirmasi ulang", async () => {
    svc.getCatalog.mockResolvedValue(catalog("deduct"))
    svc.create.mockRejectedValue(new ApiError("FEE_CHANGED"))
    fillWizard()
    renderRoute(<StepSummary />, { path: "/booking/ringkasan", at: "/booking/ringkasan" })
    await acceptAndPay("Bayar Rp 10.000")
    expect(await screen.findByText(/Booking fee berubah/)).toBeTruthy()
    expect(
      screen
        .getByRole("checkbox", { name: /Saya memahami kebijakan ini/ })
        .getAttribute("aria-checked"),
    ).toBe("false")
  })

  it("fee mati langsung ke layar status tanpa pembayaran", async () => {
    svc.getCatalog.mockResolvedValue(catalog("none"))
    svc.create.mockResolvedValue({ booking: booking(), paymentRequired: false })
    fillWizard()
    renderRoute(<StepSummary />, { path: "/booking/ringkasan", at: "/booking/ringkasan" })
    await acceptAndPay("Konfirmasi booking")
    await waitFor(() => expect(screen.getByTestId("path").textContent).toBe("/booking/status/bk1"))
    expect(svc.startPayment).not.toHaveBeenCalled()
  })
})

describe("layar status", () => {
  const at = "/booking/status/bk1"
  const path = "/booking/status/:id"

  it("terkonfirmasi menampilkan kode dan bayar di toko", async () => {
    svc.get.mockResolvedValue(detail())
    renderRoute(<BookingStatusView />, { path, at })
    expect(await screen.findByText("LQ-1234")).toBeTruthy()
    expect(screen.getByText(/Bayar di toko/)).toBeTruthy()
  })

  it("hold masih berjalan menunggu konfirmasi pembayaran", async () => {
    svc.get.mockResolvedValue(
      detail({ status: "unpaid", holdExpiresAt: new Date(Date.now() + 12 * 60_000).toISOString() }),
    )
    renderRoute(<BookingStatusView />, { path, at })
    expect(await screen.findByText("Menunggu konfirmasi pembayaran...")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Lanjutkan pembayaran" })).toBeTruthy()
  })

  it("hold kedaluwarsa menawarkan booking lagi", async () => {
    svc.get.mockResolvedValue(
      detail({ status: "unpaid", holdExpiresAt: new Date(Date.now() - 60_000).toISOString() }),
    )
    renderRoute(<BookingStatusView />, { path, at })
    expect(await screen.findByText("Waktu pembayaran habis")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Booking lagi" })).toBeTruthy()
  })

  it("pembayaran terlambat menampilkan pesan pemeriksaan", async () => {
    svc.get.mockResolvedValue(detail({ status: "expired", latePayment: true }))
    renderRoute(<BookingStatusView />, { path, at })
    expect(
      await screen.findByText(/Pembayaran diterima\. Kami memeriksa ketersediaan jam Anda/),
    ).toBeTruthy()
  })
})

describe("batal booking", () => {
  it("dialog memperingatkan booking fee tidak dikembalikan lalu membatalkan", async () => {
    svc.get.mockResolvedValue(detail())
    svc.cancel.mockResolvedValue(booking({ status: "cancelled_customer" }))
    renderRoute(<BookingDetailView />, { path: "/booking-saya/:id", at: "/booking-saya/bk1" })
    fireEvent.click(await screen.findByRole("button", { name: "Batalkan booking" }))
    expect(await screen.findByText("Booking fee Rp 10.000 tidak dikembalikan.")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Ya, batalkan" }))
    await waitFor(() => expect(svc.cancel).toHaveBeenCalledWith("bk1"))
  })

  it("setelah jam mulai tombol batal hilang", async () => {
    svc.get.mockResolvedValue(
      detail({ start: "2000-01-01T10:00:00+07:00", end: "2000-01-01T10:30:00+07:00" }),
    )
    renderRoute(<BookingDetailView />, { path: "/booking-saya/:id", at: "/booking-saya/bk1" })
    expect(await screen.findByText("Hubungi toko untuk perubahan.")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Batalkan booking" })).toBeNull()
  })
})
