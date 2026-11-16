import { PageHeader } from "@/shared/components"
import { ShopProfile } from "@/features/shops"

export default function ShopRoute() {
  return (
    <>
      <PageHeader
        title="Profil toko"
        description="Data toko, galeri, dan status pembayaran DOKU."
      />
      <ShopProfile />
    </>
  )
}
