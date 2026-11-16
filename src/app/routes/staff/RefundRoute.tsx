import { PageHeader } from "@/shared/components"
import { RefundList } from "@/features/payments"

export default function RefundRoute() {
  return (
    <>
      <PageHeader
        title="Perlu di-refund"
        description="Pengembalian booking fee untuk booking yang dibatalkan toko."
      />
      <RefundList />
    </>
  )
}
