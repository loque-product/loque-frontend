import { PageHeader } from "@/shared/components"
import { NotificationList } from "@/features/notifications"

export default function NotificationsRoute() {
  return (
    <>
      <PageHeader title="Notifikasi" description="Pemberitahuan dalam aplikasi untuk toko Anda." />
      <div className="max-w-3xl">
        <NotificationList />
      </div>
    </>
  )
}
