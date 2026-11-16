import type { BillingService } from "./contract"
import { httpBillingService } from "./http"

export type { BillingService } from "./contract"
export const billingService: BillingService = httpBillingService
