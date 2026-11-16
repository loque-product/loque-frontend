import type { BarberBookingService } from "./contract"
import { httpBarberBookingService } from "./http"

export type { BarberBookingService } from "./contract"
export const barberBookingService: BarberBookingService = httpBarberBookingService
