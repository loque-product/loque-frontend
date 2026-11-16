import { BEST_RATED_MIN_REVIEWS, REVIEW_MAX_LENGTH } from "@/shared/constants"

/** "Budi Santoso" menjadi "Budi S."; satu kata tetap apa adanya. */
export function reviewerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "Pelanggan"
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

export function validateReview(stars: number, comment: string): string | null {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return "Pilih 1 sampai 5 bintang."
  if (comment.length > REVIEW_MAX_LENGTH) return `Komentar maksimal ${REVIEW_MAX_LENGTH} karakter.`
  return null
}

export interface RatedBarber {
  id: string
  rating: number
  reviewCount: number
  lastReviewAt: string
  badgeHidden?: boolean
}

/** Best Rated: minimal 5 ulasan dan rata-rata tertinggi; seri dipecah ulasan terbanyak lalu terbaru. */
export function bestRatedId(barbers: RatedBarber[]): string | null {
  const eligible = barbers.filter((b) => b.reviewCount >= BEST_RATED_MIN_REVIEWS && !b.badgeHidden)
  if (eligible.length === 0) return null
  const sorted = [...eligible].sort(
    (a, b) =>
      b.rating - a.rating ||
      b.reviewCount - a.reviewCount ||
      new Date(b.lastReviewAt).getTime() - new Date(a.lastReviewAt).getTime(),
  )
  return sorted[0].id
}
