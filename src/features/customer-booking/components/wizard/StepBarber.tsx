import { Check } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  MoneyText,
  PageSkeleton,
  Sheet,
} from "@/shared/components"
import { usePageMeta } from "@/shared/hooks"
import { cn } from "@/shared/utils/cn"
import { formatDayShort, formatDuration, formatTime } from "@/shared/utils/format"
import { toYmd } from "@/shared/domain/time"
import {
  BestRatedBadge,
  RatingInline,
  useBarberProfile,
  type PublicBarber,
} from "@/features/barbers"
import { bestRatedId } from "@/features/reviews"
import { cheapestBarberIds, quoteForBarber } from "../../domain/cart"
import { useNextAvailable } from "../../hooks"
import { WizardFrame } from "./WizardFrame"
import { useCart } from "./useCart"

function nearestLabel(at: string | null | undefined): string {
  if (at === undefined) return "Memeriksa jam kosong"
  if (at === null) return "Tidak ada jam kosong dalam 45 hari"
  const today = toYmd(Date.now())
  return toYmd(at) === today
    ? `Tersedia hari ini ${formatTime(at)}`
    : `Tersedia ${formatDayShort(at)} ${formatTime(at)}`
}

function ProfilePreview({ slug, onClose }: { slug: string; onClose: () => void }) {
  const q = useBarberProfile(slug)
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={q.data?.name ?? "Profil barber"}
      footer={
        <Link
          to={`/b/${slug}`}
          className="flex h-11 items-center justify-center rounded-lg bg-slate-50 px-4 text-sm font-medium text-slate-700"
        >
          Buka profil lengkap
        </Link>
      }
    >
      {q.isLoading || !q.data ? (
        <PageSkeleton rows={3} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={q.data.name} src={q.data.photoUrl} className="size-16 rounded-lg" />
            <div>
              <p className="text-sm text-slate-600">{q.data.specialties.join(", ")}</p>
              <RatingInline rating={q.data.rating} count={q.data.reviewCount} />
            </div>
          </div>
          {q.data.bio && <p className="text-sm text-slate-800">{q.data.bio}</p>}
          <ul className="divide-y text-sm">
            {q.data.prices.map((p) => (
              <li key={p.serviceId} className="flex justify-between gap-3 py-2">
                <span className="text-slate-800">{p.name}</span>
                <MoneyText value={p.price} className="tabular-nums font-medium text-slate-900" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  )
}

export default function StepBarber() {
  usePageMeta("Pilih barber")
  const { w, c, eligible, ready } = useCart()
  const navigate = useNavigate()
  const next = useNextAvailable(w.serviceIds, w.gender)
  const [preview, setPreview] = useState<string | null>(null)
  if (!ready || !c) return <PageSkeleton />

  const quotes = eligible.map((b) => ({
    barberId: b.id,
    ...quoteForBarber(w.serviceIds, c.services, c.overrides, b.id),
  }))
  const cheapest = cheapestBarberIds(quotes)
  const best = bestRatedId(
    eligible.map((b) => ({
      id: b.id,
      rating: b.rating,
      reviewCount: b.reviewCount,
      lastReviewAt: b.lastReviewAt ?? "",
      badgeHidden: b.badgeHidden,
    })),
  )
  const choose = (b: PublicBarber) => w.patch({ barberId: b.id, date: null, time: null })

  return (
    <WizardFrame
      step={3}
      title="Pilih barber"
      canNext={Boolean(w.barberId && eligible.some((b) => b.id === w.barberId))}
      onNext={() => navigate("/booking/jadwal")}
    >
      {w.fromProfile && w.barberId && (
        <p className="text-sm text-slate-600">
          Barber dari profil yang Anda buka sudah dipilih. Anda bisa menggantinya.
        </p>
      )}
      {eligible.length === 0 ? (
        <EmptyState
          title="Belum ada barber untuk pilihan ini."
          description="Ubah gender atau layanan, atau hubungi toko."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {quotes.map((q) => {
            const b = eligible.find((x) => x.id === q.barberId)!
            const selected = w.barberId === b.id
            const at = next.data
              ? (next.data.find((n) => n.barberId === b.id)?.at ?? null)
              : next.isError
                ? null
                : undefined
            return (
              <li key={b.id}>
                <Card className={cn(selected && "bg-primary-100")}>
                  <CardContent className="flex flex-col gap-3 p-4">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => choose(b)}
                      className="flex items-start gap-3 text-left"
                    >
                      <Avatar name={b.name} src={b.photoUrl} className="size-16 rounded-lg" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-slate-900">{b.name}</span>
                          {cheapest.includes(b.id) && <Badge tone="info">Paling hemat</Badge>}
                          {b.id === best && <BestRatedBadge />}
                        </span>
                        <span className="block text-sm text-slate-600">
                          {b.specialties.join(", ")}
                        </span>
                        <RatingInline rating={b.rating} count={b.reviewCount} />
                        <span className="mt-1 block text-sm text-slate-800">
                          {nearestLabel(at)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <MoneyText
                          value={q.total}
                          className="block text-base font-semibold tabular-nums text-slate-900"
                        />
                        <span className="block text-xs text-slate-600">
                          {q.estimate ? "estimasi, " : ""}
                          {formatDuration(q.duration)}
                        </span>
                        {selected && (
                          <span className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-primary-800">
                            <Check className="size-3.5" aria-hidden />
                            Dipilih
                          </span>
                        )}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-start"
                      onClick={() => setPreview(b.slug)}
                    >
                      Lihat profil
                    </Button>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
      {preview && <ProfilePreview slug={preview} onClose={() => setPreview(null)} />}
    </WizardFrame>
  )
}
