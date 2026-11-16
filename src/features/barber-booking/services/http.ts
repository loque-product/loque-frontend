// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { BarberBookingService } from "./contract"

export const httpBarberBookingService: BarberBookingService = {
  getDay: (date) => call("barber-booking", "barber-booking.getDay", { date }, { read: true }),
  get: (id) => call("barber-booking", "barber-booking.get", { id }, { read: true }),
}
