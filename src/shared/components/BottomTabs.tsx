import type { LucideIcon } from "lucide-react"
import { NavLink } from "react-router"
import { cn } from "@/shared/utils/cn"

export interface TabItem {
  to: string
  label: string
  icon: LucideIcon
  /** Cocok hanya pada jalur persis (mis. Beranda "/"). */
  end?: boolean
}

/** Tab bawah di mobile. Pada layar lebar dipakai ulang sebagai navigasi atas lewat `TopTabs`. */
export function BottomTabs({ items }: { items: TabItem[] }) {
  return (
    <nav
      aria-label="Navigasi utama"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-white lg:hidden"
    >
      <ul className="mx-auto flex max-w-2xl">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                  isActive ? "text-primary-700" : "text-slate-600",
                )
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function TopTabs({ items }: { items: TabItem[] }) {
  return (
    <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
      {items.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium",
              isActive ? "bg-primary-50 text-primary-800" : "text-slate-700 hover:bg-slate-100",
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
