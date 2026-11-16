import type { AuditLog } from "@/shared/types"

export interface AuditService {
  /** Log audit toko (Owner). */
  listShop(): Promise<AuditLog[]>
  /** Log audit global (Super Admin). */
  listGlobal(): Promise<AuditLog[]>
}
