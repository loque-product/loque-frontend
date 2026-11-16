import { NotificationList } from "@/features/notifications"
import { usePageMeta } from "@/shared/hooks"

export default function NotificationsRoute() {
  usePageMeta("Notifikasi")
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title font-semibold text-slate-900">Notifikasi</h1>
      <NotificationList />
    </div>
  )
}
