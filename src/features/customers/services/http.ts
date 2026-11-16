// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { CustomerService } from "./contract"

export const httpCustomerService: CustomerService = {
  search: (query) => call("customers", "customers.search", { query }, { read: true }),
  history: (customerId) => call("customers", "customers.history", { customerId }, { read: true }),
  findByPhone: (phone) => call("customers", "customers.findByPhone", { phone }, { read: true }),
}
