// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { BarberScheduleService } from "./contract"

export const httpBarberScheduleService: BarberScheduleService = {
  getMine: () => call("barber-schedule", "barber-schedule.getMine", {}, { read: true }),
  saveWorkingHours: (days) => call("barber-schedule", "barber-schedule.saveWorkingHours", { days }),
  saveBlock: (input) => call("barber-schedule", "barber-schedule.saveBlock", { input }),
  deleteBlock: (id) => call("barber-schedule", "barber-schedule.deleteBlock", { id }),
}
