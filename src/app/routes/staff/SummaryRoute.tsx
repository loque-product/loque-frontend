import { PageHeader } from "@/shared/components"
import { TodaySummary } from "@/features/reports"

export default function SummaryRoute() {
  return (
    <>
      <PageHeader
        title="Ringkasan hari ini"
        description="Ringkasan hanya baca untuk operasional toko hari ini."
      />
      <TodaySummary />
    </>
  )
}
