import { PageHeader } from "@/shared/components"
import { AuditTable } from "@/features/audit"

export default function AuditRoute() {
  return (
    <>
      <PageHeader
        title="Log audit"
        description="Void, tidak hadir, perubahan harga, jadwal, booking fee, ekspor, dan akun."
      />
      <AuditTable scope="shop" />
    </>
  )
}
