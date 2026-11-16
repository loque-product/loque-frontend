import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router"
import { Button, PageHeader } from "@/shared/components"
import { BillPage } from "@/features/billing"

export default function BillRoute() {
  const { bookingId = "" } = useParams()
  return (
    <>
      <PageHeader
        title="Tagihan booking"
        description="Periksa layanan, catat pembayaran di toko, lalu tandai selesai."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/staf/timeline">
                <ArrowLeft className="size-4" aria-hidden />
                Kembali ke Timeline
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/staf/tagihan">Daftar tagihan</Link>
            </Button>
          </>
        }
      />
      <BillPage bookingId={bookingId} />
    </>
  )
}
