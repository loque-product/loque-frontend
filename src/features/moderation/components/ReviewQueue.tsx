import type { ColumnDef } from "@tanstack/react-table"
import { Star } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Async,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  DataTable,
  DateTimeText,
  ReasonDialog,
  Sheet,
  SlaBadge,
  Skeleton,
} from "@/shared/components"
import { useNow } from "@/shared/hooks"
import type { ReviewReport } from "@/shared/types"
import { formatDateTime } from "@/shared/utils/format"
import { bestRated, formatRemaining, reviewSla } from "../domain/sla"
import { useBarbersByShop, useDecideReview, useHideBadge, useReviewReports } from "../hooks"
import { REVIEW_DECISION_LABEL, type ReviewDecision } from "../types"

function Stars({ n }: { n: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${n} dari 5 bintang`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < n ? "fill-warning-600 text-warning-600" : "text-slate-300"}`}
          aria-hidden
        />
      ))}
    </span>
  )
}

export function ReviewQueue() {
  const q = useReviewReports()
  const now = useNow(60000)
  const [selected, setSelected] = useState<string | null>(null)
  const columns = useMemo<ColumnDef<ReviewReport, unknown>[]>(
    () => [
      {
        header: "Ulasan",
        cell: ({ row }) => (
          <span className="flex flex-col gap-1">
            <Stars n={row.original.stars} />
            <span className="line-clamp-2 max-w-md text-sm">{row.original.comment}</span>
          </span>
        ),
      },
      { header: "Barber pelapor", cell: ({ row }) => row.original.barberName },
      {
        header: "Alasan laporan",
        cell: ({ row }) => <span className="line-clamp-2">{row.original.reportReason}</span>,
      },
      {
        header: "Tanggal",
        cell: ({ row }) => <DateTimeText value={row.original.reportedAt} mode="date" />,
      },
      {
        header: "Sisa waktu",
        cell: ({ row }) => {
          if (row.original.decision)
            return <Badge tone="primary">{REVIEW_DECISION_LABEL[row.original.decision]}</Badge>
          const s = reviewSla(row.original.reportedAt, now)
          return (
            <span className="flex flex-col items-end gap-1 md:items-start">
              <span className="text-xs text-slate-600">
                {formatRemaining(s.remainingMs)} (7 hari)
              </span>
              <SlaBadge level={s.level} />
            </span>
          )
        },
      },
    ],
    [now],
  )
  const current = q.data?.find((r) => r.id === selected)
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <DataTable
          columns={columns}
          query={q}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSelected(r.id)}
          searchText={(r) => `${r.barberName} ${r.comment}`}
          searchPlaceholder="Cari barber atau ulasan"
          emptyTitle="Tidak ada laporan ulasan."
        />
      </section>
      <BestRated />
      <Sheet
        open={Boolean(current)}
        onOpenChange={(o) => !o && setSelected(null)}
        title="Laporan ulasan"
        description={current ? `Dilaporkan oleh ${current.barberName}` : undefined}
      >
        {current && <Detail r={current} now={now} />}
      </Sheet>
    </div>
  )
}

