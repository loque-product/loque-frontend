import { ExternalLink } from "lucide-react"
import { Link } from "react-router"
import { Sheet } from "@/shared/components"
import { BookingDetailView } from "./BookingDetailView"

export function BookingDrawer({
  bookingId,
  onClose,
}: {
  bookingId: string | null
  onClose: () => void
}) {
  return (
    <Sheet
      open={bookingId !== null}
      onOpenChange={(o) => !o && onClose()}
      title="Detail booking"
      className="md:max-w-lg"
    >
      {bookingId && (
        <div className="flex flex-col gap-4">
          <Link
            to={`/staf/booking/${bookingId}`}
            className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-primary-800 underline"
          >
            <ExternalLink className="size-4" aria-hidden />
            Buka halaman penuh
          </Link>
          <BookingDetailView id={bookingId} layout="sheet" />
        </div>
      )}
    </Sheet>
  )
}
