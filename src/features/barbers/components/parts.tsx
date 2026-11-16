import { Award, Star } from "lucide-react"
import { Link } from "react-router"
import { Avatar, Badge, MoneyText } from "@/shared/components"
import { formatRupiah } from "@/shared/utils/format"
import type { PublicBarber } from "../types"

export function BestRatedBadge() {
  return (
    <Badge tone="primary">
      <Award className="size-3" aria-hidden />
      Best Rated
    </Badge>
  )
}

export function RatingInline({ rating, count }: { rating: number; count: number }) {
  if (count === 0) return <span className="text-xs text-slate-600">Belum ada ulasan</span>
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-700">
      <Star className="size-3.5 fill-star text-star" aria-hidden />
      <span className="font-medium tabular-nums">{rating.toFixed(1).replace(".", ",")}</span>
      <span className="text-slate-600">({count} ulasan)</span>
    </span>
  )
}

/** Kartu foto ringkas untuk geser horizontal. */
export function BarberCard({
  barber,
  best,
  to,
}: {
  barber: PublicBarber
  best: boolean
  to: string
}) {
  return (
    <Link
      to={to}
      className="flex w-44 shrink-0 snap-start flex-col gap-2 rounded-xl bg-white p-3 shadow-card hover:bg-slate-50"
    >
      <Avatar name={barber.name} src={barber.photoUrl} className="size-20 rounded-lg" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{barber.name}</p>
        <p className="truncate text-xs text-slate-600">
          {barber.specialties.join(", ") || "Barber"}
        </p>
      </div>
      <RatingInline rating={barber.rating} count={barber.reviewCount} />
      {best && <BestRatedBadge />}
    </Link>
  )
}

/** Baris lebar untuk daftar barber. */
export function BarberRow({
  barber,
  best,
  to,
}: {
  barber: PublicBarber
  best: boolean
  to: string
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex min-h-11 items-center gap-3 px-1 py-3 hover:bg-slate-50 md:px-3"
      >
        <Avatar name={barber.name} src={barber.photoUrl} className="size-16 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold text-slate-900">{barber.name}</p>
            {best && <BestRatedBadge />}
          </div>
          <p className="truncate text-sm text-slate-600">
            {barber.specialties.join(", ") || "Barber"}
          </p>
          <RatingInline rating={barber.rating} count={barber.reviewCount} />
        </div>
        {barber.startingPrice !== null && (
          <p className="shrink-0 text-right text-xs text-slate-600">
            Mulai dari
            <MoneyText
              value={barber.startingPrice}
              className="block text-sm font-semibold tabular-nums text-slate-900"
            />
          </p>
        )}
      </Link>
    </li>
  )
}

export const priceFrom = (v: number) => `Mulai dari ${formatRupiah(v)}`
