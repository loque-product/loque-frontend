import { ChevronLeft, ChevronRight, EyeOff, X } from "lucide-react"
import { Dialog as RDialog } from "radix-ui"
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ImageWithFallback } from "./ImageWithFallback"

export interface PhotoItem {
  id: string
  url: string
  alt: string
  width: number
  height: number
  hidden: boolean
}

/** Galeri masonry dengan penampil layar penuh (geser, panah, Esc menutup). */
export function PhotoGrid({
  photos,
  renderAction,
}: {
  photos: PhotoItem[]
  renderAction?: (photo: PhotoItem) => ReactNode
}) {
  const [open, setOpen] = useState<number | null>(null)
  const visible = photos
  return (
    <>
      <ul className="masonry">
        {visible.map((p, i) => (
          <li key={p.id} className="relative">
            {p.hidden ? (
              <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg bg-slate-100 p-3 text-center text-xs text-slate-600">
                <EyeOff className="size-4" aria-hidden />
                Foto disembunyikan sampai diperiksa
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="block w-full overflow-hidden rounded-lg"
                aria-label={`Buka foto: ${p.alt}`}
              >
                <ImageWithFallback
                  src={p.url}
                  alt={p.alt}
                  ratio={p.width / p.height}
                  className="w-full"
                />
              </button>
            )}
            {renderAction && !p.hidden && <div className="mt-1">{renderAction(p)}</div>}
          </li>
        ))}
      </ul>
      {open !== null && (
        <Viewer
          photos={visible}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          renderAction={renderAction}
        />
      )}
    </>
  )
}

function Viewer({
  photos,
  index,
  onIndex,
  onClose,
  renderAction,
}: {
  photos: PhotoItem[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
  renderAction?: (p: PhotoItem) => ReactNode
}) {
  const shown = photos.filter((p) => !p.hidden)
  const current = photos[index]
  const pos = shown.findIndex((p) => p.id === current.id)
  const go = useCallback(
    (d: number) => {
      const next = shown[(pos + d + shown.length) % shown.length]
      onIndex(photos.findIndex((p) => p.id === next.id))
    },
    [shown, pos, photos, onIndex],
  )
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", on)
    return () => window.removeEventListener("keydown", on)
  }, [go])
  const startX = useRef<number | null>(null)
  return (
    <RDialog.Root open onOpenChange={(o) => !o && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-slate-900/90" />
        <RDialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col"
          onPointerDown={(e) => (startX.current = e.clientX)}
          onPointerUp={(e) => {
            if (startX.current === null) return
            const dx = e.clientX - startX.current
            startX.current = null
            if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1)
          }}
        >
          <RDialog.Title className="sr-only">{current.alt}</RDialog.Title>
          <div className="flex items-center justify-between p-2 text-white">
            <span className="px-2 text-sm tabular-nums">
              {pos + 1} dari {shown.length}
            </span>
            <RDialog.Close
              aria-label="Tutup"
              className="flex size-11 items-center justify-center rounded-lg hover:bg-white/10"
            >
              <X className="size-6" aria-hidden />
            </RDialog.Close>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
            <img
              loading="lazy"
              decoding="async"
              src={current.url}
              alt={current.alt}
              className="max-h-full max-w-full object-contain"
            />
            {shown.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Foto sebelumnya"
                  onClick={() => go(-1)}
                  className="absolute left-2 flex size-11 items-center justify-center rounded-full bg-white/90 text-slate-900"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Foto berikutnya"
                  onClick={() => go(1)}
                  className="absolute right-2 flex size-11 items-center justify-center rounded-full bg-white/90 text-slate-900"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </>
            )}
          </div>
          <div className="flex justify-center p-3">{renderAction?.(current)}</div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}
