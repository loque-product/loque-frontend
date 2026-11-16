import { Link } from "react-router"
import { useState } from "react"
import {
  Async,
  Button,
  ConfirmDialog,
  EmptyState,
  PageSkeleton,
  StarsView,
} from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { usePageMeta } from "@/shared/hooks"
import { formatDate } from "@/shared/utils/format"
import { useMyReviews, useRemoveReview } from "../hooks"
import type { MyReview } from "../types"

export function MyReviewsView() {
  usePageMeta("Ulasan saya")
  const q = useMyReviews()
  const remove = useRemoveReview()
  const [target, setTarget] = useState<MyReview | null>(null)
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title font-semibold text-slate-900">Ulasan saya</h1>
      <Async
        query={q}
        skeleton={<PageSkeleton />}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            title="Belum ada ulasan."
            description="Ulasan bisa ditulis setelah booking selesai."
            action={
              <Link to="/booking-saya" className={buttonVariants({ variant: "secondary" })}>
                Lihat booking saya
              </Link>
            }
          />
        }
      >
        {(items) => (
          <ul className="divide-y rounded-xl bg-white px-4 shadow-card">
            {items.map((r) => (
              <li key={r.id} className="flex flex-col gap-1 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{r.barberName}</p>
                  <StarsView value={r.stars} />
                </div>
                <p className="text-xs text-slate-600">
                  Kunjungan {formatDate(r.visitAt)}
                  {r.edited ? " · Diedit" : ""}
                </p>
                {r.comment && <p className="text-sm text-slate-800">{r.comment}</p>}
                <div className="flex gap-2 pt-1">
                  <Link
                    to={`/ulasan/${r.bookingId}`}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    Ubah
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger-700"
                    onClick={() => setTarget(r)}
                  >
                    Hapus
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Async>
      <ConfirmDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        title="Hapus ulasan ini?"
        description="Rating barber dihitung ulang dan langsung terlihat di profilnya."
        confirmLabel="Hapus"
        variant="danger"
        loading={remove.isPending}
        onConfirm={() => target && remove.mutate(target.id, { onSuccess: () => setTarget(null) })}
      />
    </div>
  )
}
