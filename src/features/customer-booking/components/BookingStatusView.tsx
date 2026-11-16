import { CalendarPlus, Check, Copy, Hourglass } from "lucide-react"
import { useEffect, useRef } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import {
  Banner,
  Button,
  Card,
  CardContent,
  Countdown,
  ErrorState,
  MoneyText,
  PageSkeleton,
} from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { goExternal } from "@/shared/lib/external-navigation"
import { usePageMeta } from "@/shared/hooks"
import { buildGoogleCalendarLink } from "@/shared/domain/links"
import { formatDayLong, formatTime } from "@/shared/utils/format"
import { track } from "@/features/analytics"
import { holdActive } from "../domain/status"
import { useBookingStatus, useStartPayment } from "../hooks"
import { beginBooking } from "../store/wizard"
import { servicesSummary } from "./BookingRow"

/** Layar sesudah DOKU: memeriksa tiap 3 detik selama hold, lalu sukses, habis, atau terlambat. */
export function BookingStatusView() {
  usePageMeta("Status booking")
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const pay = useStartPayment()
  const first = useRef<{ status?: string }>({})
  const q = useBookingStatus(id)
  const d = q.data
  const b = d?.booking
  const now = Date.now()
  const waiting = b?.status === "unpaid" && holdActive(b, now)
  const confirmed = b ? ["confirmed", "completed"].includes(b.status) : false

  useEffect(() => {
    if (confirmed && first.current.status !== "confirmed") {
      first.current.status = "confirmed"
      track("payment_paid")
    }
  }, [confirmed])

  if (q.isLoading) return <PageSkeleton rows={4} />
  if (q.isError || !d || !b) return <ErrorState onRetry={() => void q.refetch()} />

  const continuePay = () =>
    pay.mutate(b.id, {
      onSuccess: (s) => goExternal(s.redirectUrl),
      onError: () => toast.error("Pembayaran belum bisa dibuka. Coba lagi."),
    })

  if (b.latePayment && !confirmed)
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <Banner tone="info" title="Pembayaran diterima">
            Pembayaran diterima. Kami memeriksa ketersediaan jam Anda dan akan menghubungi lewat
            WhatsApp.
          </Banner>
          <Link to="/" className={buttonVariants({ variant: "secondary" })}>
            Kembali ke beranda
          </Link>
        </CardContent>
      </Card>
    )

  if (waiting && b.holdExpiresAt)
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <Hourglass className="size-8 text-warning-700" aria-hidden />
          <h1 className="text-title font-semibold text-slate-900">
            Menunggu konfirmasi pembayaran...
          </h1>
          <p className="text-sm text-slate-700">Sisa waktu pembayaran</p>
          <Countdown
            to={b.holdExpiresAt}
            onElapsed={() => void q.refetch()}
            className="text-hero font-semibold tabular-nums text-slate-900"
          />
          <p className="text-xs text-slate-600">
            Halaman ini diperbarui otomatis. Bila pembayaran gagal, Anda bisa mencoba lagi selama
            waktu masih ada.
          </p>
          <Button loading={pay.isPending} onClick={continuePay}>
            Lanjutkan pembayaran
          </Button>
        </CardContent>
      </Card>
    )

  if (!confirmed)
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <h1 className="text-title font-semibold text-slate-900">Waktu pembayaran habis</h1>
          <p className="text-sm text-slate-700">
            Jam yang Anda pilih sudah dilepas. Buat booking baru untuk memilih jam lagi.
          </p>
          <Button
            onClick={() => {
              beginBooking()
              navigate("/booking/data-tamu")
            }}
          >
            Booking lagi
          </Button>
        </CardContent>
      </Card>
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
      <Card>
        <CardContent className="flex flex-col items-start gap-3 p-6">
          <h1 className="text-title font-semibold text-slate-900">Booking terkonfirmasi</h1>
          <p className="text-sm text-slate-600">Tunjukkan kode ini di toko</p>
          <div className="flex items-center gap-2">
            <span className="text-display font-semibold tabular-nums text-slate-900">{b.code}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Salin kode booking"
              onClick={() =>
                void navigator.clipboard
                  ?.writeText(b.code)
                  .then(() => toast.success("Kode disalin."))
              }
            >
              <Copy className="size-4" aria-hidden />
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-2 p-4 text-sm">
          <p className="font-semibold text-slate-900">{formatDayLong(b.start)}</p>
          <p className="tabular-nums text-slate-800">
            {formatTime(b.start)} sampai {formatTime(b.end)} WIB · {b.barberName}
          </p>
          <p className="text-slate-700">{servicesSummary(b.items)}</p>
          <p className="border-t pt-2 text-base font-semibold text-slate-900">
            Bayar di toko: <MoneyText value={b.payAtShop} className="tabular-nums" />
          </p>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2">
        <a
          href={calendar}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "secondary" })}
        >
          <CalendarPlus className="size-4" aria-hidden />
          Tambah ke Google Calendar
        </a>
        <Link to={`/booking-saya/${b.id}`} className={buttonVariants({ variant: "secondary" })}>
          Lihat detail
        </Link>
        <Link to="/" className={buttonVariants({ variant: "ghost" })}>
          Kembali ke beranda
        </Link>
      </div>
    </div>
  )
}
