// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { ScheduleService } from "./contract"

export const httpScheduleService: ScheduleService = {
  getSchedule: () => call("schedule", "schedule.getSchedule", {}, { read: true }),
  saveSchedule: (next, summary) => call("schedule", "schedule.saveSchedule", { next, summary }),
  saveTimeblock: (input) => call("schedule", "schedule.saveTimeblock", { input }),
  deleteTimeblock: (id) => call("schedule", "schedule.deleteTimeblock", { id }),
}
