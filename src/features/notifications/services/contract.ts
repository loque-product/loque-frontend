import type { AppNotification } from "@/shared/types"

export interface NotificationService {
  list(): Promise<AppNotification[]>
  markRead(id: string): Promise<void>
  markAllRead(): Promise<void>
}
