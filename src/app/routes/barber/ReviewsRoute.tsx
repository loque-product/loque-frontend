import { usePageMeta } from "@/shared/hooks"
import { BarberReviewsView } from "@/features/reviews"

export default function ReviewsRoute() {
  usePageMeta("Ulasan")
  return <BarberReviewsView />
}
