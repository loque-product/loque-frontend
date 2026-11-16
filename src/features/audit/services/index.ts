import type { AuditService } from "./contract"
import { httpAuditService } from "./http"

export type { AuditService } from "./contract"
export const auditService: AuditService = httpAuditService
