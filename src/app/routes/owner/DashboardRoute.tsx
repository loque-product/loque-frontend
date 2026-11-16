import { PageHeader } from "@/shared/components"
import { Dashboard } from "@/features/reports"

export default function DashboardRoute() {
  return (
    <>
      <PageHeader
        title="Dasbor"
        description="Ringkasan toko, hal yang perlu diputuskan, dan tagihan Loque."
      />
      <Dashboard />
    </>
  )
}
