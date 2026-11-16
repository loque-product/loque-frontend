import type { AuthService } from "./contract"
import { httpAuthService } from "./http"

export type { AuthService } from "./contract"
export const authService: AuthService = httpAuthService
