import { PageHeader } from "@/shared/components"
import { FeeSettings } from "@/features/payments"

export default function FeeRoute() {
  return (
    <>
      <PageHeader
        title="Booking fee"
        description="Atur nominal dan skema booking fee untuk booking baru."
      />
      <FeeSettings />
    </>
  )
}
