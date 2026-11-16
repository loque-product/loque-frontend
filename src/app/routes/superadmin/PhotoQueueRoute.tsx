import { PageHeader } from "@/shared/components"
import { PhotoQueue } from "@/features/moderation"

export default function PhotoQueueRoute() {
  return (
    <>
      <PageHeader
        title="Antrean foto"
        description="Laporan foto portofolio barber. Foto yang disembunyikan diputuskan dalam 48 jam."
      />
      <PhotoQueue />
    </>
  )
}
