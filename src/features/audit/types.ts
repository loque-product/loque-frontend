import type { AuditCategory } from "@/shared/types"

export const AUDIT_CATEGORY_LABEL: Record<AuditCategory, string> = {
  price: "Harga",
  schedule: "Jadwal",
  fee: "Booking fee",
  void: "Void",
  no_show: "Tidak hadir",
  export: "Ekspor",
  account: "Akun",
  customer_access: "Akses data pelanggan",
  moderation: "Keputusan moderasi",
  invoice: "Invoice",
  shop: "Toko",
}
