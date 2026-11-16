import { usePageMeta } from "@/shared/hooks"
import { BarberScheduleView } from "@/features/barber-schedule"

export default function ScheduleRoute() {
  usePageMeta("Jadwal")
  return <BarberScheduleView />
}
