import { PageHeader } from "@/shared/components"
import { AuditTable } from "@/features/audit"

export default function AuditRoute() {
  return (
    <>
      <PageHeader
        title="Log audit global"
        description="Aksi lintas toko, akses data pelanggan, dan keputusan moderasi."
      />
      <AuditTable scope="global" />
    </>
  )
}
