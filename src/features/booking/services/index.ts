import type { BookingService } from "./contract"
import { httpBookingService } from "./http"

export type { BookingService } from "./contract"
export const bookingService: BookingService = httpBookingService
