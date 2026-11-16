import { PageHeader } from "@/shared/components"
import { BillingAdmin } from "@/features/invoicing"

export default function BillingRoute() {
  return (
    <>
      <PageHeader
        title="Tagihan dan invoice"
        description="Transaksi ditagih per toko dan periode, penutupan periode, dan status pembayaran invoice."
      />
      <BillingAdmin />
    </>
  )
}
