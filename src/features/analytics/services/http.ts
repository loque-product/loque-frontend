// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { AnalyticsService } from "./contract"

export const httpAnalyticsService: AnalyticsService = {
  track: (event, props) => call("analytics", "analytics.track", { event, props }),
}
