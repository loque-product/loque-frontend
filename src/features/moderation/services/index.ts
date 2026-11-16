import type { ModerationService } from "./contract"
import { httpModerationService } from "./http"

export type { ModerationService } from "./contract"
export const moderationService: ModerationService = httpModerationService
