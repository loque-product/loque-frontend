import type { PaymentsService } from "./contract"
import { httpPaymentsService } from "./http"

export type { PaymentsService } from "./contract"
export const paymentsService: PaymentsService = httpPaymentsService
