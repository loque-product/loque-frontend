import { PageHeader } from "@/shared/components"
import { DisputeList } from "@/features/moderation"

export default function DisputesRoute() {
  return (
    <>
      <PageHeader
        title="Sengketa nomor"
        description="Periksa bukti dan putuskan kepemilikan nomor telepon."
      />
      <DisputeList />
    </>
  )
}
