import type { BarberService } from "./contract"
import { httpBarberService } from "./http"

export type { BarberService } from "./contract"
export const barberService: BarberService = httpBarberService
