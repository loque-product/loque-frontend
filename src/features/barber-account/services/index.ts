import type { BarberAccountService } from "./contract"
import { httpBarberAccountService } from "./http"

export type { BarberAccountService } from "./contract"
export const barberAccountService: BarberAccountService = httpBarberAccountService