function Detail({ r, now }: { r: ReviewReport; now: number }) {
  const decide = useDecideReview()
  const [pending, setPending] = useState<ReviewDecision | null>(null)
  const [err, setErr] = useState<string | undefined>()
  const s = reviewSla(r.reportedAt, now)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {r.decision ? (
          <Badge tone="primary">{REVIEW_DECISION_LABEL[r.decision]}</Badge>
        ) : (
          <>
            <Badge tone="warning">Dilaporkan</Badge>
            <SlaBadge level={s.level} />
          </>
        )}
      </div>
      <Card>
        <CardContent className="flex flex-col gap-2">
          <Stars n={r.stars} />
          <p className="text-sm">{r.comment}</p>
          <p className="text-xs text-slate-600">{r.reviewerName}</p>
        </CardContent>
      </Card>
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-600">Kunjungan terkait</dt>
          <dd className="font-medium">
            {formatDateTime(r.visitDate)} WIB - {r.visitServices}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Booking benar-benar selesai</dt>
          <dd className="font-medium">
            {r.visitCompleted ? "Ya" : "Tidak, tidak ada kunjungan selesai"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Alasan barber</dt>
          <dd className="font-medium">{r.reportReason}</dd>
        </div>
        {r.decisionReason && (
          <div>
            <dt className="text-xs text-slate-600">Alasan keputusan</dt>
            <dd className="font-medium">{r.decisionReason}</dd>
          </div>
        )}
      </dl>
      <Banner tone="info" title="Kriteria penghapusan">
        <ul className="list-disc pl-5">
          <li>Bukan kunjungan nyata</li>
          <li>Kasar atau diskriminatif</li>
          <li>Memuat data pribadi</li>
          <li>Jelas tentang toko lain</li>
        </ul>
        <p className="mt-2 font-semibold">Ulasan tidak dihapus hanya karena negatif.</p>
      </Banner>
      {!r.decision && (
        <div className="flex flex-col gap-2">
          <Button
            variant="danger"
            onClick={() => {
              setErr(undefined)
              setPending("deleted")
            }}
          >
            Hapus ulasan
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setErr(undefined)
              setPending("kept")
            }}
          >
            Pertahankan
          </Button>
        </div>
      )}
      <ReasonDialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
        title={pending === "deleted" ? "Hapus ulasan" : "Pertahankan ulasan"}
        description="Alasan wajib. Barber melihat status dan alasannya, dan keputusan tercatat di audit."
        confirmLabel="Simpan keputusan"
        variant={pending === "deleted" ? "danger" : "primary"}
        loading={decide.isPending}
        serverError={err}
        onSubmit={(reason) =>
          pending &&
          decide.mutate(
            { id: r.id, decision: pending, reason },
            {
              onSuccess: () => setPending(null),
              onError: (e) => setErr(e.message),
            },
          )
        }
      />
    </div>
  )
}

function BestRated() {
  const q = useBarbersByShop()
  const hide = useHideBadge()
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null)
  const [err, setErr] = useState<string | undefined>()
  return (
    <section aria-labelledby="best" className="flex flex-col gap-3">
      <h2 id="best" className="text-section font-semibold">
        Best Rated
      </h2>
      <p className="text-sm text-slate-600">
        Otomatis: barber dengan rata-rata rating tertinggi di tiap toko, minimal 5 ulasan. Seri
        diputus ulasan terbanyak, lalu ulasan terbaru. Satu lencana per toko.
      </p>
      <Async query={q} skeleton={<Skeleton className="h-48" />}>
        {(groups) => (
          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map((g) => (
              <Card key={g.shopId}>
                <CardHeader>
                  <h3 className="font-semibold">{g.shopName}</h3>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y">
                    {bestRated(g.barbers).map(({ barber, eligible, badge }) => (
                      <li
                        key={barber.id}
                        className="flex min-h-14 items-center justify-between gap-2 py-2"
                      >
                        <span>
                          <span className="font-medium">{barber.name}</span>
                          <span className="block text-sm text-slate-600">
                            {barber.rating.toFixed(1)} dari {barber.reviewCount} ulasan
                            {!eligible ? " (belum 5 ulasan)" : ""}
                            {barber.badgeHidden ? " - lencana disembunyikan" : ""}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          {badge && <Badge tone="primary">Best Rated</Badge>}
                          {badge && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setErr(undefined)
                                setTarget({ id: barber.id, name: barber.name })
                              }}
                            >
                              Sembunyikan lencana
                            </Button>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Async>
      <ReasonDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        title={`Sembunyikan lencana ${target?.name ?? ""}`}
        description="Gunakan jika ada indikasi manipulasi rating. Alasan tercatat di audit."
        confirmLabel="Sembunyikan lencana"
        variant="warning"
        loading={hide.isPending}
        serverError={err}
        onSubmit={(reason) =>
          target &&
          hide.mutate(
            { barberId: target.id, reason },
            {
              onSuccess: () => setTarget(null),
              onError: (e) => setErr(e.message),
            },
          )
        }
      />
    </section>
  )
}
