import { PageHeader } from "@/shared/components"
import { ShopList } from "@/features/shops"

export default function ShopsRoute() {
  return (
    <>
      <PageHeader
        title="Toko dan penyiapan"
        description="Daftar toko dan checklist penyiapan sebelum toko dibuka ke publik."
      />
      <ShopList />
    </>
  )
}
