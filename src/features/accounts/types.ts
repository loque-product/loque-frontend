import type { StaffRole } from "@/shared/types"

export interface CreateAccountInput {
  name: string
  email: string
  role: Exclude<StaffRole, "super_admin" | "owner">
  password: string
}
