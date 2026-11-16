import { usePageMeta } from "@/shared/hooks"
import { TodayView } from "@/features/barber-booking"

export default function TodayRoute() {
  usePageMeta("Hari ini")
  return <TodayView />
}
