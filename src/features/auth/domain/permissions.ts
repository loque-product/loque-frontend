import type { Role } from "@/shared/types"
import type { PermissionAction } from "../types"

const STAFF: PermissionAction[] = [
  "booking.manage",
  "billing.manage",
  "void.request",
  "customers.view",
  "summary.view",
  "refund.manage",
  "notifications.view",
  "catalog.manage",
  "schedule.manage",
  "fee.manage",
  "staff.create.barber",
  "links.view",
]
const OWNER_ONLY: PermissionAction[] = [
  "void.decide",
  "staff.create.admin",
  "owner.dashboard",
  "owner.voidList",
  "owner.reports",
  "owner.export",
  "owner.invoice",
  "owner.audit",
  "owner.shopProfile",
]
const SUPER: PermissionAction[] = [
  "staff.create.owner",
  "notifications.view",
  "sa.shops",
  "sa.moderation",
  "sa.disputes",
  "sa.billing",
  "sa.audit",
]

const MATRIX: Record<Role, ReadonlySet<PermissionAction>> = {
  admin_kasir: new Set(STAFF),
  owner: new Set([...STAFF, ...OWNER_ONLY]),
  // Super Admin dapat mengelola toko terpilih seperti Owner (mode toko), selain area Loque.
  super_admin: new Set([...STAFF, ...OWNER_ONLY, ...SUPER]),
  // Customer dan barber tidak memakai area staf.
  customer: new Set<PermissionAction>(),
  barber: new Set<PermissionAction>(),
}

/** Matriks izin aksi (bagian B konteks). Hanya untuk tampilan; server tetap harus menegakkannya. */
export function can(role: Role | null | undefined, action: PermissionAction): boolean {
  return role ? MATRIX[role].has(action) : false
}
