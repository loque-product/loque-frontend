import type { ReviewService } from "./contract"
import { httpReviewService } from "./http"

export type { ReviewService } from "./contract"
export const reviewService: ReviewService = httpReviewService
