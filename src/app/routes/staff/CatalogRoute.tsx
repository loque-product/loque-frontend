import { PageHeader } from "@/shared/components"
import { CatalogManager } from "@/features/catalog"

export default function CatalogRoute() {
  return (
    <>
      <PageHeader
        title="Katalog dan harga"
        description="Kelola layanan, add-on, harga standar, dan harga per barber."
      />
      <CatalogManager />
    </>
  )
}
