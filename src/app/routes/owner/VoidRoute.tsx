import { PageHeader } from "@/shared/components"
import { VoidList } from "@/features/billing"

export default function VoidRoute() {
  return (
    <>
      <PageHeader
        title="Daftar void"
        description="Periksa permintaan void kasir, berikan kode persetujuan, atau tolak."
      />
      <VoidList />
    </>
  )
}
