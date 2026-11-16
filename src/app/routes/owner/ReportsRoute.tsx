import { PageHeader } from "@/shared/components"
import { ReportsView } from "@/features/reports"

export default function ReportsRoute() {
  return (
    <>
      <PageHeader
        title="Laporan"
        description="Pendapatan, booking per barber, dan sumber booking."
      />
      <ReportsView />
    </>
  )
}
