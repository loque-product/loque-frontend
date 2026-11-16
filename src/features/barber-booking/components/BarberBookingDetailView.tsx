import { ChevronLeft, MessageCircle } from "lucide-react"
import { Link, useParams } from "react-router"
import {
  Async,
  Banner,
  Card,
  CardContent,
  EmptyState,
  MoneyText,
  PageSkeleton,
  StatusBadge,
} from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { CHANNEL_LABEL, SOURCE_LABEL } from "@/shared/constants"
import { usePageMeta } from "@/shared/hooks"
import { ApiError } from "@/shared/api"
import { waLink } from "@/shared/lib/wa-link"
import { formatDayLong, formatDuration, formatPhone, formatTime } from "@/shared/utils/format"
import { useBarberBooking } from "../hooks"
import type { BarberBookingDetail } from "../types"

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-2 text-sm">
      <dt className="shrink-0 text-slate-600">{k}</dt>
      <dd className="text-right text-slate-900">{children}</dd>
    </div>
  )
}

function Detail({ b }: { b: BarberBookingDetail }) {
  const minutes = b.items.reduce((sum, i) => sum + i.duration, 0)
  const first = b.customerName.split(" ")[0]
  const wa = b.customerPhone
    ? waLink(
        b.customerPhone,
        `Halo ${first}, saya ${b.barberName} dari ${b.shopName}. Terkait booking ${b.code} pada ${formatDayLong(b.start)}, ${formatTime(b.start)} WIB.`,
      )
    : null
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-title font-semibold text-slate-900">{b.customerName}</h1>
          <p className="text-sm tabular-nums text-slate-700">
            {formatDayLong(b.start)}, {formatTime(b.start)} sampai {formatTime(b.end)} WIB
          </p>
        </div>
        <StatusBadge status={b.status} />
      </div>

      <Card>
        <CardContent>
          <dl className="divide-y">
            <Row k="Kode booking">
              <span className="font-semibold tabular-nums">{b.code}</span>
            </Row>
            <Row k="Sumber">
              {SOURCE_LABEL[b.source]}
              {b.channel ? ` (${CHANNEL_LABEL[b.channel]})` : ""}
            </Row>
            <Row k="Telepon">
              {b.customerPhone ? (
                <span className="tabular-nums">{formatPhone(b.customerPhone)}</span>
              ) : (
                "Tidak dicatat"
              )}
            </Row>
            <Row k="Durasi">{formatDuration(minutes)}</Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-1 text-base font-semibold text-slate-900">Layanan</h2>
          <p className="mb-1 text-xs text-slate-600">Harga dan durasi saat booking dibuat.</p>
          <ul className="divide-y">
            {b.items.map((i) => (
              <li key={i.serviceId} className="flex items-start justify-between gap-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block text-slate-900">{i.name}</span>
                  <span className="text-xs text-slate-600">{formatDuration(i.duration)}</span>
                </span>
                <MoneyText value={i.price} className="tabular-nums text-slate-900" />
              </li>
            ))}
            <li className="flex justify-between gap-3 py-2 text-sm font-semibold text-slate-900">
              <span>Total layanan</span>
              <MoneyText value={b.serviceTotal} className="tabular-nums" />
            </li>
          </ul>
        </CardContent>
      </Card>

      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "secondary" })}
        >
          <MessageCircle className="size-4" aria-hidden />
          WhatsApp customer
        </a>
      )}
      <Banner>Nomor hanya untuk urusan booking.</Banner>
    </div>
  )
}

export function BarberBookingDetailView() {
  usePageMeta("Detail booking")
  const { id = "" } = useParams()
  const q = useBarberBooking(id)
  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/barber/hari-ini"
        className="flex min-h-11 items-center gap-1 self-start text-sm font-medium text-primary-800"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Hari ini
      </Link>
      {q.isError && ApiError.is(q.error) && q.error.code === "NOT_FOUND" ? (
        <EmptyState
          title="Booking tidak ditemukan."
          action={
            <Link to="/barber/hari-ini" className={buttonVariants({ variant: "secondary" })}>
              Kembali ke Hari ini
            </Link>
          }
        />
      ) : (
        <Async query={q} skeleton={<PageSkeleton rows={5} />}>
          {(b) => <Detail b={b} />}
        </Async>
      )}
    </div>
  )
}
