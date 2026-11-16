import type { AccountService } from "./contract"
import { httpAccountService } from "./http"

export type { AccountService } from "./contract"
export const accountService: AccountService = httpAccountService
