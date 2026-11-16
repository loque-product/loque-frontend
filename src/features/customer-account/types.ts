import type { Id } from "@/shared/types"

export interface CustomerProfile {
  id: Id
  name: string
  /** Dari Google; hanya baca. */
  email: string
  /** null sebelum profil dilengkapi. */
  phone: string | null
}

export interface ProfileInput {
  name: string
  /** Sudah dinormalisasi (`08...`). */
  phone: string
}
