import type { ShareChannel } from "@/shared/domain/links"

export const ANALYTICS_EVENTS = [
  "profile_viewed",
  "book_clicked",
  "login_started",
  "login_completed",
  "service_selected",
  "slot_selected",
  "payment_opened",
  "payment_paid",
  "booking_abandoned",
] as const
export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]

/** Properti tanpa nama atau nomor telepon: hanya ID pseudonim dan kanal tautan. */
export interface AnalyticsProps {
  aid: string
  ref?: ShareChannel
  [key: string]: string | number | boolean | undefined
}
