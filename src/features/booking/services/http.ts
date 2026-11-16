// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { BookingService } from "./contract"

export const httpBookingService: BookingService = {
  listByDate: (date) => call("booking", "booking.listByDate", { date }, { read: true }),
  get: (id) => call("booking", "booking.get", { id }, { read: true }),
  getSlots: (q) => call("booking", "booking.getSlots", { q }, { read: true }),
  createBooking: (input) => call("booking", "booking.createBooking", { input }),
  update: (input) => call("booking", "booking.update", { input }),
  markNoShow: (id, confirmed) => call("booking", "booking.markNoShow", { id, confirmed }),
  undoNoShow: (id) => call("booking", "booking.undoNoShow", { id }),
  cancelByCustomer: (id, reason) => call("booking", "booking.cancelByCustomer", { id, reason }),
  cancelByShop: (id, reason) => call("booking", "booking.cancelByShop", { id, reason }),
  confirmLate: (id) => call("booking", "booking.confirmLate", { id }),
}
