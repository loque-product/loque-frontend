import { Flag } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { ApiError } from "@/shared/api"
import {
  Banner,
  Button,
  Field,
  Input,
  RadioGroup,
  RadioRow,
  Sheet,
  Textarea,
  TurnstileWidget,
} from "@/shared/components"
import type { ModerationReason } from "@/shared/types"
import { useReportPhoto } from "../hooks"
import { hidesImmediately, needsCaptcha, REPORT_REASON_LABEL } from "../domain/report"

const COUNT_KEY = "loque-photo-reports"
const readCount = () => {
  try {
    return Number(sessionStorage.getItem(COUNT_KEY) ?? "0") || 0
  } catch {
    return 0
  }
}
const bumpCount = () => {
  try {
    sessionStorage.setItem(COUNT_KEY, String(readCount() + 1))
  } catch {
    /* abaikan */
  }
}

const REASONS: ModerationReason[] = ["me_in_photo", "my_child", "other"]

/** Tombol dan sheet "Laporkan foto"; tanpa login. */
export function ReportPhotoButton({ photoId }: { photoId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-slate-600">
        <Flag className="size-3.5" aria-hidden />
        Laporkan foto
      </Button>
      {open && <ReportSheet photoId={photoId} onClose={() => setOpen(false)} />}
    </>
  )
}

function ReportSheet({ photoId, onClose }: { photoId: string; onClose: () => void }) {
  const report = useReportPhoto()
  const [reason, setReason] = useState<ModerationReason>("me_in_photo")
  const [note, setNote] = useState("")
  const [contact, setContact] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [forceCaptcha, setForceCaptcha] = useState(false)
  const captcha = forceCaptcha || needsCaptcha(readCount())
  const onToken = useCallback((t: string | null) => setToken(t), [])

  const submit = () => {
    setError(null)
    report.mutate(
      {
        photoId,
        reason,
        note: note.trim(),
        contact: contact.trim() || undefined,
        captchaToken: token ?? undefined,
      },
      {
        onSuccess: (r) => {
          bumpCount()
          toast.success("Terima kasih. Laporan Anda kami periksa.")
          if (r.hidden || hidesImmediately(reason))
            toast.info("Foto disembunyikan sampai diperiksa.")
          onClose()
        },
        onError: (e) => {
          const err = ApiError.from(e)
          if (err.code === "CAPTCHA_REQUIRED") setForceCaptcha(true)
          setError(err.message)
        },
      },
    )
  }

  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      title="Laporkan foto"
      description="Foto yang menampilkan Anda atau anak Anda disembunyikan seketika sampai diperiksa."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={report.isPending}>
            Batalkan
          </Button>
          <Button loading={report.isPending} disabled={captcha && !token} onClick={submit}>
            Kirim laporan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Banner tone="danger">{error}</Banner>}
        <RadioGroup
          value={reason}
          onValueChange={(v) => setReason(v as ModerationReason)}
          aria-label="Alasan laporan"
          className="divide-y"
        >
          {REASONS.map((r) => (
            <RadioRow key={r} value={r} label={REPORT_REASON_LABEL[r]} />
          ))}
        </RadioGroup>
        <Field label="Keterangan" hint="Jelaskan singkat agar toko bisa memeriksa.">
          <Textarea value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Field
          label="Kontak (opsional)"
          hint="Nomor WhatsApp atau email bila Anda ingin dihubungi."
        >
          <Input value={contact} onChange={(e) => setContact(e.target.value)} />
        </Field>
        {captcha && <TurnstileWidget onToken={onToken} />}
      </div>
    </Sheet>
  )
}
