import { lazy, Suspense, useState } from "react"
import { useNavigate } from "react-router"
import { Logo } from "@/shared/components"
import { AppShell, WalkInTrigger } from "./AppShell"
import { Outlet } from "react-router"
import { useShopProfile } from "@/features/shops/hooks"

const BookingSheet = lazy(() =>
  import("@/features/booking/components/BookingSheet").then((m) => ({ default: m.BookingSheet })),
)
import { RequireShop } from "../guards"

function StaffLayoutInner() {
  const shop = useShopProfile()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <>
      <AppShell
        title={shop.data?.name ?? "Loque"}
        walkIn={<WalkInTrigger onClick={() => setOpen(true)} />}
      />
      {open && (
        <Suspense fallback={null}>
          <BookingSheet
            open={open}
            onOpenChange={setOpen}
            mode="walkin"
            onSaved={(id) => navigate(`/staf/booking/${id}`)}
          />
        </Suspense>
      )}
    </>
  )
}

/** Super Admin tanpa toko terpilih diarahkan ke daftar toko sebelum layout memuat data toko. */
export function StaffLayout() {
  return (
    <RequireShop>
      <StaffLayoutInner />
    </RequireShop>
  )
}

export function SuperAdminLayout() {
  return <AppShell title="Loque Super Admin" />
}

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-6 flex items-center gap-3">
        <Logo className="size-12" />
        <span className="text-title font-semibold text-slate-900">Loque</span>
      </div>
      <Outlet />
    </div>
  )
}
