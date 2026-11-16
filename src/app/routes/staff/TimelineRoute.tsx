import { PageHeader } from "@/shared/components"
import { TimelineView } from "@/features/booking"

export default function TimelineRoute() {
  return (
    <>
      <PageHeader
        title="Timeline"
        description="Booking semua barber hari ini. Ketuk slot kosong untuk walk-in cepat."
      />
      <TimelineView />
    </>
  )
}
