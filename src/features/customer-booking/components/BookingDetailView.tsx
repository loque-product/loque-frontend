import { CalendarPlus, MapPin, MessageCircle } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import {
  Async,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  MoneyText,
  PageSkeleton,
  StatusBadge,
} from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { usePageMeta, useOnlineStatus } from "@/shared/hooks"
import { buildGoogleCalendarLink } from "@/shared/domain/links"
import { formatDayLong, formatDuration, formatRupiah, formatTime } from "@/shared/utils/format"
import { waLink } from "@/shared/lib/wa-link"
import { feeSummary } from "@/features/payments"
import { canCancel, holdActive } from "../domain/status"
import { useBookingDetail, useCancelMyBooking, useStartPayment } from "../hooks"
import type { CustomerBookingDetail } from "../types"
import { PolicyText } from "./wizard/StepSummary"
import { servicesSummary } from "./BookingRow"
import { goExternal } from "@/shared/lib/external-navigation"

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-2 text-sm">
      <dt className="text-slate-600">{k}</dt>
      <dd className="text-right text-slate-900">{children}</dd>
    </div>
  )
}

function Detail({ d }: { d: CustomerBookingDetail }) {
  const b = d.booking
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const cancel = useCancelMyBooking()
  const pay = useStartPayment()
  const [confirm, setConfirm] = useState(false)
  const now = Date.now()
  const fee = feeSummary(b.feeMode, b.feeAmount, b.serviceTotal)
  const started = now >= new Date(b.start).getTime()
  const active = b.status === "confirmed" || b.status === "unpaid"
  const wa = waLink(
    d.shop.whatsapp,
    `Halo, saya ingin bertanya tentang booking ${b.code} pada ${formatDayLong(b.start)}, ${formatTime(b.start)} WIB.`,
  )
  const calendar = buildGoogleCalendarLink({
    title: `Booking di ${d.shop.name}`,
    start: b.start,
    end: b.end,
    details: `Kode booking ${b.code}. ${servicesSummary(b.items)} dengan ${b.barberName}.`,
    location: d.shop.address,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-title font-semibold text-slate-900">{formatDayLong(b.start)}</h1>
          <p className="text-sm tabular-nums text-slate-700">
            {formatTime(b.start)} sampai {formatTime(b.end)} WIB ·{" "}
            {formatDuration((new Date(b.end).getTime() - new Date(b.start).getTime()) / 60000)}
          </p>
        </div>
        {b.status === "no_show" ? (
          <Badge tone="danger">Tidak hadir</Badge>
        ) : (
          <StatusBadge status={b.status} />
        )}
      </div>

      {b.rescheduled && (
        <Banner tone="info" title="Jadwal diubah oleh toko">
          Periksa jadwal baru di atas. Hubungi toko bila tidak cocok.
        </Banner>
      )}
      {b.status === "cancelled_shop" && (
        <Banner tone="danger" title="Dibatalkan oleh toko">
          {b.cancelReason && <p>Alasan: {b.cancelReason}</p>}
          {b.refund && (
            <p className="mt-1 font-medium">
              {b.refund === "done" ? "Refund selesai" : "Refund diproses"}. Slot dilepas.
            </p>
          )}
        </Banner>
      )}
      {b.status === "no_show" && (
        <Banner tone="danger">Anda tidak hadir. Booking fee hangus.</Banner>
      )}
      {b.status === "cancelled_customer" && (
        <Banner>Booking dibatalkan. Booking fee tidak dikembalikan.</Banner>
      )}
      {b.latePayment && b.status === "unpaid" && (
        <Banner tone="info">
          Pembayaran diterima. Kami memeriksa ketersediaan jam Anda dan akan menghubungi lewat
          WhatsApp.
        </Banner>
      )}

      <Card>
        <CardContent className="p-4">
          <dl className="divide-y">
            <Row k="Kode booking">
              <span className="font-semibold tabular-nums">{b.code}</span>
            </Row>
            <Row k="Barber">
              <Link to={`/b/${b.barberSlug}`} className="font-medium text-primary-800 underline">
                {b.barberName}
              </Link>
            </Row>
            {b.guestName && <Row k="Tamu">{b.guestName}</Row>}
            <Row k="Layanan">
              <ul>
                {b.items.map((i) => (
                  <li key={i.serviceId}>
                    {i.name} <MoneyText value={i.price} className="tabular-nums text-slate-600" />
                  </li>
                ))}
              </ul>
            </Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Rincian</h2>
          <dl className="divide-y">
            <Row k="Total layanan">
              <MoneyText value={b.serviceTotal} className="tabular-nums" />
            </Row>
            <Row k="Booking fee">
              {b.feeMode === "none" ? (
                "Tanpa booking fee"
              ) : (
                <MoneyText value={b.feeAmount} className="tabular-nums" />
              )}
            </Row>
            <Row k="Sisa bayar di toko">
              <MoneyText value={b.payAtShop} className="font-semibold tabular-nums" />
            </Row>
          </dl>
          <p className="mt-2 text-xs text-slate-600">{fee.text}</p>
          {b.feeMode !== "none" && (
            <Link
              to={`/booking-saya/${b.id}/transaksi`}
              className="mt-2 flex min-h-11 items-center text-sm font-medium text-primary-800 underline"
            >
              Lihat transaksi dan bukti pembayaran
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 p-4">
          <h2 className="text-base font-semibold text-slate-900">{d.shop.name}</h2>
          <p className="flex items-start gap-2 text-sm text-slate-700">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            {d.shop.address}
          </p>
          <a
            href={d.shop.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className={`${buttonVariants({ variant: "secondary", size: "sm" })} self-start`}
          >
            Buka Maps
          </a>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {b.status === "unpaid" && holdActive(b, now) && (
          <Button
            loading={pay.isPending}
            disabled={!online}
            onClick={() => pay.mutate(b.id, { onSuccess: (s) => goExternal(s.redirectUrl) })}
          >
            Lanjutkan pembayaran
          </Button>
        )}
        {b.reviewable && (
          <Link to={`/ulasan/${b.id}`} className={buttonVariants()}>
            {b.reviewId ? "Ubah ulasan" : "Tulis ulasan"}
          </Link>
        )}
        {active && (
          <a
            href={calendar}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "secondary" })}
          >
            <CalendarPlus className="size-4" aria-hidden />
            Tambah ke Google Calendar
          </a>
        )}
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "secondary" })}
        >
          <MessageCircle className="size-4" aria-hidden />
          WhatsApp toko
        </a>
        {active && canCancel(b, now) && (
          <Button
            variant="ghost"
            className="text-danger-700"
            disabled={!online}
            onClick={() => setConfirm(true)}
          >
            Batalkan booking
          </Button>
        )}
        {active && started && (
          <p className="text-center text-sm text-slate-600">Hubungi toko untuk perubahan.</p>
        )}
        {active && !started && (
          <p className="text-center text-xs text-slate-600">
            Untuk mengganti jadwal, hubungi toko lewat WhatsApp.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Batalkan booking ini?"
        confirmLabel="Ya, batalkan"
        cancelLabel="Tidak"
        variant="danger"
        loading={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(b.id, {
            onSuccess: () => {
              setConfirm(false)
              toast.info("Booking dibatalkan.")
              navigate("/booking-saya")
            },
            onError: () => setConfirm(false),
          })
        }
        description={
          b.feeMode === "none" ? (
            "Slot akan dilepas."
          ) : (
            <p className="font-medium">
              Booking fee {formatRupiah(b.feeAmount)} tidak dikembalikan.
            </p>
          )
        }
      >
        <div className="mt-3">
          <PolicyText fee={b.feeAmount} none={b.feeMode === "none"} />
        </div>
      </ConfirmDialog>
    </div>
  )
}

export function BookingDetailView() {
  usePageMeta("Detail booking")
  const { id = "" } = useParams()
  const q = useBookingDetail(id)
  return (
    <Async query={q} skeleton={<PageSkeleton rows={6} />}>
      {(d) => <Detail d={d} />}
    </Async>
  )
}
