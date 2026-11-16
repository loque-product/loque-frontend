// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { ROLE_HOME } from "@/shared/constants"
import { useSession, type Session } from "@/features/auth"
import {
  GuestOnly,
  loginPathFor,
  PublicAudience,
  RequireAuth,
  RequireBarber,
  RequireCompleteProfile,
  RequirePasswordChanged,
  RequireCustomer,
  RequireRole,
} from "./index"

const session = (role: Session["role"], extra: Partial<Session> = {}): Session => ({
  role,
  personId: "p1",
  displayName: "Tester",
  expiresAt: Date.now() + 3_600_000,
  ...extra,
})

function renderAt(path: string, s: Session | null) {
  useSession.setState({ session: s, status: "ready" })
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PublicAudience />}>
          <Route path="/" element={<p>beranda</p>} />
        </Route>
        <Route element={<GuestOnly />}>
          <Route path="/masuk" element={<p>masuk customer</p>} />
          <Route path="/staf/masuk" element={<p>masuk staf</p>} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<RequireCustomer />}>
            <Route path="/akun/lengkapi" element={<p>lengkapi profil</p>} />
            <Route element={<RequireCompleteProfile />}>
              <Route path="/booking-saya" element={<p>booking saya</p>} />
            </Route>
          </Route>
          <Route
            path="/staf/timeline"
            element={
              <RequireRole allow={["admin_kasir", "owner"]}>
                <p>timeline staf</p>
              </RequireRole>
            }
          />
          <Route element={<RequireBarber />}>
            <Route element={<RequirePasswordChanged />}>
              <Route path="/barber/hari-ini" element={<p>hari ini barber</p>} />
            </Route>
          </Route>
          <Route path="/staf/ganti-password" element={<p>ganti kata sandi</p>} />
          <Route path={ROLE_HOME.owner} element={<p>beranda owner</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(cleanup)

describe("loginPathFor", () => {
  it("area staf dan barber ke /staf/masuk, selebihnya ke /masuk", () => {
    expect(loginPathFor("/staf/timeline")).toBe("/staf/masuk")
    expect(loginPathFor("/owner/dasbor")).toBe("/staf/masuk")
    expect(loginPathFor("/sa/toko")).toBe("/staf/masuk")
    expect(loginPathFor("/barber/hari-ini")).toBe("/staf/masuk")
    expect(loginPathFor("/booking-saya")).toBe("/masuk")
    expect(loginPathFor("/barber")).toBe("/masuk")
    expect(loginPathFor("/stafkita")).toBe("/masuk")
  })
})

describe("guard Customer", () => {
  it("tamu yang membuka area customer diarahkan ke /masuk", () => {
    renderAt("/booking-saya", null)
    expect(screen.getByText("masuk customer")).toBeTruthy()
  })
  it("tamu yang membuka area staf diarahkan ke /staf/masuk", () => {
    renderAt("/staf/timeline", null)
    expect(screen.getByText("masuk staf")).toBeTruthy()
  })
  it("sesi kedaluwarsa diperlakukan sebagai tamu", () => {
    renderAt("/booking-saya", session("customer", { expiresAt: Date.now() - 1 }))
    expect(screen.getByText("masuk customer")).toBeTruthy()
  })
  it("customer dengan profil lengkap membuka booking saya", () => {
    renderAt("/booking-saya", session("customer", { profileComplete: true }))
    expect(screen.getByText("booking saya")).toBeTruthy()
  })
  it("customer baru diarahkan melengkapi profil", () => {
    renderAt("/booking-saya", session("customer", { profileComplete: false }))
    expect(screen.getByText("lengkapi profil")).toBeTruthy()
  })
  it("customer tidak bisa membuka area staf", () => {
    renderAt("/staf/timeline", session("customer", { profileComplete: true }))
    expect(screen.getByText("beranda")).toBeTruthy()
  })
  it("staf yang membuka beranda publik diarahkan ke areanya", () => {
    renderAt("/", session("owner"))
    expect(screen.getByText("beranda owner")).toBeTruthy()
  })
  it("pengguna masuk tidak melihat halaman masuk lagi", () => {
    renderAt("/masuk", session("customer", { profileComplete: true }))
    expect(screen.getByText("beranda")).toBeTruthy()
  })
})

describe("guard Barber", () => {
  it("tamu diarahkan ke /staf/masuk", () => {
    renderAt("/barber/hari-ini", null)
    expect(screen.getByText("masuk staf")).toBeTruthy()
  })
  it("customer tidak bisa membuka area barber", () => {
    renderAt("/barber/hari-ini", session("customer", { profileComplete: true }))
    expect(screen.getByText("beranda")).toBeTruthy()
  })
  it("barber dengan kata sandi sementara diarahkan ke ganti kata sandi", () => {
    renderAt("/barber/hari-ini", session("barber", { mustChangePassword: true }))
    expect(screen.getByText("ganti kata sandi")).toBeTruthy()
  })
  it("barber yang sudah mengganti kata sandi membuka Hari ini", () => {
    renderAt("/barber/hari-ini", session("barber"))
    expect(screen.getByText("hari ini barber")).toBeTruthy()
  })
})
