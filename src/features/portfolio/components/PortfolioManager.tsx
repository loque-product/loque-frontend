import { ArrowDown, ArrowUp, EyeOff, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  Async,
  Banner,
  Button,
  ConfirmDialog,
  Dialog,
  EmptyState,
  Field,
  ImageWithFallback,
  Input,
  PageSkeleton,
} from "@/shared/components"
import { PORTFOLIO_MAX_PHOTOS } from "@/shared/constants"
import { useOnlineStatus } from "@/shared/hooks"
import { formatDate } from "@/shared/utils/format"
import { canAddMore, CAPTION_MAX, moveId } from "../domain/limits"
import { useMyPortfolio, useRemovePhoto, useReorderPhotos, useUpdateCaption } from "../hooks"
import type { PortfolioPhoto } from "../types"
import { UploadPhotoSheet } from "./UploadPhotoSheet"

function HiddenCard({ p }: { p: PortfolioPhoto }) {
  return (
    <div className="flex aspect-square flex-col justify-center gap-1 rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
      <p className="flex items-center gap-1 font-semibold">
        <EyeOff className="size-3.5" aria-hidden />
        Disembunyikan sampai diperiksa
      </p>
      {p.hiddenReason && <p>Alasan: {p.hiddenReason}</p>}
      {p.hiddenUntil && <p>Diputuskan paling lambat {formatDate(p.hiddenUntil)}</p>}
    </div>
  )
}

function Item({
  p,
  index,
  total,
  onMove,
  onEdit,
  onRemove,
  busy,
}: {
  p: PortfolioPhoto
  index: number
  total: number
  onMove: (d: -1 | 1) => void
  onEdit: () => void
  onRemove: () => void
  busy: boolean
}) {
  return (
    <li className="rounded-lg bg-white p-1.5 shadow-card">
      {p.hidden ? (
        <HiddenCard p={p} />
      ) : (
        <ImageWithFallback
          src={p.url}
          alt={p.caption || `Foto ${index + 1}`}
          ratio={p.width / p.height}
          className="w-full rounded-md"
        />
      )}
      <p className="mt-1.5 line-clamp-2 min-h-8 text-xs text-slate-700">
        {p.caption || "Tanpa keterangan"}
      </p>
      <div className="flex items-center justify-between">
        <span className="flex">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Pindahkan foto ${index + 1} ke atas`}
            disabled={busy || index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUp className="size-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Pindahkan foto ${index + 1} ke bawah`}
            disabled={busy || index === total - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDown className="size-4" aria-hidden />
          </Button>
        </span>
        <span className="flex">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Ubah keterangan foto ${index + 1}`}
            onClick={onEdit}
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Hapus foto ${index + 1}`}
            onClick={onRemove}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </span>
      </div>
    </li>
  )
}

/** Portofolio barber: maksimum 9 foto, urutan lewat tombol naik dan turun, keterangan, dan hapus. */
export function PortfolioManager() {
  const q = useMyPortfolio()
  const online = useOnlineStatus()
  const reorder = useReorderPhotos()
  const update = useUpdateCaption()
  const remove = useRemovePhoto()
  const [upload, setUpload] = useState(false)
  const [editing, setEditing] = useState<PortfolioPhoto | null>(null)
  const [caption, setCaption] = useState("")
  const [removing, setRemoving] = useState<PortfolioPhoto | null>(null)
  const [announce, setAnnounce] = useState("")

  return (
    <section aria-labelledby="portfolio-h" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="portfolio-h" className="text-section font-semibold text-slate-900">
            Portofolio
          </h2>
          <p className="text-xs tabular-nums text-slate-600">
            {q.data?.length ?? 0} dari {PORTFOLIO_MAX_PHOTOS} foto
          </p>
        </div>
        <Button
          size="sm"
          disabled={!online || !canAddMore(q.data?.length ?? 0) || q.data === undefined}
          onClick={() => setUpload(true)}
        >
          <Plus className="size-4" aria-hidden />
          Unggah foto
        </Button>
      </div>
      {q.data && !canAddMore(q.data.length) && (
        <Banner>
          Portofolio sudah berisi {PORTFOLIO_MAX_PHOTOS} foto. Hapus satu foto untuk menambah yang
          baru.
        </Banner>
      )}
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
      <Async
        query={q}
        skeleton={<PageSkeleton rows={2} />}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            title="Belum ada foto."
            description="Unggah foto hasil potongan agar customer bisa melihatnya."
          />
        }
      >
        {(photos) => (
          <ul className="masonry">
            {photos.map((p, i) => (
              <Item
                key={p.id}
                p={p}
                index={i}
                total={photos.length}
                busy={reorder.isPending || !online}
                onMove={(d) => {
                  const next = moveId(
                    photos.map((x) => x.id),
                    i,
                    d,
                  )
                  if (next)
                    reorder.mutate(next, {
                      onSuccess: () =>
                        setAnnounce(`Foto dipindah ke posisi ${i + d + 1} dari ${photos.length}.`),
                    })
                }}
                onEdit={() => {
                  setEditing(p)
                  setCaption(p.caption)
                }}
                onRemove={() => setRemoving(p)}
              />
            ))}
          </ul>
        )}
      </Async>

      <UploadPhotoSheet open={upload} onOpenChange={setUpload} count={q.data?.length ?? 0} />
      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Ubah keterangan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Batalkan
            </Button>
            <Button
              loading={update.isPending}
              onClick={() =>
                editing &&
                update.mutate(
                  { id: editing.id, caption: caption.trim() },
                  { onSuccess: () => setEditing(null) },
                )
              }
            >
              Simpan
            </Button>
          </>
        }
      >
        <Field label="Keterangan" hint={`${caption.length} dari ${CAPTION_MAX} karakter`}>
          <Input
            value={caption}
            maxLength={CAPTION_MAX}
            onChange={(e) => setCaption(e.target.value)}
          />
        </Field>
      </Dialog>
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Hapus foto ini?"
        description="Foto hilang dari profil Anda dan tidak bisa dipulihkan."
        confirmLabel="Hapus foto"
        variant="danger"
        loading={remove.isPending}
        onConfirm={() =>
          removing && remove.mutate(removing.id, { onSuccess: () => setRemoving(null) })
        }
      />
    </section>
  )
}
