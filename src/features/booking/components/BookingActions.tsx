import { MessageCircle, Pencil, Receipt, Undo2 } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Link } from "react-router"
import { Banner, Button, ConfirmDialog, Dialog, Field, Textarea } from "@/shared/components"
import { cn } from "@/shared/utils/cn"
import { useCancelByCustomer, useCancelByShop } from "../hooks"

export function CancelCustomerDialog({
  id,
  open,
  onOpenChange,
  unpaid,
}: {
  id: string
  open: boolean
  onOpenChange: (o: boolean) => void
  unpaid?: boolean
}) {
  const [reason, setReason] = useState("")
  const m = useCancelByCustomer()
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={unpaid ? "Batalkan booking" : "Batalkan atas permintaan pelanggan"}
      description={
        unpaid
          ? "Slot dilepas. Pelanggan belum membayar booking fee."
          : "Booking fee hangus karena pelanggan membatalkan."
      }
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Kembali
          </Button>
          <Button
            variant="danger"
            loading={m.isPending}
            onClick={() =>
              m.mutate(
                { id, reason },
                {
                  onSuccess: () => {
                    onOpenChange(false)
                    setReason("")
                  },
                },
              )
            }
          >
            Batalkan booking
          </Button>
        </>
      }
    >
      <Field label="Alasan (opsional)">
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
    </Dialog>
  )
}

export function CancelShopDialog({
  id,
  open,
  onOpenChange,
  hasFee,
}: {
  id: string
  open: boolean
  onOpenChange: (o: boolean) => void
  hasFee: boolean
}) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | undefined>()
  const m = useCancelByShop()
  const submit = () => {
    if (!reason.trim()) return setError("Alasan wajib diisi.")
    setError(undefined)
    m.mutate(
      { id, reason },
      {
        onSuccess: () => {
          onOpenChange(false)
          setReason("")
        },
        onError: (e) => setError(e.fields?.reason ?? e.message),
      },
    )
  }
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Batalkan oleh toko"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Kembali
          </Button>
          <Button variant="danger" loading={m.isPending} onClick={submit}>
            Batalkan oleh toko
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Banner tone="info">
          {hasFee
            ? "Batalkan booking ini? Booking fee akan dikembalikan ke pelanggan dan masuk daftar Perlu di-refund."
            : "Batalkan booking ini? Slot akan dilepas."}
        </Banner>
        <Field label="Alasan" required error={error}>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: barber berhalangan"
          />
        </Field>
      </div>
    </Dialog>
  )
}

export function NoShowConfirm({
  open,
  onOpenChange,
  needsConfirm,
  onConfirm,
  loading,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  needsConfirm: boolean
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tandai tidak hadir"
      description={
        <div className="flex flex-col gap-3">
          {needsConfirm && (
            <Banner tone="warning">
              Belum 15 menit sejak jam mulai. Tetap tandai tidak hadir?
            </Banner>
          )}
          <p>Booking fee hangus. Anda dapat membatalkan penandaan ini kapan saja.</p>
        </div>
      }
      confirmLabel="Tandai tidak hadir"
      variant={needsConfirm ? "warning" : "danger"}
      loading={loading}
      onConfirm={onConfirm}
    />
  )
}

/* ------------------------------------------------------------------ *
 * Susunan aksi tiga tingkat: aksi utama, aksi sekunder, tindakan lain.
 * ------------------------------------------------------------------ */

export interface PrimaryAction {
  label: string
  icon?: ReactNode
  to?: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  /** Keterangan bila tombol dinonaktifkan. */
  hint?: string
}

/** Satu aksi utama: tombol penuh lebar yang berubah menurut status. */
export function PrimaryActionButton({ action }: { action: PrimaryAction }) {
  const content = (
    <>
      {action.icon}
      {action.label}
    </>
  )
  return (
    <div className="flex flex-col gap-1">
      {action.to && !action.disabled ? (
        <Button asChild className="h-12 w-full text-base">
          <Link to={action.to}>{content}</Link>
        </Button>
      ) : (
        <Button
          className="h-12 w-full text-base"
          onClick={action.onClick}
          loading={action.loading}
          disabled={action.disabled}
        >
          {content}
        </Button>
      )}
      {action.disabled && action.hint && <p className="text-xs text-slate-600">{action.hint}</p>}
    </div>
  )
}

/** Aksi sekunder dalam grid dua kolom. Aksi yang tidak berlaku tidak dirender. */
export function SecondaryActions({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}

export const secondaryIcons = {
  edit: <Pencil className="size-4" aria-hidden />,
  bill: <Receipt className="size-4" aria-hidden />,
  wa: <MessageCircle className="size-4" aria-hidden />,
  undo: <Undo2 className="size-4" aria-hidden />,
}

export interface RiskAction {
  label: string
  description: string
  tone: "danger" | "warning"
  onClick: () => void
}

/** Aksi berisiko di bagian bawah, dipisah dan diberi label "Tindakan lain". */
export function RiskActions({
  actions,
  children,
}: {
  actions: RiskAction[]
  children?: ReactNode
}) {
  if (actions.length === 0 && !children) return null
  return (
    <section aria-labelledby="tindakan-lain" className="flex flex-col gap-3 border-t pt-4">
      <h3 id="tindakan-lain" className="text-sm font-semibold text-slate-700">
        Tindakan lain
      </h3>
      <ul className="flex flex-col gap-2">
        {actions.map((a) => (
          <li key={a.label}>
            <button
              type="button"
              onClick={a.onClick}
              className={cn(
                "flex min-h-11 w-full flex-col items-start rounded-lg bg-slate-50 px-3 py-2 text-left",
                a.tone === "danger"
                  ? "text-danger-700 hover:bg-danger-50"
                  : "text-warning-800 hover:bg-warning-50",
              )}
            >
              <span className="text-sm font-medium">{a.label}</span>
              <span className="text-xs text-slate-600">{a.description}</span>
            </button>
          </li>
        ))}
      </ul>
      {children}
    </section>
  )
}
