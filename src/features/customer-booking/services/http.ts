// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { CustomerBookingService } from "./contract"

export const httpCustomerBookingService: CustomerBookingService = {
  getCatalog: () => call("customer-booking", "customer-booking.getCatalog", {}, { read: true }),
  getNextAvailable: (serviceIds, gender) => call("customer-booking", "customer-booking.getNextAvailable", { serviceIds, gender }, { read: true }),
  getAvailability: (q) => call("customer-booking", "customer-booking.getAvailability", { q }, { read: true }),
  getSlots: (q) => call("customer-booking", "customer-booking.getSlots", { q }, { read: true }),
  create: (input) => call("customer-booking", "customer-booking.create", { input }),
  getHold: () => call("customer-booking", "customer-booking.getHold", {}, { read: true }),
  cancelHold: (id) => call("customer-booking", "customer-booking.cancelHold", { id }),
  startPayment: (bookingId) => call("customer-booking", "customer-booking.startPayment", { bookingId }),
  list: () => call("customer-booking", "customer-booking.list", {}, { read: true }),
  get: (id) => call("customer-booking", "customer-booking.get", { id }, { read: true }),
  cancel: (id) => call("customer-booking", "customer-booking.cancel", { id }),
  getTransaction: (id) => call("customer-booking", "customer-booking.getTransaction", { id }, { read: true }),
}
