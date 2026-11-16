import type { AnalyticsEvent, AnalyticsProps } from "../types"

export interface AnalyticsService {
  /** Peristiwa funnel. Tanpa login; galat diabaikan klien. */
  track(event: AnalyticsEvent, props: AnalyticsProps): Promise<void>
}
