import type { BarberLinksService } from "./contract"
import { httpBarberLinksService } from "./http"

export type { BarberLinksService } from "./contract"
export const barberLinksService: BarberLinksService = httpBarberLinksService
