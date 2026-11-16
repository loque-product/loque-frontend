import { PageHeader } from "@/shared/components"
import { ReviewQueue } from "@/features/moderation"

export default function ReviewQueueRoute() {
  return (
    <>
      <PageHeader
        title="Antrean ulasan"
        description="Laporan ulasan dari barber dengan batas waktu 7 hari, serta Best Rated."
      />
      <ReviewQueue />
    </>
  )
}
