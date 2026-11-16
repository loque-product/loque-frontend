export type PhotoDecision = "deleted" | "restored" | "kept_hidden"
export type ReviewDecision = "deleted" | "kept"
export type DisputeDecision = "reassigned" | "rejected"

export const PHOTO_REASON_LABEL = {
  me_in_photo: "Saya ada di foto ini",
  my_child: "Anak saya",
  other: "Lainnya",
} as const
export const PHOTO_DECISION_LABEL: Record<PhotoDecision, string> = {
  deleted: "Foto dihapus",
  restored: "Foto dipulihkan",
  kept_hidden: "Tetap disembunyikan",
}
export const REVIEW_DECISION_LABEL: Record<ReviewDecision, string> = {
  deleted: "Dihapus",
  kept: "Dipertahankan",
}
export const EVIDENCE_LABEL = {
  booking_code: "Kode booking",
  chat_screenshot: "Tangkapan layar percakapan dengan toko",
  shop_confirmation: "Konfirmasi tertulis dari toko",
} as const
