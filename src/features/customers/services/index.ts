import type { CustomerService } from "./contract"
import { httpCustomerService } from "./http"

export type { CustomerService } from "./contract"
export const customerService: CustomerService = httpCustomerService
