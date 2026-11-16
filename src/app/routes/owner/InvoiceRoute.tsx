import { PageHeader } from "@/shared/components"
import { OwnerInvoices } from "@/features/invoicing"

export default function InvoiceRoute() {
  return (
    <>
      <PageHeader
        title="Invoice Loque"
        description="Biaya Rp 2.000 per transaksi selesai, ditagih bulanan."
      />
      <OwnerInvoices />
    </>
  )
}
