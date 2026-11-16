// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { NotificationService } from "./contract"

export const httpNotificationService: NotificationService = {
  list: () => call("notifications", "notifications.list", {}, { read: true }),
  markRead: (id) => call("notifications", "notifications.markRead", { id }),
  markAllRead: () => call("notifications", "notifications.markAllRead", {}),
}
