// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { ModerationService } from "./contract"

export const httpModerationService: ModerationService = {
  listPhotoReports: () => call("moderation", "moderation.listPhotoReports", {}, { read: true }),
  decidePhoto: (id, decision, reason) => call("moderation", "moderation.decidePhoto", { id, decision, reason }),
  listReviewReports: () => call("moderation", "moderation.listReviewReports", {}, { read: true }),
  decideReview: (id, decision, reason) => call("moderation", "moderation.decideReview", { id, decision, reason }),
  listBarbersByShop: () => call("moderation", "moderation.listBarbersByShop", {}, { read: true }),
  hideBadge: (barberId, reason) => call("moderation", "moderation.hideBadge", { barberId, reason }),
  listDisputes: () => call("moderation", "moderation.listDisputes", {}, { read: true }),
  openDispute: (id) => call("moderation", "moderation.openDispute", { id }),
  decideDispute: (id, decision, reason) => call("moderation", "moderation.decideDispute", { id, decision, reason }),
}
