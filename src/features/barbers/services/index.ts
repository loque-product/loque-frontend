import type { BarberDirectoryService } from "./contract"
import { httpBarberDirectoryService } from "./http"

export type { BarberDirectoryService } from "./contract"
export const barberDirectoryService: BarberDirectoryService = httpBarberDirectoryService
