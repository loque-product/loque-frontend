import { MapPin, MessageCircle } from "lucide-react"
import { Link, useNavigate } from "react-router"
import {
  Async,
  Banner,
  Button,
  Card,
  CardContent,
  Countdown,
  ImageWithFallback,
  MoneyText,
  Skeleton,
  StatusBadge,
} from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { usePageMeta, useNow } from "@/shared/hooks"
import { formatDayLong, formatTime } from "@/shared/utils/format"
import { waLink } from "@/shared/lib/wa-link"
import { track } from "@/features/analytics"
import { useCurrentUser } from "@/features/auth"
import { BarberCard, useBarberList } from "@/features/barbers"
import { bestRatedId } from "@/features/reviews"
import {
  beginBooking,
  holdActive,
  servicesSummary,
  useHold,
  useMyBookings,
} from "@/features/customer-booking"
import { openStatus, useShopInfo } from "@/features/shop-info"

function Hero() {
  const shop = useShopInfo()
  const user = useCurrentUser()
  const s = shop.data
  return (
    <section className="-mx-4 -mt-5 bg-cream px-4 py-8 md:mx-0 md:mt-0 md:rounded-xl md:px-8">
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div className="flex flex-col items-start gap-4">
          {s ? (
            <>
              <h1 className="font-serif text-hero font-medium text-slate-900">{s.name}</h1>
              <p className="max-w-md text-base text-slate-700">{s.tagline}</p>
            </>
          ) : (
            <Skeleton className="h-24 w-full" />
          )}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/booking/data-tamu"
              onClick={() => {
                beginBooking()
                track("book_clicked", { source: "home" })
              }}
              className={buttonVariants()}
            >
              Booking Baru
            </Link>
            <Link
              to="/barber"
              className="flex min-h-11 items-center text-sm font-medium text-primary-800 underline"
            >
              Lihat barber
            </Link>
          </div>
          {!user && (
            <p className="text-xs text-slate-600">
              Anda perlu masuk dengan Google untuk membuat booking.
            </p>
          )}
        </div>
        <ImageWithFallback
          src={s?.heroPhotoUrl}
          alt={s ? `Foto ${s.name}` : "Foto toko"}
          ratio={4 / 3}
          className="w-full rounded-xl"
          eager
        />
      </div>
    </section>
  )
}

function ShopQuick() {
  const shop = useShopInfo()
  const now = useNow(60_000)
  const s = shop.data
  if (!s) return <Skeleton className="h-28 w-full" />
  const st = openStatus(s.hours, now)
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span
            className={`size-2 rounded-full ${st.open ? "bg-primary-600" : "bg-slate-400"}`}
            aria-hidden
          />
          {st.open ? "Buka" : "Tutup"}
          <span className="font-normal text-slate-700">
            {st.label.replace(/^(Buka|Tutup)( hari ini| sekarang)?\.? ?/, "")}
          </span>
        </p>
        <p className="flex items-start gap-2 text-sm text-slate-700">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {s.address}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={s.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Buka Maps
          </a>
          <a
            href={waLink(s.whatsapp, "Halo, saya ingin bertanya tentang booking.")}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

function BarberStrip() {
  const q = useBarberList()
  return (
    <section aria-labelledby="home-barbers" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="home-barbers" className="text-section font-semibold text-slate-900">
          Barber kami
        </h2>
        <Link to="/barber" className="text-sm font-medium text-primary-800 underline">
          Semua
        </Link>
      </div>
      <Async
        query={q}
        skeleton={<Skeleton className="h-44 w-full" />}
        isEmpty={(d) => d.length === 0}
        empty={<p className="text-sm text-slate-600">Belum ada barber.</p>}
      >
        {(barbers) => {
          const best = bestRatedId(
            barbers.map((b) => ({
              id: b.id,
              rating: b.rating,
              reviewCount: b.reviewCount,
              lastReviewAt: b.lastReviewAt ?? "",
              badgeHidden: b.badgeHidden,
            })),
          )
          return (
            <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
              {barbers.map((b) => (
                <li key={b.id}>
                  <BarberCard barber={b} best={b.id === best} to={`/b/${b.slug}`} />
                </li>
              ))}
            </ul>
          )
        }}
      </Async>
    </section>
  )
}

function HoldBanner() {
  const hold = useHold()
  const navigate = useNavigate()
  const now = useNow(1000)
  const b = hold.data
  if (!b || !holdActive(b, now) || !b.holdExpiresAt) return null
  return (
    <Banner
      tone="warning"
      title="Pembayaran booking menunggu"
      action={
        <Button size="sm" onClick={() => navigate(`/booking/status/${b.id}`)}>
          Lanjutkan pembayaran
        </Button>
      }
    >
      Sisa waktu <Countdown to={b.holdExpiresAt} className="font-semibold" />
    </Banner>
  )
}

function UpcomingAndRebook() {
  const q = useMyBookings()
  const navigate = useNavigate()
  const now = useNow(60_000)
  const list = q.data ?? []
  const upcoming = list
    .filter((b) => b.status === "confirmed" && new Date(b.end).getTime() > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0]
  const seen = new Set<string>()
  const past = list
    .filter((b) => b.status === "completed")
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    .filter((b) => {
      const key = `${b.barberId}:${b.items
        .map((i) => i.serviceId)
        .sort()
        .join(",")}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 3)
  return (
    <>
      {upcoming && (
        <section aria-labelledby="home-upcoming" className="flex flex-col gap-3">
          <h2 id="home-upcoming" className="text-section font-semibold text-slate-900">
            Booking mendatang
          </h2>
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {formatDayLong(upcoming.start)}
                  </p>
                  <p className="text-sm text-slate-700 tabular-nums">
                    {formatTime(upcoming.start)} WIB · {upcoming.barberName}
                  </p>
                </div>
                <StatusBadge status={upcoming.status} />
              </div>
              <p className="text-sm text-slate-700">{servicesSummary(upcoming.items)}</p>
              <p className="text-sm text-slate-900">
                Bayar di toko:{" "}
                <MoneyText value={upcoming.payAtShop} className="font-semibold tabular-nums" />
              </p>
              <Link
                to={`/booking-saya/${upcoming.id}`}
                className={buttonVariants({ variant: "secondary" })}
              >
                Lihat detail
              </Link>
            </CardContent>
          </Card>
        </section>
      )}
      {past.length > 0 && (
        <section aria-labelledby="home-rebook" className="flex flex-col gap-2">
          <h2 id="home-rebook" className="text-section font-semibold text-slate-900">
            Pesan lagi
          </h2>
          <ul className="divide-y rounded-xl bg-white px-3 shadow-card">
            {past.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{b.barberName}</p>
                  <p className="truncate text-xs text-slate-600">{servicesSummary(b.items)}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    beginBooking({
                      forSelf: b.guestName === null,
                      guestName: b.guestName ?? "",
                      gender: b.gender,
                      serviceIds: b.items.map((i) => i.serviceId),
                      barberId: b.barberId,
                    })
                    track("book_clicked", { source: "rebook" })
                    navigate("/booking/jadwal")
                  }}
                >
                  Pesan lagi
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

export default function HomeRoute() {
  usePageMeta("Loque", "Booking barber online, pilih barber dan jam yang cocok.")
  const user = useCurrentUser()
  const customer = user?.role === "customer"
  return (
    <div className="flex flex-col gap-6">
      {customer && <HoldBanner />}
      {customer && <UpcomingAndRebook />}
      <Hero />
      <div className="grid gap-6 md:grid-cols-2">
        <ShopQuick />
        <BarberStrip />
      </div>
    </div>
  )
}
