import { Flag } from "lucide-react"
import { useState } from "react"
import { ApiError } from "@/shared/api"
import {
  Async,
  Badge,
  Banner,
  Button,
  EmptyState,
  Field,
  PageSkeleton,
  RadioGroup,
  RadioRow,
  Sheet,
  StarsView,
  Textarea,
} from "@/shared/components"
import { usePageMeta, useOnlineStatus } from "@/shared/hooks"
import { formatDate } from "@/shared/utils/format"
import { useReportReview, useReviewsAboutMe } from "../hooks"
import type {
  BarberReviewItem,
  BarberReviewsData,
  ReviewReportReason,
  ReviewReportStatus,
} from "../types"

export const REPORT_REASONS: { value: ReviewReportReason; label: string }[] = [
  { value: "not_real_visit", label: "Bukan kunjungan nyata" },
  { value: "abusive", label: "Kasar atau diskriminatif" },
  { value: "personal_data", label: "Memuat data pribadi" },
  { value: "other_shop", label: "Tentang toko lain" },
  { value: "other", label: "Lainnya" },
]
const STATUS: Record<
  ReviewReportStatus,
  { label: string; tone: "warning" | "info" | "danger" | "primary" }
> = {
  reported: { label: "Dilaporkan", tone: "warning" },
  reviewing: { label: "Ditinjau", tone: "info" },
  deleted: { label: "Dihapus", tone: "danger" },
  kept: { label: "Dipertahankan", tone: "primary" },
}
const reasonLabel = (r: ReviewReportReason) => REPORT_REASONS.find((x) => x.value === r)?.label ?? r

function ReportSheet({ review, onClose }: { review: BarberReviewItem; onClose: () => void }) {
  const report = useReportReview()
  const [reason, setReason] = useState<ReviewReportReason | "">("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const submit = () => {
    if (!reason) return setError("Pilih alasan laporan.")
    setError(null)
    report.mutate(
      { reviewId: review.id, reason, note: note.trim() },
      { onSuccess: onClose, onError: (e) => setError(ApiError.from(e).message) },
    )
  }
  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      title="Laporkan ulasan"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batalkan
          </Button>
          <Button loading={report.isPending} onClick={submit}>
            Kirim laporan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Banner>
          Ulasan hanya dihapus jika melanggar kriteria. Ulasan tidak dihapus hanya karena negatif.
        </Banner>
        {error && <Banner tone="danger">{error}</Banner>}
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-slate-700">Alasan</legend>
          <RadioGroup
            value={reason}
            onValueChange={(v) => setReason(v as ReviewReportReason)}
            className="divide-y"
          >
            {REPORT_REASONS.map((r) => (
              <RadioRow key={r.value} value={r.value} label={r.label} />
            ))}
          </RadioGroup>
        </fieldset>
        <Field label="Keterangan" hint="Jelaskan singkat agar Super Admin bisa memeriksa.">
          <Textarea value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
    </Sheet>
  )
}

function Distribution({ d }: { d: BarberReviewsData }) {
  return (
    <ul aria-label="Sebaran bintang" className="flex flex-1 flex-col gap-1">
      {[5, 4, 3, 2, 1].map((s) => (
        <li key={s} className="flex items-center gap-2 text-xs text-slate-700">
          <span className="w-12 tabular-nums">{s} bintang</span>
          <span className="h-1.5 flex-1 rounded-full bg-slate-100">
            <span
              className="block h-full rounded-full bg-star"
              style={{ width: `${d.count ? (d.distribution[s - 1] / d.count) * 100 : 0}%` }}
            />
          </span>
          <span className="w-6 text-right tabular-nums">{d.distribution[s - 1]}</span>
        </li>
      ))}
    </ul>
  )
}

function Item({ r, onReport }: { r: BarberReviewItem; onReport: () => void }) {
  const online = useOnlineStatus()
  return (
    <li className="flex flex-col gap-1 py-3">
      <div className="flex items-center justify-between gap-2">
        <StarsView value={r.stars} />
        <span className="text-xs text-slate-600">
          {formatDate(r.createdAt)}
          {r.edited ? " · Diedit" : ""}
        </span>
      </div>
      {r.comment && <p className="text-sm text-slate-800">{r.comment}</p>}
      <p className="text-xs text-slate-600">{r.authorName}</p>
      {r.report ? (
        <div className="mt-1 flex flex-col gap-1 text-xs text-slate-700">
          <p className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS[r.report.status].tone}>{STATUS[r.report.status].label}</Badge>
            <span>Alasan laporan: {reasonLabel(r.report.reason)}</span>
          </p>
          {r.report.decisionReason && <p>Keputusan Super Admin: {r.report.decisionReason}</p>}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-slate-700"
          disabled={!online}
          onClick={onReport}
        >
          <Flag className="size-3.5" aria-hidden />
          Laporkan ulasan
        </Button>
      )}
    </li>
  )
}

export function BarberReviewsView() {
  usePageMeta("Ulasan")
  const q = useReviewsAboutMe()
  const [target, setTarget] = useState<BarberReviewItem | null>(null)
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title font-semibold text-slate-900">Ulasan</h1>
      <Async query={q} skeleton={<PageSkeleton rows={4} />}>
        {(d) => (
          <>
            <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-card">
              <div className="shrink-0 text-center">
                <p className="text-title font-semibold tabular-nums text-slate-900">
                  {d.count ? d.average.toFixed(1).replace(".", ",") : "-"}
                </p>
                <p className="text-xs text-slate-600">{d.count} ulasan</p>
              </div>
              <Distribution d={d} />
            </div>
            {d.reviews.length === 0 ? (
              <EmptyState
                title="Belum ada ulasan."
                description="Ulasan muncul setelah customer menyelesaikan booking dengan Anda."
              />
            ) : (
              <ul className="divide-y rounded-xl bg-white px-4 shadow-card">
                {d.reviews.map((r) => (
                  <Item key={r.id} r={r} onReport={() => setTarget(r)} />
                ))}
              </ul>
            )}
          </>
        )}
      </Async>
      {target && <ReportSheet review={target} onClose={() => setTarget(null)} />}
    </div>
  )
}
