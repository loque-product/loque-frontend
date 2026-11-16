import { useLiveQuery, useMutate } from "@/shared/hooks"
import { useRole } from "@/features/auth"
import { notificationService } from "../services"

export function useNotifications() {
  const role = useRole()
  return useLiveQuery(["notifications", role], () => notificationService.list())
}

export function useUnreadCount(): number {
  const q = useNotifications()
  return q.data?.filter((n) => !n.read).length ?? 0
}

export const useMarkRead = () =>
  useMutate((id: string) => notificationService.markRead(id), {
    invalidate: ["notifications"],
  })
export const useMarkAllRead = () =>
  useMutate(() => notificationService.markAllRead(), {
    invalidate: ["notifications"],
    success: "Semua notifikasi ditandai dibaca.",
  })
