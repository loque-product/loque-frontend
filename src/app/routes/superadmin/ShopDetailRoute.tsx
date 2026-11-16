import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router"
import { Button, PageHeader } from "@/shared/components"
import { ShopSetup } from "@/features/shops"

export default function ShopDetailRoute() {
  const { shopId = "" } = useParams()
  return (
    <>
      <PageHeader
        title="Penyiapan toko"
        description="Selesaikan tujuh langkah secara berurutan."
        actions={
          <Button asChild variant="secondary">
            <Link to="/sa/toko">
              <ArrowLeft className="size-4" aria-hidden />
              Daftar toko
            </Link>
          </Button>
        }
      />
      <ShopSetup shopId={shopId} />
    </>
  )
}
