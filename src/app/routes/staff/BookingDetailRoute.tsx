import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router"
import { Button, PageHeader } from "@/shared/components"
import { BookingDetailView } from "@/features/booking"

export default function BookingDetailRoute() {
  const { id = "" } = useParams()
  return (
    <>
      <PageHeader
        title="Detail booking"
        actions={
          <Button asChild variant="secondary">
            <Link to="/staf/timeline">
              <ArrowLeft className="size-4" aria-hidden />
              Kembali ke timeline
            </Link>
          </Button>
        }
      />
      <div className="max-w-4xl">
        <BookingDetailView id={id} />
      </div>
    </>
  )
}
