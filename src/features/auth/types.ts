import type { Id, Role } from "@/shared/types"

export interface Session {
  role: Role
  personId: Id
  displayName: string
  /** Waktu sesi berakhir (epoch ms). Pada mode http dibaca dari server. */
  expiresAt: number
  /** Customer baru harus melengkapi profil (nama dan nomor) sebelum booking. */
  profileComplete?: boolean
  /** Barber dengan kata sandi sementara harus menggantinya lebih dulu. */
  mustChangePassword?: boolean
}

export type PermissionAction =
  | "booking.manage"
  | "billing.manage"
  | "void.request"
  | "void.decide"
  | "customers.view"
  | "summary.view"
  | "refund.manage"
  | "notifications.view"
  | "catalog.manage"
  | "schedule.manage"
  | "fee.manage"
  | "staff.create.barber"
  | "staff.create.admin"
  | "staff.create.owner"
  | "links.view"
  | "owner.dashboard"
  | "owner.voidList"
  | "owner.reports"
  | "owner.export"
  | "owner.invoice"
  | "owner.audit"
  | "owner.shopProfile"
  | "sa.shops"
  | "sa.moderation"
  | "sa.disputes"
  | "sa.billing"
  | "sa.audit"

/** Konteks yang dibawa lewat proses masuk (meniru `state` OAuth). */
export interface GoogleLoginState {
  barber?: string
  ref?: string
  next?: string
}
