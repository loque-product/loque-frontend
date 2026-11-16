import type { ScheduleService } from "./contract"
import { httpScheduleService } from "./http"

export type { ScheduleService } from "./contract"
export const scheduleService: ScheduleService = httpScheduleService
