import { PageHeader } from "@/shared/components"
import { BarberLinks } from "@/features/barber-profile"

export default function LinksRoute() {
  return (
    <>
      <PageHeader
        title="Tautan barber"
        description="Tautan, kode QR, dan statistik bulan ini. Hanya baca."
      />
      <BarberLinks />
    </>
  )
}
