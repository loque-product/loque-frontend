import { PageHeader } from "@/shared/components"
import { CustomersView } from "@/features/customers"

export default function CustomersRoute() {
  return (
    <>
      <PageHeader
        title="Pelanggan"
        description="Cari pelanggan dan lihat riwayat kunjungan di toko ini."
      />
      <CustomersView />
    </>
  )
}
