import { Link } from "react-router"
import {
  Async,
  Avatar,
  Button,
  Card,
  CardContent,
  ImageWithFallback,
  MoneyText,
  PageSkeleton,
  PhotoGrid,
  StarsView,
} from "@/shared/components"
import { CATEGORY_LABEL } from "@/shared/constants"
import { formatDate, formatDuration } from "@/shared/utils/format"
import { BestRatedBadge, type BarberProfile } from "@/features/barbers"
import { ReportPhotoButton } from "@/features/portfolio"
import { useBarberReviews } from "@/features/reviews"

function Reviews({ slug }: { slug: string }) {
  const q = useBarberReviews(slug)
  return (
    <section aria-labelledby="bp-reviews" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="bp-reviews" className="text-section font-semibold text-slate-900">
          Ulasan
        </h2>
        <span className="text-xs text-slate-600">Terbaru</span>
      </div>
      <Async
        query={q}
        skeleton={<PageSkeleton rows={2} />}
        isEmpty={(d) => d.length === 0}
        empty={<p className="text-sm text-slate-600">Belum ada ulasan.</p>}
      >
        {(reviews) => (
          <ul className="divide-y rounded-xl bg-white px-4 shadow-card">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-1 py-3">
                <div className="flex items-center justify-between gap-2">
                  <StarsView value={r.stars} />
                  <span className="text-xs text-slate-600">
                    {formatDate(r.createdAt)}
                    {r.edited ? " · Diedit" : ""}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-slate-800">{r.comment}</p>}
                <p className="text-xs text-slate-600">{r.authorName}</p>
              </li>
            ))}
          </ul>
        )}
      </Async>
    </section>
  )
}

/** Isi profil barber. Dipakai halaman publik dan pratinjau barber. */
export function BarberProfileBody({
  profile: p,
  best,
  onBook,
  preview = false,
}: {
  profile: BarberProfile
  best: string | null
  onBook?: () => void
  preview?: boolean
}) {
  return (
    <div className={`flex flex-col gap-6 ${onBook ? "pb-20" : ""}`}>
      <header className="flex flex-col gap-4">
        <ImageWithFallback
          src={p.coverUrl}
          alt={`Sampul ${p.name}`}
          ratio={3}
          className="-mx-4 w-[calc(100%+2rem)] md:mx-0 md:w-full md:rounded-xl"
        />
        <div className="flex items-start gap-4">
          <Avatar name={p.name} src={p.photoUrl} className="size-20 rounded-xl text-xl" />
          <div className="min-w-0">
            <h1 className="font-serif text-display font-medium text-slate-900">{p.name}</h1>
            <p className="text-sm text-slate-600">{p.specialties.join(", ")}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StarsView value={p.rating} />
              <span className="text-xs text-slate-600">
                {p.reviewCount > 0
                  ? `${p.rating.toFixed(1).replace(".", ",")} dari ${p.reviewCount} ulasan`
                  : "Belum ada ulasan"}
              </span>
              {p.id === best && <BestRatedBadge />}
            </div>
          </div>
        </div>
        {p.bio && <p className="text-sm text-slate-800">{p.bio}</p>}
      </header>

      <section aria-labelledby="bp-prices" className="flex flex-col gap-3">
        <h2 id="bp-prices" className="text-section font-semibold text-slate-900">
          Harga layanan
        </h2>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {p.prices.map((s) => (
                <li key={s.serviceId} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-600">
                      {CATEGORY_LABEL[s.category]}
                      {s.duration > 0 ? ` · ${formatDuration(s.duration)}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                    {s.startingFrom && (
                      <span className="mr-1 text-xs font-normal text-slate-600">mulai dari</span>
                    )}
                    <MoneyText value={s.price} />
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {p.gallery.length > 0 && (
        <section aria-labelledby="bp-gallery" className="flex flex-col gap-3">
          <h2 id="bp-gallery" className="text-section font-semibold text-slate-900">
            Galeri
          </h2>
          <PhotoGrid
            photos={p.gallery}
            renderAction={preview ? undefined : (ph) => <ReportPhotoButton photoId={ph.id} />}
          />
        </section>
      )}

      <Reviews slug={p.slug} />

      {onBook && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t bg-white px-4 py-3 lg:static lg:border-0 lg:bg-transparent lg:p-0">
          <div className="mx-auto max-w-160 lg:max-w-none">
            <Button className="w-full lg:w-auto" onClick={onBook}>
              Booking dengan {p.name}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
