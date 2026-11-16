import {
  Activity,
  BarChart3,
  Bell,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileText,
  Link2,
  Receipt,
  ReceiptText,
  ScrollText,
  Settings2,
  ShieldCheck,
  Star,
  Store,
  Tag,
  Undo2,
  UserCog,
  UserRoundSearch,
  Users,
  Wallet,
  Camera,
  PhoneCall,
  LayoutDashboard,
  Ban,
  type LucideIcon,
} from "lucide-react"
import { lazy, type ComponentType, type LazyExoticComponent } from "react"
import type { Role } from "@/shared/types"

export type NavGroup = "operasional" | "kelola" | "pemilik" | "sa" | "moderasi"

export interface AppRoute {
  path: string
  label: string
  icon: LucideIcon
  allow: Role[]
  /** Kelompok menu sidebar. Tanpa kelompok, rute tidak tampil di menu. */
  group?: NavGroup
  element: LazyExoticComponent<ComponentType>
}

const STAFF: Role[] = ["admin_kasir", "owner", "super_admin"]
const OWNER: Role[] = ["owner", "super_admin"]
const SA: Role[] = ["super_admin"]

/** Sumber tunggal: sidebar dan guard dibuat dari daftar ini. */
export const routes: AppRoute[] = [
  {
    path: "/staf/timeline",
    label: "Timeline",
    icon: CalendarClock,
    allow: STAFF,
    group: "operasional",
    element: lazy(() => import("./staff/TimelineRoute")),
  },
  {
    path: "/staf/booking/:id",
    label: "Detail booking",
    icon: ClipboardList,
    allow: STAFF,
    element: lazy(() => import("./staff/BookingDetailRoute")),
  },
  {
    path: "/staf/walk-in",
    label: "Walk-in",
    icon: UserCog,
    allow: STAFF,
    element: lazy(() => import("./staff/WalkInRoute")),
  },
  {
    path: "/staf/tagihan",
    label: "Tagihan",
    icon: Receipt,
    allow: STAFF,
    group: "operasional",
    element: lazy(() => import("./staff/BillListRoute")),
  },
  {
    path: "/staf/tagihan/:bookingId",
    label: "Tagihan booking",
    icon: ReceiptText,
    allow: STAFF,
    element: lazy(() => import("./staff/BillRoute")),
  },
  {
    path: "/staf/pelanggan",
    label: "Pelanggan",
    icon: Users,
    allow: STAFF,
    group: "operasional",
    element: lazy(() => import("./staff/CustomersRoute")),
  },
  {
    path: "/staf/ringkasan",
    label: "Ringkasan hari ini",
    icon: Activity,
    allow: STAFF,
    group: "operasional",
    element: lazy(() => import("./staff/SummaryRoute")),
  },
  {
    path: "/staf/refund",
    label: "Perlu di-refund",
    icon: Undo2,
    allow: STAFF,
    group: "operasional",
    element: lazy(() => import("./staff/RefundRoute")),
  },
  {
    path: "/staf/notifikasi",
    label: "Notifikasi",
    icon: Bell,
    allow: STAFF,
    element: lazy(() => import("./staff/NotificationsRoute")),
  },
  {
    path: "/staf/kelola/katalog",
    label: "Katalog dan harga",
    icon: Tag,
    allow: STAFF,
    group: "kelola",
    element: lazy(() => import("./staff/CatalogRoute")),
  },
  {
    path: "/staf/kelola/jadwal",
    label: "Jadwal",
    icon: CalendarDays,
    allow: STAFF,
    group: "kelola",
    element: lazy(() => import("./staff/ScheduleRoute")),
  },
  {
    path: "/staf/kelola/fee",
    label: "Booking fee",
    icon: Wallet,
    allow: STAFF,
    group: "kelola",
    element: lazy(() => import("./staff/FeeRoute")),
  },
  {
    path: "/staf/kelola/staf",
    label: "Staf",
    icon: UserCog,
    allow: STAFF,
    group: "kelola",
    element: lazy(() => import("./staff/StaffRoute")),
  },
  {
    path: "/staf/kelola/tautan",
    label: "Tautan barber",
    icon: Link2,
    allow: STAFF,
    group: "kelola",
    element: lazy(() => import("./staff/LinksRoute")),
  },

  {
    path: "/owner",
    label: "Dasbor",
    icon: LayoutDashboard,
    allow: OWNER,
    group: "pemilik",
    element: lazy(() => import("./owner/DashboardRoute")),
  },
  {
    path: "/owner/void",
    label: "Daftar void",
    icon: Ban,
    allow: OWNER,
    group: "pemilik",
    element: lazy(() => import("./owner/VoidRoute")),
  },
  {
    path: "/owner/laporan",
    label: "Laporan",
    icon: BarChart3,
    allow: OWNER,
    group: "pemilik",
    element: lazy(() => import("./owner/ReportsRoute")),
  },
  {
    path: "/owner/invoice",
    label: "Invoice",
    icon: FileText,
    allow: OWNER,
    group: "pemilik",
    element: lazy(() => import("./owner/InvoiceRoute")),
  },
  {
    path: "/owner/audit",
    label: "Log audit",
    icon: ScrollText,
    allow: OWNER,
    group: "pemilik",
    element: lazy(() => import("./owner/AuditRoute")),
  },
  {
    path: "/owner/toko",
    label: "Profil toko",
    icon: Store,
    allow: OWNER,
    group: "pemilik",
    element: lazy(() => import("./owner/ShopRoute")),
  },

  {
    path: "/sa/toko",
    label: "Toko dan penyiapan",
    icon: Store,
    allow: SA,
    group: "sa",
    element: lazy(() => import("./superadmin/ShopsRoute")),
  },
  {
    path: "/sa/toko/:shopId",
    label: "Detail toko",
    icon: Store,
    allow: SA,
    element: lazy(() => import("./superadmin/ShopDetailRoute")),
  },
  {
    path: "/sa/moderasi/foto",
    label: "Antrean foto",
    icon: Camera,
    allow: SA,
    group: "moderasi",
    element: lazy(() => import("./superadmin/PhotoQueueRoute")),
  },
  {
    path: "/sa/moderasi/ulasan",
    label: "Antrean ulasan",
    icon: Star,
    allow: SA,
    group: "moderasi",
    element: lazy(() => import("./superadmin/ReviewQueueRoute")),
  },
  {
    path: "/sa/sengketa",
    label: "Sengketa nomor",
    icon: PhoneCall,
    allow: SA,
    group: "sa",
    element: lazy(() => import("./superadmin/DisputesRoute")),
  },
  {
    path: "/sa/invoice",
    label: "Tagihan dan invoice",
    icon: ReceiptText,
    allow: SA,
    group: "sa",
    element: lazy(() => import("./superadmin/BillingRoute")),
  },
  {
    path: "/sa/audit",
    label: "Log audit global",
    icon: ShieldCheck,
    allow: SA,
    group: "sa",
    element: lazy(() => import("./superadmin/AuditRoute")),
  },
]

