import { useState, type ReactNode } from "react"
import { Banner } from "./feedback"
import { Button, type ButtonProps } from "./ui/button"
import { Dialog } from "./ui/dialog"
import { Field, Textarea } from "./ui/form"

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description?: string
  confirmLabel: string
  variant?: ButtonProps["variant"]
  label?: string
  notice?: ReactNode
  loading?: boolean
  /** Mengembalikan pesan galat dari server, jika ada. */
  onSubmit: (reason: string) => void
  serverError?: string
}

/** Dialog dengan alasan wajib. Semua keputusan moderasi memakainya. */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  variant = "primary",
  label = "Alasan",
  notice,
  loading,
  onSubmit,
  serverError,
}: Props) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | undefined>()
  const submit = () => {
    if (!reason.trim()) return setError("Alasan wajib diisi.")
    setError(undefined)
    onSubmit(reason.trim())
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          setReason("")
          setError(undefined)
        }
      }}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button variant={variant} onClick={submit} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {notice}
        {serverError && <Banner tone="danger">{serverError}</Banner>}
        <Field label={label} required error={error}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </div>
    </Dialog>
  )
}
