import { ImagePlus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ApiError } from "@/shared/api"
import { Banner, Button, Checkbox, Field, Input, Sheet } from "@/shared/components"
import { ImageError, type CompressedImage } from "@/shared/lib/image-compress"
import { canSubmitUpload, CAPTION_MAX } from "../domain/limits"
import { useAddPhoto } from "../hooks"
import { prepareImage, uploadCompressed } from "../hooks/upload"

const TIP_KEY = "loque-portfolio-tip-seen"
const tipSeen = () => {
  try {
    return localStorage.getItem(TIP_KEY) === "1"
  } catch {
    return true
  }
}
const markTipSeen = () => {
  try {
    localStorage.setItem(TIP_KEY, "1")
  } catch {
    /* abaikan */
  }
}

export const CONSENT_TEXT =
  "Pelanggan (atau orang tua/wali jika di bawah 18 tahun) setuju fotonya ditampilkan di Loque"

/** Alur unggah: pilih foto, pratinjau, keterangan, persetujuan wajib, lalu unggah. */
export function UploadPhotoSheet({
  open,
  onOpenChange,
  count,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  count: number
}) {
  const add = useAddPhoto()
  const input = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<CompressedImage | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState("")
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTip, setShowTip] = useState(false)

  useEffect(() => {
    if (!open) return
    setImage(null)
    setPreview(null)
    setCaption("")
    setConsent(false)
    setError(null)
    setShowTip(!tipSeen())
    markTipSeen()
  }, [open])
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview])

  const pick = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setProcessing(true)
    try {
      const out = await prepareImage(file)
      setImage(out)
      setPreview(URL.createObjectURL(out.blob))
    } catch (e) {
      setImage(null)
      setPreview(null)
      setError(e instanceof ImageError ? e.message : "Foto tidak bisa diproses. Coba foto lain.")
    } finally {
      setProcessing(false)
    }
  }

  const submit = async () => {
    if (!image) return
    setError(null)
    setUploading(true)
    try {
      const objectKey = await uploadCompressed("portfolio", image)
      await add.mutateAsync({
        objectKey,
        caption: caption.trim(),
        width: image.width,
        height: image.height,
        consent: true,
      })
      onOpenChange(false)
    } catch (e) {
      setError(ApiError.from(e).message)
    } finally {
      setUploading(false)
    }
  }

  const ready = image !== null
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Unggah foto"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={uploading}>
            Batalkan
          </Button>
          <Button
            onClick={() => void submit()}
            loading={uploading}
            disabled={!canSubmitUpload({ ready, consent, count, busy: uploading || processing })}
          >
            Unggah
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {showTip && <Banner>Foto terbaik berfokus pada rambut dan hasil potongan.</Banner>}
        {error && <Banner tone="danger">{error}</Banner>}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Pilih foto"
          tabIndex={-1}
          onChange={(e) => void pick(e.target.files?.[0])}
        />
        {preview ? (
          <img
            loading="lazy"
            decoding="async"
            src={preview}
            alt="Pratinjau foto"
            className="max-h-80 w-full rounded-lg bg-slate-100 object-contain"
          />
        ) : (
          <p className="text-sm text-slate-600">
            {processing ? "Memproses foto" : "Belum ada foto dipilih."}
          </p>
        )}
        <Button
          variant="secondary"
          className="self-start"
          loading={processing}
          onClick={() => input.current?.click()}
        >
          <ImagePlus className="size-4" aria-hidden />
          {preview ? "Pilih foto lain" : "Pilih foto"}
        </Button>
        <Field
          label="Keterangan (opsional)"
          hint={`${caption.length} dari ${CAPTION_MAX} karakter`}
        >
          <Input
            value={caption}
            maxLength={CAPTION_MAX}
            onChange={(e) => setCaption(e.target.value)}
          />
        </Field>
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          label={CONSENT_TEXT}
        />
      </div>
    </Sheet>
  )
}
