import type { BarberScheduleService } from "./contract"
import { httpBarberScheduleService } from "./http"

export type { BarberScheduleService } from "./contract"
export const barberScheduleService: BarberScheduleService = httpBarberScheduleService
