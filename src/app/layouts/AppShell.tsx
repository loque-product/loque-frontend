import { ChevronsLeft, ChevronsRight, LogOut, Menu, Plus, X } from "lucide-react"
import { Dialog as RDialog, DropdownMenu } from "radix-ui"
import { Suspense, useEffect, useState, type ReactNode } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Logo, RoleBadge, Skeleton } from "@/shared/components"
import { ROLE_LABEL } from "@/shared/constants"
import { useMediaQuery } from "@/shared/hooks"
import { cn } from "@/shared/utils/cn"
import { signOut, useActiveShop, useSession } from "@/features/auth"
import { NotificationBell } from "@/features/notifications"
import { SHOP_GROUPS, GROUP_LABEL, navFor } from "../routes/routeConfig"
import { StoreModeBanner } from "./StoreModeBanner"

interface Props {
  title: string
  walkIn?: ReactNode
}

function Nav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const role = useSession((s) => s.session?.role)
  const shopId = useActiveShop((s) => s.shopId)
  if (!role) return null
  const groups = navFor(role, Boolean(shopId))
  const firstShopGroup = groups.find((g) => SHOP_GROUPS.includes(g.group))?.group
  return (
    <nav aria-label="Menu utama" className="flex flex-col gap-4">
      {groups.map(({ group, items }) => (
        <div key={group}>
          {role === "super_admin" && group === firstShopGroup && !collapsed && (
            <p className="mb-2 border-t border-primary-800 px-3 pt-3 text-xs font-semibold text-warning-200">
              Toko terpilih
            </p>
          )}
          {!collapsed && (
            <p className="px-3 pb-1 text-xs font-semibold text-primary-200">{GROUP_LABEL[group]}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {items.map((r) => (
              <li key={r.path}>
                <NavLink
                  to={r.path}
                  end
                  onClick={onNavigate}
                  title={collapsed ? r.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-primary-50 hover:bg-primary-800",
                      collapsed && "justify-center px-0",
                      isActive && "bg-primary-700 text-white",
                    )
                  }
                >
                  <r.icon className="size-5 shrink-0" aria-hidden />
                  {collapsed ? <span className="sr-only">{r.label}</span> : r.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** Blok profil dan keluar di bagian bawah sidebar. Selalu terlihat. */
function ProfileBlock({ collapsed, onLogout }: { collapsed: boolean; onLogout: () => void }) {
  const session = useSession((s) => s.session)
  if (!session) return null
  return (
    <div className="shrink-0 border-t border-primary-800 p-2">
      {!collapsed && (
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800">
            {session.displayName.slice(0, 1)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">
              {session.displayName}
            </span>
            <span className="block truncate text-xs text-primary-200">
              {ROLE_LABEL[session.role]}
            </span>
          </span>
        </div>
      )}
      <Button
        variant="sidebar"
        className={cn("w-full", collapsed ? "px-0" : "justify-start")}
        onClick={onLogout}
        aria-label="Keluar"
      >
        <LogOut className="size-4" aria-hidden />
        {!collapsed && "Keluar"}
      </Button>
    </div>
  )
}

export function AppShell({ title, walkIn }: Props) {
  const session = useSession((s) => s.session)
  const isMobile = !useMediaQuery("(min-width: 48rem)")
  const isWide = useMediaQuery("(min-width: 80rem)")
  const [collapsed, setCollapsed] = useState<boolean | null>(null)
  const [drawer, setDrawer] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  useEffect(() => setDrawer(false), [location.pathname])
  if (!session) return null
  // Tablet landscape: rel ikon secara default; desktop lebar: sidebar penuh.
  const rail = collapsed ?? !isWide

  const logout = async () => {
    await signOut()
    qc.clear()
    navigate("/staf/masuk")
  }

  return (
    // Tepat setinggi viewport tanpa gulir halaman luar. Hanya daftar menu dan area konten yang menggulir.
    <div className="flex h-dvh flex-col overflow-hidden">
      <StoreModeBanner />
      <div className="flex min-h-0 flex-1">
        {!isMobile && (
          <aside
            className={cn(
              "flex min-h-0 shrink-0 flex-col overflow-hidden bg-primary-900 text-primary-50 transition-[width]",
              rail ? "w-18" : "w-64",
            )}
          >
            <div
              className={cn(
                "flex h-16 shrink-0 items-center gap-3 px-4",
                rail && "justify-center px-0",
              )}
            >
              <Logo className="size-9" />
              {!rail && <span className="text-base font-semibold text-white">Loque</span>}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
              <Nav collapsed={rail} />
            </div>
            <div className="shrink-0 border-t border-primary-800 p-2">
              <Button
                variant="sidebar"
                className={cn("w-full", rail ? "px-0" : "justify-start")}
                onClick={() => setCollapsed(!rail)}
                aria-label={rail ? "Perluas menu" : "Ciutkan menu"}
              >
                {rail ? (
                  <ChevronsRight className="size-4" aria-hidden />
                ) : (
                  <>
                    <ChevronsLeft className="size-4" aria-hidden />
                    Ciutkan
                  </>
                )}
              </Button>
            </div>
            <ProfileBlock collapsed={rail} onLogout={() => void logout()} />
          </aside>
        )}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-3 md:px-6">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Buka menu"
                onClick={() => setDrawer(true)}
              >
                <Menu className="size-4" aria-hidden />
              </Button>
            )}
            <p className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">
              {title}
            </p>
            {walkIn}
            <NotificationBell />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex min-h-11 items-center gap-2 rounded-lg px-2 hover:bg-slate-100"
                  aria-label="Menu pengguna"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800">
                    {session.displayName.slice(0, 1)}
                  </span>
                  <span className="hidden text-left md:block">
                    <span className="block text-sm font-medium leading-4 text-slate-900">
                      {session.displayName}
                    </span>
                    <span className="block text-xs text-slate-600">{ROLE_LABEL[session.role]}</span>
                  </span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={4}
                  className="z-70 min-w-56 rounded-xl bg-white p-1 shadow-pop"
                >
                  <div className="flex flex-col gap-1 px-3 py-2">
                    <span className="text-sm font-medium">{session.displayName}</span>
                    <RoleBadge role={session.role} />
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
                  <DropdownMenu.Item
                    onSelect={() => void logout()}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm outline-none data-highlighted:bg-slate-100"
                  >
                    <LogOut className="size-4" aria-hidden />
                    Keluar
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </header>
          <main id="konten" className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            <Suspense
              fallback={
                <div className="flex flex-col gap-3" aria-busy="true">
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-64" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
      {/* Laci menu mobile: logo di atas dan profil di bawah tetap terlihat, hanya daftar menu yang menggulir. */}
      <RDialog.Root open={drawer} onOpenChange={setDrawer}>
        <RDialog.Portal>
          <RDialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50" />
          <RDialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-11/12 flex-col overflow-hidden bg-primary-900 text-primary-50 shadow-pop">
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-4">
              <span className="flex items-center gap-3">
                <Logo className="size-9" />
                <RDialog.Title className="text-base font-semibold text-white">Loque</RDialog.Title>
              </span>
              <RDialog.Close
                className="flex size-11 items-center justify-center rounded-lg text-primary-50 hover:bg-primary-800"
                aria-label="Tutup menu"
              >
                <X className="size-5" aria-hidden />
              </RDialog.Close>
            </div>
            <RDialog.Description className="sr-only">Menu utama aplikasi</RDialog.Description>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
              <Nav collapsed={false} onNavigate={() => setDrawer(false)} />
            </div>
            <ProfileBlock collapsed={false} onLogout={() => void logout()} />
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>
    </div>
  )
}

export function WalkInTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="shrink-0">
      <Plus className="size-4" aria-hidden />
      <span className="hidden sm:inline">Walk-in</span>
      <span className="sr-only sm:hidden">Walk-in</span>
    </Button>
  )
}
