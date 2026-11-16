import { ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import {
  Async,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  Field,
  PageSkeleton,
  StarInput,
  Textarea,
} from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { REVIEW_MAX_LENGTH } from "@/shared/constants"
import { usePageMeta } from "@/shared/hooks"
import { ApiError } from "@/shared/api"
import { formatDayLong } from "@/shared/utils/format"
import { useShopInfo } from "@/features/shop-info"
import { useRemoveReview, useReviewTarget, useSaveReview } from "../hooks"
import { validateReview } from "../domain/rules"
import type { ReviewTarget } from "../types"

function Form({ t }: { t: ReviewTarget }) {
  const navigate = useNavigate()
  const shop = useShopInfo()
  const save = useSaveReview()
  const remove = useRemoveReview()
  const [stars, setStars] = useState(t.existing?.stars ?? 0)
  const [comment, setComment] = useState(t.existing?.comment ?? "")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const editing = Boolean(t.existing)

  if (done)
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <h1 className="text-title font-semibold text-slate-900">Terima kasih atas ulasan Anda</h1>
          <p className="text-sm text-slate-700">
            Ulasan Anda sudah tampil di profil {t.barberName}.
          </p>
          {shop.data?.mapsUrl && (
            <a
              href={shop.data.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "secondary" })}
            >
              <ExternalLink className="size-4" aria-hidden />
              Ulas toko di Google Maps
            </a>
          )}
          <Link to="/ulasan-saya" className={buttonVariants({ variant: "ghost" })}>
            Lihat ulasan saya
          </Link>
        </CardContent>
      </Card>
    )

  const submit = () => {
    const msg = validateReview(stars, comment)
    if (msg) return setError(msg)
    setError(null)
    save.mutate(
      { bookingId: t.bookingId, stars, comment: comment.trim() },
      { onSuccess: () => setDone(true), onError: (e) => setError(ApiError.from(e).message) },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-title font-semibold text-slate-900">
          {editing ? "Ubah ulasan" : "Tulis ulasan"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {t.barberName} · {formatDayLong(t.visitAt)} · {t.servicesSummary}
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-700">Penilaian</p>
            <StarInput value={stars} onChange={setStars} label="Penilaian untuk barber" />
          </div>
          <Field
            label="Komentar"
            hint={`${comment.length} dari ${REVIEW_MAX_LENGTH} karakter`}
            error={error ?? undefined}
          >
            <Textarea
              value={comment}
              maxLength={REVIEW_MAX_LENGTH}
              onChange={(e) => setComment(e.target.value)}
            />
          </Field>
          <Button loading={save.isPending} onClick={submit}>
            {editing ? "Simpan perubahan" : "Kirim ulasan"}
          </Button>
          {editing && (
            <Button variant="ghost" className="text-danger-700" onClick={() => setConfirm(true)}>
              Hapus ulasan
            </Button>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Hapus ulasan ini?"
        description="Rating barber dihitung ulang dan langsung terlihat di profilnya."
        confirmLabel="Hapus"
        variant="danger"
        loading={remove.isPending}
        onConfirm={() =>
          t.existing &&
          remove.mutate(t.existing.id, {
            onSuccess: () => navigate("/ulasan-saya", { replace: true }),
          })
        }
      />
    </div>
  )
}

export function ReviewFormView() {
  usePageMeta("Ulasan")
  const { bookingId = "" } = useParams()
  const q = useReviewTarget(bookingId)
  const navigate = useNavigate()
  const forbidden =
    q.isError &&
    ApiError.is(q.error) &&
    (q.error.code === "FORBIDDEN" || q.error.code === "NOT_FOUND")
  useEffect(() => {
    if (forbidden) navigate("/booking-saya", { replace: true })
  }, [forbidden, navigate])
  return (
    <Async query={q} skeleton={<PageSkeleton rows={4} />}>
      {(t) => <Form t={t} />}
    </Async>
  )
}