export const GROUP_LABEL: Record<NavGroup, string> = {
  operasional: "Operasional",
  kelola: "Kelola",
  pemilik: "Pemilik",
  sa: "Loque",
  moderasi: "Moderasi",
}

/** Kelompok menu milik toko. Super Admin melihatnya hanya saat mode toko aktif. */
export const SHOP_GROUPS: NavGroup[] = ["operasional", "kelola", "pemilik"]

/** Urutan kelompok menu per peran. */
export const GROUP_ORDER: Record<Role, NavGroup[]> = {
  admin_kasir: ["operasional", "kelola"],
  owner: ["operasional", "kelola", "pemilik"],
  super_admin: ["sa", "moderasi", ...SHOP_GROUPS],
  customer: [],
  barber: [],
}

export function navFor(role: Role, shopSelected = true): { group: NavGroup; items: AppRoute[] }[] {
  return GROUP_ORDER[role]
    .filter((group) => role !== "super_admin" || shopSelected || !SHOP_GROUPS.includes(group))
    .map((group) => ({
      group,
      items: routes.filter((r) => r.group === group && r.allow.includes(role)),
    }))
    .filter((g) => g.items.length > 0)
}

export function routeFor(pathname: string): AppRoute | undefined {
  return routes.find((r) => matchPath(r.path, pathname))
}

function matchPath(pattern: string, pathname: string): boolean {
  const re = new RegExp(`^${pattern.replace(/:[^/]+/g, "[^/]+")}/?$`)
  return re.test(pathname)
}
