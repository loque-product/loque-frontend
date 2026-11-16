// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { ReviewService } from "./contract"

export const httpReviewService: ReviewService = {
  listForBarber: (slug) => call("reviews", "reviews.listForBarber", { slug }, { read: true }),
  listMine: () => call("reviews", "reviews.listMine", {}, { read: true }),
  getTarget: (bookingId) => call("reviews", "reviews.getTarget", { bookingId }, { read: true }),
  save: (draft) => call("reviews", "reviews.save", { draft }),
  remove: (reviewId) => call("reviews", "reviews.remove", { reviewId }),
  listAboutMe: () => call("reviews", "reviews.listAboutMe", {}, { read: true }),
  reportReview: (input) => call("reviews", "reviews.reportReview", { input }),
}
