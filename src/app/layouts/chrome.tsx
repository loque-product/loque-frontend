import { Bell, CalendarDays, Home, Scissors, Star, UserRound } from "lucide-react"
import type { ReactNode } from "react"
import { Link, Outlet, useLocation } from "react-router"
import { BottomTabs, Logo, OfflineBanner, TopTabs, type TabItem } from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { useCurrentUser } from "@/features/auth"
import { useUnreadCount } from "@/features/notifications"
import { useShopInfo } from "@/features/shop-info"
import { WizardGate } from "./WizardGate"

const CUSTOMER_TABS: TabItem[] = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/barber", label: "Barber", icon: Scissors, end: true },
  { to: "/booking-saya", label: "Booking", icon: CalendarDays },
  { to: "/akun", label: "Akun", icon: UserRound },
]

const BARBER_TABS: TabItem[] = [
  { to: "/barber/hari-ini", label: "Hari ini", icon: Home },
  { to: "/barber/jadwal", label: "Jadwal", icon: CalendarDays },
  { to: "/barber/profil", label: "Profil", icon: Scissors },
  { to: "/barber/ulasan", label: "Ulasan", icon: Star },
  { to: "/barber/akun", label: "Akun", icon: UserRound },
]

function Brand({ to = "/" }: { to?: string }) {
  const shop = useShopInfo()
  return (
    <Link to={to} className="flex min-h-11 items-center gap-2" aria-label="Loque, beranda">
      <Logo className="size-8" />
      <span className="truncate text-base font-semibold text-slate-900">
        {shop.data?.name ?? "Loque"}
      </span>
    </Link>
  )
}

function Bell_({ to }: { to: string }) {
  const unread = useUnreadCount()
  return (
    <Link
      to={to}
      aria-label={`Notifikasi, ${unread} belum dibaca`}
      className="relative flex size-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
    >
      <Bell className="size-4" aria-hidden />
      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 flex min-w-5 items-center justify-center rounded-full bg-danger-600 px-1 text-xs font-semibold text-white">
          {unread}
        </span>
      )}
    </Link>
  )
}

function TopBar({
  guest,
  items,
  notifyTo,
  home,
}: {
  guest: boolean
  items: TabItem[]
  notifyTo: string
  home: string
}) {
  const location = useLocation()
  return (
    <header className="sticky top-0 z-30 border-b bg-white">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        <Brand to={home} />
        <div className="ml-4 hidden items-center gap-1 md:flex lg:hidden">
          {guest && (
            <>
              <Link
                to="/barber"
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Barber
              </Link>
              <Link
                to="/toko"
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Info toko
              </Link>
            </>
          )}
        </div>
        {!guest && <TopTabs items={items} />}
        {guest && (
          <div className="ml-4 hidden items-center gap-1 lg:flex">
            <Link
              to="/barber"
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Barber
            </Link>
            <Link
              to="/toko"
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Info toko
            </Link>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          {guest ? (
            <Link
              to="/masuk"
              state={{ from: location.pathname + location.search }}
              className={buttonVariants({ size: "sm" })}
            >
              Masuk
            </Link>
          ) : (
            <Bell_ to={notifyTo} />
          )}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-4 pb-24 text-xs text-slate-600 lg:pb-4">
        <nav aria-label="Tautan bawah" className="flex flex-wrap gap-x-4">
          <Link to="/syarat" className="flex min-h-11 items-center hover:underline">
            Syarat
          </Link>
          <Link to="/privasi" className="flex min-h-11 items-center hover:underline">
            Privasi
          </Link>
          <Link to="/bantuan" className="flex min-h-11 items-center hover:underline">
            Bantuan
          </Link>
        </nav>
        <span>Didukung Loque</span>
      </div>
    </footer>
  )
}

interface Nav {
  items: TabItem[]
  notifyTo: string
  home: string
}
const CUSTOMER_NAV: Nav = { items: CUSTOMER_TABS, notifyTo: "/notifikasi", home: "/" }
const BARBER_NAV: Nav = {
  items: BARBER_TABS,
  notifyTo: "/barber/notifikasi",
  home: "/barber/hari-ini",
}

function Frame({
  guest,
  tabs,
  wide,
  footer,
  nav = CUSTOMER_NAV,
  width,
  children,
}: {
  guest: boolean
  tabs: boolean
  wide: boolean
  footer: boolean
  nav?: Nav
  width?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <OfflineBanner />
      <TopBar guest={guest} items={nav.items} notifyTo={nav.notifyTo} home={nav.home} />
      <main
        className={`mx-auto w-full flex-1 px-4 py-5 ${width ?? (wide ? "max-w-5xl" : "max-w-160")} ${!guest && tabs ? "pb-24 lg:pb-5" : ""}`}
      >
        {children}
      </main>
      {footer && <Footer />}
      {!guest && tabs && <BottomTabs items={nav.items} />}
    </div>
  )
}

/** Halaman publik: bar atas dan footer untuk tamu; tab bawah bila customer sudah masuk. */
export function PublicLayout() {
  const user = useCurrentUser()
  const guest = user?.role !== "customer"
  return (
    <Frame guest={guest} tabs wide footer>
      <Outlet />
    </Frame>
  )
}

/** Area aplikasi customer, dipusatkan lebar maks. 40 rem. */
export function CustomerLayout() {
  return (
    <Frame guest={false} tabs wide={false} footer={false}>
      <Outlet />
    </Frame>
  )
}

/** Wizard booking: tanpa tab bawah karena bar bawah dipakai ringkasan keranjang. */
export function WizardLayout() {
  return (
    <Frame guest={false} tabs={false} wide footer={false}>
      <WizardGate>
        <Outlet />
      </WizardGate>
    </Frame>
  )
}

/** Area barber: tab Hari ini, Jadwal, Profil, Ulasan, Akun; lebar maks. 48 rem pada layar lebar. */
export function BarberLayout() {
  return (
    <Frame
      guest={false}
      tabs
      wide={false}
      footer={false}
      nav={BARBER_NAV}
      width="max-w-160 lg:max-w-3xl"
    >
      <Outlet />
    </Frame>
  )
}
