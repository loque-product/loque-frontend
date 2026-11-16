import { useEffect, type ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router"
import { toast } from "sonner"
import { ROLE_HOME } from "@/shared/constants"
import type { Role } from "@/shared/types"
import { useActiveShop, useSession } from "@/features/auth"

const STAFF_PREFIXES = ["/staf", "/owner", "/sa", "/barber/"]

/** Halaman masuk sesuai area: staf dan barber memakai /staf/masuk, customer memakai /masuk. */
export function loginPathFor(pathname: string): string {
  // "/barber" persis adalah daftar barber publik (customer); hanya "/barber/..." area barber.
  const staff = STAFF_PREFIXES.some((p) =>
    p.endsWith("/") ? pathname.startsWith(p) : pathname === p || pathname.startsWith(`${p}/`),
  )
  return staff ? "/staf/masuk" : "/masuk"
}

const valid = (s: { expiresAt: number } | null) => s !== null && s.expiresAt > Date.now()

/** Tanpa sesi (atau sesi berakhir) diarahkan ke halaman masuk dengan tujuan awal tersimpan. */
export function RequireAuth() {
  const session = useSession((s) => s.session)
  const status = useSession((s) => s.status)
  const location = useLocation()
  if (status === "loading") return null
  if (!valid(session))
    return (
      <Navigate
        to={loginPathFor(location.pathname)}
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  return <Outlet />
}

export function RequireRole({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const role = useSession((s) => s.session?.role)
  const denied = Boolean(role) && !allow.includes(role as Role)
  useEffect(() => {
    if (denied) toast.error("Anda tidak memiliki akses ke halaman itu.", { id: "forbidden" })
  }, [denied])
  if (!role) return null
  if (denied) return <Navigate to={ROLE_HOME[role]} replace />
  return <>{children}</>
}

/** Area customer: peran lain diarahkan ke beranda perannya dengan toast. */
export function RequireCustomer() {
  return (
    <RequireRole allow={["customer"]}>
      <Outlet />
    </RequireRole>
  )
}

/** Area barber: peran lain diarahkan ke beranda perannya dengan toast. */
export function RequireBarber() {
  return (
    <RequireRole allow={["barber"]}>
      <Outlet />
    </RequireRole>
  )
}

/** Akun dengan kata sandi sementara wajib menggantinya (dan menyetujui Syarat staf) dulu. */
export function RequirePasswordChanged() {
  const must = useSession((s) => s.session?.mustChangePassword)
  if (must) return <Navigate to="/staf/ganti-password" replace />
  return <Outlet />
}

/** Customer baru diarahkan ke /akun/lengkapi sampai nama dan nomor terisi. */
export function RequireCompleteProfile() {
  const complete = useSession((s) => s.session?.profileComplete)
  const location = useLocation()
  if (complete === false)
    return (
      <Navigate to="/akun/lengkapi" replace state={{ from: location.pathname + location.search }} />
    )
  return <Outlet />
}

/** Halaman tamu: pengguna yang sudah masuk diarahkan ke beranda perannya. */
export function GuestOnly() {
  const session = useSession((s) => s.session)
  const status = useSession((s) => s.status)
  if (status === "loading") return null
  if (valid(session)) return <Navigate to={ROLE_HOME[session!.role]} replace />
  return <Outlet />
}

/**
 * Halaman publik: staf dan barber yang membuka beranda diarahkan ke areanya;
 * tamu dan customer tetap di halaman.
 */
export function PublicAudience() {
  const session = useSession((s) => s.session)
  const status = useSession((s) => s.status)
  if (status === "loading") return null
  if (valid(session) && session!.role !== "customer")
    return <Navigate to={ROLE_HOME[session!.role]} replace />
  return <Outlet />
}

/**
 * Rute toko (/staf dan /owner) membutuhkan toko aktif untuk Super Admin (mode toko).
 * Tanpa toko terpilih, Super Admin diarahkan ke daftar toko.
 */
export function RequireShop({ children }: { children: ReactNode }) {
  const role = useSession((s) => s.session?.role)
  const shopId = useActiveShop((s) => s.shopId)
  const missing = role === "super_admin" && !shopId
  useEffect(() => {
    if (missing)
      toast.info("Pilih toko lebih dulu lewat Kelola sebagai Owner.", { id: "pilih-toko" })
  }, [missing])
  if (missing) return <Navigate to="/sa/toko" replace />
  return <>{children}</>
}
