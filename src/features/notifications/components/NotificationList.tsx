import { useNavigate } from "react-router"
import { Async, Button, EmptyState } from "@/shared/components"
import { cn } from "@/shared/utils/cn"
import { formatAge } from "@/shared/utils/format"
import { useMarkAllRead, useMarkRead, useNotifications } from "../hooks"

export function NotificationList() {
  const q = useNotifications()
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  const navigate = useNavigate()
  const unread = q.data?.filter((n) => !n.read).length ?? 0
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {unread} belum dibaca. Diperbarui otomatis tiap 30 detik.
        </p>
        <Button
          variant="secondary"
          disabled={unread === 0}
          onClick={() => markAll.mutate(undefined)}
        >
          Tandai semua dibaca
        </Button>
      </div>
      <Async
        query={q}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Belum ada notifikasi." />}
      >
        {(items) => (
          <ul className="flex flex-col gap-2">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead.mutate(n.id)
                    navigate(n.link)
                  }}
                  className={cn(
                    "flex min-h-11 w-full flex-col gap-0.5 rounded-xl bg-slate-50 p-4 text-left shadow-card hover:bg-slate-50",
                    n.read ? "bg-white" : "bg-primary-50",
                  )}
                >
                  <span className="flex items-center gap-2 font-medium text-slate-900">
                    {!n.read && (
                      <span
                        className="size-2 rounded-full bg-primary-600"
                        aria-label="Belum dibaca"
                      />
                    )}
                    {n.title}
                  </span>
                  <span className="text-sm text-slate-700">{n.body}</span>
                  <span className="text-xs text-slate-600">{formatAge(n.createdAt)} lalu</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Async>
    </div>
  )
}
