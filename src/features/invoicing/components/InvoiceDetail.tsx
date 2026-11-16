import type { ColumnDef } from "@tanstack/react-table"
import { Download, FileText } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import {
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  DateTimeText,
  Dialog,
  MoneyText,
  Skeleton,
} from "@/shared/components"
import { buildInvoicePdf, downloadBlob } from "@/shared/lib/export"
import type { InvoiceLine } from "@/shared/types"
import { formatDate, formatPeriod, formatRupiah } from "@/shared/utils/format"
import { LOQUE_ISSUER } from "../constants"
import { useRecordInvoiceExport } from "../hooks"
import type { InvoiceView } from "../types"

const statusBadge = (s: InvoiceView["invoice"]["status"]) =>
  s === "paid" ? (
    <Badge tone="primary">Dibayar</Badge>
  ) : s === "unpaid" ? (
    <Badge tone="warning">Belum dibayar</Badge>
  ) : (
    <Badge tone="info">Periode berjalan</Badge>
  )

export function InvoiceStatus({ status }: { status: InvoiceView["invoice"]["status"] }) {
  return statusBadge(status)
}

export function InvoiceDetail({ view, actions }: { view: InvoiceView; actions?: ReactNode }) {
  const { invoice } = view
  const [preview, setPreview] = useState(false)
  const gross = invoice.lines.length * invoice.feePerTransaction
  const creditTotal = invoice.credits.reduce((a, c) => a + c.amount, 0)
  const columns = useMemo<ColumnDef<InvoiceLine, unknown>[]>(
    () => [
      { header: "Tanggal", cell: ({ row }) => formatDate(row.original.date) },
      { header: "Booking atau walk-in", cell: ({ row }) => row.original.label },
      {
        header: "Nominal tagihan",
        meta: { className: "text-right" },
        cell: ({ row }) => <MoneyText value={row.original.amount} />,
      },
      {
        header: "Biaya",
        meta: { className: "text-right" },
        cell: ({ row }) => <MoneyText value={row.original.fee} />,
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-section font-semibold text-slate-900">{invoice.number}</h2>
          <p className="text-sm text-slate-600">
            {view.shopName} - Periode {formatPeriod(invoice.periodStart, invoice.periodEnd)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusBadge(invoice.status)}
          {actions}
          <Button variant="secondary" onClick={() => setPreview(true)}>
            <FileText className="size-4" aria-hidden />
            {view.isOpen ? "Pratinjau invoice" : "Unduh Invoice PDF"}
          </Button>
        </div>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Transaksi ditagih" value={String(invoice.lines.length)} />
        <Stat label="Biaya per transaksi" value={formatRupiah(invoice.feePerTransaction)} />
        <Stat
          label="Kredit void"
          value={creditTotal > 0 ? `-${formatRupiah(creditTotal)}` : formatRupiah(0)}
        />
        <Stat label="Total" value={formatRupiah(invoice.total)} strong />
      </dl>
      <p className="text-sm text-slate-600">
        Periode ditutup tanggal 25 pukul 23.59 WIB. Invoice dibuat pukul 00.05 WIB tanggal 26.{" "}
        {invoice.paidAt ? (
          <>
            Dibayar pada <DateTimeText value={invoice.paidAt} />.
          </>
        ) : null}
        {invoice.note ? ` Catatan: ${invoice.note}.` : ""}
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Rincian transaksi</CardTitle>
          <span className="text-sm text-slate-600">Subtotal {formatRupiah(gross)}</span>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            query={{
              data: invoice.lines,
              isLoading: false,
              isError: false,
              refetch: () => undefined,
            }}
            rowKey={(r) => `${r.bookingId}-${r.date}`}
            emptyTitle="Belum ada transaksi ditagih pada periode ini."
            pageSize={8}
          />
        </CardContent>
      </Card>
      {invoice.credits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kredit</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {invoice.credits.map((c) => (
                <li key={c.voidId} className="flex justify-between py-2">
                  <span>{c.label}</span>
                  <span>-{formatRupiah(c.amount)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-600">
              Void setelah periode ditutup menjadi kredit di periode berikutnya. Invoice lama tidak
              diubah.
            </p>
          </CardContent>
        </Card>
      )}
      <Banner tone="info" title="Tidak ditagih">
        {view.notCharged.zero} tagihan Rp 0 dan {view.notCharged.productOnly} tagihan yang hanya
        berisi minuman atau produk tidak dihitung. Void sebelum periode tutup membatalkan biaya.
      </Banner>
      <PdfDialog open={preview} onOpenChange={setPreview} view={view} />
    </div>
  )
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd
        className={
          strong
            ? "mt-1 text-title font-semibold text-primary-800"
            : "mt-1 text-title font-semibold text-slate-900"
        }
      >
        {value}
      </dd>
    </div>
  )
}

function PdfDialog({
  open,
  onOpenChange,
  view,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  view: InvoiceView
}) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const record = useRecordInvoiceExport()
  useEffect(() => {
    if (!open) return
    let cancelled = false
    let objectUrl: string | null = null
    setBlob(null)
    setUrl(null)
    setFailed(false)
    buildInvoicePdf({
      invoice: view.invoice,
      shopName: view.shopName,
      issuer: LOQUE_ISSUER,
    })
      .then((b) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(b)
        setBlob(b)
        setUrl(objectUrl)
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, view.invoice])

  const download = () => {
    if (!blob) return
    downloadBlob(blob, `${view.invoice.number.replace(/\s+/g, "-")}.pdf`)
    if (!view.isOpen) record.mutate({ id: view.invoice.id, kind: "pdf" })
    toast.success("Invoice PDF diunduh.")
  }
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={view.isOpen ? "Pratinjau invoice" : `Invoice ${view.invoice.number}`}
      description="Tanpa PPN. Lampiran rincian transaksi disertakan."
      className="md:max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={download} disabled={!blob || view.isOpen}>
            <Download className="size-4" aria-hidden />
            Unduh PDF
          </Button>
        </>
      }
    >
      {failed ? (
        <Banner tone="danger">Tidak dapat membuat PDF. Coba lagi.</Banner>
      ) : url ? (
        <iframe
          title="Pratinjau invoice"
          src={url}
          className="h-96 w-full rounded-lg bg-slate-50"
        />
      ) : (
        <Skeleton className="h-96" />
      )}
      {view.isOpen && (
        <p className="mt-2 text-xs text-slate-600">
          Invoice dapat diunduh setelah periode ditutup.
        </p>
      )}
    </Dialog>
  )
}
