import { PageHeader } from "@/shared/components"
import { BillList } from "@/features/billing"

export default function BillListRoute() {
  return (
    <>
      <PageHeader
        title="Tagihan"
        description="Tagih booking yang selesai dilayani dan lihat tagihan yang sudah selesai."
      />
      <BillList />
    </>
  )
}
