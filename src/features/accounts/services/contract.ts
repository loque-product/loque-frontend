import type { StaffAccount } from "@/shared/types"
import type { CreateAccountInput } from "../types"

export interface AccountService {
  list(): Promise<StaffAccount[]>
  create(input: CreateAccountInput): Promise<StaffAccount>
  /** Mengembalikan kata sandi sementara baru. */
  resetPassword(id: string): Promise<{ temporaryPassword: string }>
  /** Menonaktifkan barber ditolak jika masih punya booking mendatang. */
  setActive(id: string, active: boolean): Promise<void>
}
