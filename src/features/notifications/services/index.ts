import type { NotificationService } from "./contract"
import { httpNotificationService } from "./http"

export type { NotificationService } from "./contract"
export const notificationService: NotificationService = httpNotificationService
