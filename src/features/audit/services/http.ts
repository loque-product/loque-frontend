// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { AuditService } from "./contract"

export const httpAuditService: AuditService = {
  listShop: () => call("audit", "audit.listShop", {}, { read: true }),
  listGlobal: () => call("audit", "audit.listGlobal", {}, { read: true }),
}
