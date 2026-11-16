import { Bell } from "lucide-react"
import { Popover } from "radix-ui"
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Button, EmptyState } from "@/shared/components"
import { cn } from "@/shared/utils/cn"
import { formatAge } from "@/shared/utils/format"
import { useRole } from "@/features/auth"
import { useMarkAllRead, useMarkRead, useNotifications } from "../hooks"

export function NotificationBell() {
  const q = useNotifications()
  const role = useRole()
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const items = q.data ?? []
  const unread = items.filter((n) => !n.read).length

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifikasi, ${unread} belum dibaca`}
        >
          <Bell className="size-4" aria-hidden />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex min-w-5 items-center justify-center rounded-full bg-danger-600 px-1 text-xs font-semibold text-white">
              {unread}
            </span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          className="z-70 flex max-h-96 w-96 max-w-screen flex-col rounded-xl bg-white shadow-pop"
        >
          <div className="flex items-center justify-between border-b px-4 py-2">
            <p className="font-semibold">Notifikasi</p>
            <Button
              variant="ghost"
              size="sm"
              disabled={unread === 0}
              onClick={() => markAll.mutate(undefined)}
            >
              Tandai semua dibaca
            </Button>
          </div>
          <ul className="overflow-y-auto">
            {items.length === 0 && (
              <li>
                <EmptyState title="Belum ada notifikasi." className="py-8" />
              </li>
            )}
            {items.slice(0, 8).map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead.mutate(n.id)
                    setOpen(false)
                    navigate(n.link)
                  }}
                  className={cn(
                    "flex min-h-11 w-full flex-col gap-0.5 border-b px-4 py-3 text-left hover:bg-slate-50",
                    !n.read && "bg-primary-50",
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    {!n.read && (
                      <span
                        className="size-2 shrink-0 rounded-full bg-primary-600"
                        aria-label="Belum dibaca"
                      />
                    )}
                    {n.title}
                  </span>
                  <span className="text-xs text-slate-600">{n.body}</span>
                  <span className="text-xs text-slate-500">{formatAge(n.createdAt)} lalu</span>
                </button>
              </li>
            ))}
          </ul>
          {role !== "super_admin" && (
            <Link
              to="/staf/notifikasi"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center justify-center border-t text-sm font-medium text-primary-800 hover:bg-slate-50"
            >
              Lihat semua
            </Link>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
