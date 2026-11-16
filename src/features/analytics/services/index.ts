import type { AnalyticsService } from "./contract"
import { httpAnalyticsService } from "./http"

export type { AnalyticsService } from "./contract"
export const analyticsService: AnalyticsService = httpAnalyticsService
