import { useState } from "react"
import { Badge, Banner, Button, Dialog, Field, Textarea } from "@/shared/components"
import type { Bill, VoidRequestPublic } from "@/shared/types"
import { formatDateTime, formatRupiah } from "@/shared/utils/format"
import { isAboveThreshold } from "../domain/void"
import { useRequestVoid, useSubmitVoidCode } from "../hooks"
import { CodeInput } from "./CodeInput"

interface Props {
  bill: Bill | null
  voidRequest: VoidRequestPublic | null
  threshold: number
  canRequest: boolean
}

/** Status void dan aksinya di sisi kasir. Kode persetujuan tidak pernah tampil di sini. */
export function VoidPanel({ bill, voidRequest, threshold, canRequest }: Props) {
  const [requestOpen, setRequestOpen] = useState(false)
  const [codeOpen, setCodeOpen] = useState(false)
  if (!bill || (bill.status !== "completed" && bill.status !== "voided")) return null
  const status = voidRequest?.status
  const above = isAboveThreshold(bill.total, threshold)
  const canReapply =
    !voidRequest || status === "rejected" || status === "expired" || status === "locked"

  return (
    <div className="flex flex-col gap-3">
      {above && bill.status === "completed" && (
        <div>
          <Badge tone="warning">Di atas {formatRupiah(threshold)}</Badge>
        </div>
      )}
      {status === "pending" && voidRequest && (
        <Banner
          tone="warning"
          title="Menunggu persetujuan Owner"
          action={
            <Button size="sm" variant="warning" onClick={() => setCodeOpen(true)}>
              Masukkan kode
            </Button>
          }
        >
          Minta kode persetujuan dari Owner di luar aplikasi. Kode berlaku sampai{" "}
          {formatDateTime(voidRequest.expiresAt)} WIB. Alasan: {voidRequest.reason}
        </Banner>
      )}
      {status === "approved" && (
        <Banner tone="success" title="Void disetujui">
          Tagihan ini dibatalkan. Biaya Loque untuk transaksi ini dibatalkan.
        </Banner>
      )}
      {status === "rejected" && (
        <Banner tone="danger" title="Void ditolak">
          Catatan Owner: {voidRequest?.note}
        </Banner>
      )}
      {status === "locked" && (
        <Banner tone="danger" title="Permintaan terkunci">
          Kode salah 5 kali. Ajukan void ulang.
        </Banner>
      )}
      {status === "expired" && (
        <Banner tone="info" title="Permintaan kedaluwarsa">
          Kode tidak dipakai dalam 24 jam. Ajukan void ulang jika masih diperlukan.
        </Banner>
      )}
      {bill.status === "completed" && canRequest && canReapply && (
        <div>
          <Button variant="secondary" onClick={() => setRequestOpen(true)}>
            Ajukan void
          </Button>
        </div>
      )}
      <RequestVoidDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        billId={bill.id}
        amount={bill.total}
        above={above}
        threshold={threshold}
      />
      {voidRequest && (
        <EnterCodeDialog open={codeOpen} onOpenChange={setCodeOpen} voidId={voidRequest.id} />
      )}
    </div>
  )
}

function RequestVoidDialog({
  open,
  onOpenChange,
  billId,
  amount,
  above,
  threshold,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  billId: string
  amount: number
  above: boolean
  threshold: number
}) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | undefined>()
  const req = useRequestVoid()
  const submit = () => {
    if (!reason.trim()) return setError("Alasan wajib diisi.")
    setError(undefined)
    req.mutate(
      { billId, reason },
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
      title="Ajukan void"
      description={`Tagihan ${formatRupiah(amount)} akan menunggu persetujuan Owner.`}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button variant="warning" onClick={submit} loading={req.isPending}>
            Ajukan void
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {above && (
          <Banner tone="warning">
            Nominal di atas {formatRupiah(threshold)}. Permintaan akan diberi tanda khusus.
          </Banner>
        )}
        <Field label="Alasan" required error={error}>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: layanan salah dicatat"
          />
        </Field>
      </div>
    </Dialog>
  )
}

function EnterCodeDialog({
  open,
  onOpenChange,
  voidId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  voidId: string
}) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | undefined>()
  const submit = useSubmitVoidCode()
  const run = () => {
    if (code.length !== 6) return setError("Masukkan 6 digit kode.")
    setError(undefined)
    submit.mutate(
      { voidId, code },
      {
        onSuccess: () => {
          setCode("")
          onOpenChange(false)
        },
        onError: (e) => {
          setError(e.message)
          setCode("")
          if ((e.details as { locked?: boolean } | undefined)?.locked || e.code === "CONFLICT")
            onOpenChange(false)
        },
      },
    )
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          setCode("")
          setError(undefined)
        }
      }}
      title="Masukkan kode"
      description="Kode 6 digit diberikan Owner di luar aplikasi."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button onClick={run} loading={submit.isPending}>
            Berlakukan void
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <CodeInput
          value={code}
          onChange={setCode}
          invalid={Boolean(error)}
          disabled={submit.isPending}
        />
        {error && (
          <p role="alert" className="text-center text-sm text-danger-700">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  )
}
