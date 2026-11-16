import type { CustomerAccountService } from "./contract"
import { httpCustomerAccountService } from "./http"

export type { CustomerAccountService } from "./contract"
export const customerAccountService: CustomerAccountService = httpCustomerAccountService
