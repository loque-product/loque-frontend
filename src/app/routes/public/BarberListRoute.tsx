import { useState } from "react"
import { Async, Button, EmptyState, Input, Skeleton } from "@/shared/components"
import { usePageMeta } from "@/shared/hooks"
import { cn } from "@/shared/utils/cn"
import { allSpecialties, BarberRow, filterBarbers, useBarberList } from "@/features/barbers"
import { bestRatedId } from "@/features/reviews"

export default function BarberListRoute() {
  usePageMeta("Barber", "Pilih barber, lihat harga, galeri, dan ulasan.")
  const q = useBarberList()
  const [query, setQuery] = useState("")
  const [specialty, setSpecialty] = useState<string | null>(null)
  const reset = () => {
    setQuery("")
    setSpecialty(null)
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title font-semibold text-slate-900">Barber</h1>
      <Async query={q} skeleton={<Skeleton className="h-64 w-full" />}>
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
          const rows = filterBarbers(barbers, query, specialty)
          return (
            <>
              <Input
                type="search"
                aria-label="Cari nama barber"
                placeholder="Cari nama barber"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter spesialisasi">
                {allSpecialties(barbers).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={specialty === s}
                    onClick={() => setSpecialty(specialty === s ? null : s)}
                    className={cn(
                      "flex min-h-11 items-center rounded-full px-4 text-sm font-medium",
                      specialty === s
                        ? "bg-primary-700 text-white"
                        : "bg-white text-slate-700 shadow-card hover:bg-slate-100",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {rows.length === 0 ? (
                <EmptyState
                  title="Tidak ada barber yang cocok."
                  action={
                    <Button variant="secondary" onClick={reset}>
                      Hapus filter
                    </Button>
                  }
                />
              ) : (
                <ul className="divide-y rounded-xl bg-white px-2 shadow-card">
                  {rows.map((b) => (
                    <BarberRow key={b.id} barber={b} best={b.id === best} to={`/b/${b.slug}`} />
                  ))}
                </ul>
              )}
            </>
          )
        }}
      </Async>
    </div>
  )
}
