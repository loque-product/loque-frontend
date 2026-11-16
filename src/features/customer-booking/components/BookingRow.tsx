import { Link } from "react-router"
import { Badge, StatusBadge } from "@/shared/components"
import { formatDayShort, formatTime } from "@/shared/utils/format"
import type { BookingItem } from "@/shared/types"
import type { CustomerBooking } from "../types"

/** "Haircut" atau "Haircut dan 2 lainnya". */
export function servicesSummary(items: BookingItem[]): string {
  if (items.length === 0) return "Layanan"
  if (items.length === 1) return items[0].name
  return `${items[0].name} dan ${items.length - 1} lainnya`
}

/** Baris Booking saya: tanggal dan jam, barber, layanan ringkas, status, dan label refund. */
export function BookingRow({ booking, to }: { booking: CustomerBooking; to: string }) {
  const refund = booking.refund
  return (
    <li>
      <Link to={to} className="flex min-h-11 flex-col gap-1 px-1 py-3 hover:bg-slate-50">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">
            {formatDayShort(booking.start)}, {formatTime(booking.start)}
          </p>
          {booking.status === "no_show" ? (
            <Badge tone="danger">Tidak hadir</Badge>
          ) : (
            <StatusBadge status={booking.status} />
          )}
        </div>
        <p className="text-sm text-slate-700">
          {booking.barberName} · {servicesSummary(booking.items)}
        </p>
        {refund && (
          <span>
            <Badge tone={refund === "done" ? "primary" : "warning"}>
              {refund === "done" ? "Refund selesai" : "Refund diproses"}
            </Badge>
          </span>
        )}
      </Link>
    </li>
  )
}
