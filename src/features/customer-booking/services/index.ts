import type { CustomerBookingService } from "./contract"
import { httpCustomerBookingService } from "./http"

export type { CustomerBookingService } from "./contract"
export const customerBookingService: CustomerBookingService = httpCustomerBookingService
