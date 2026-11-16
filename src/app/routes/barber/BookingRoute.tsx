import { usePageMeta } from "@/shared/hooks"
import { BarberBookingDetailView } from "@/features/barber-booking"

export default function BookingRoute() {
  usePageMeta("Detail booking")
  return <BarberBookingDetailView />
}
