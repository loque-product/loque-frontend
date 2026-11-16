import { Download, Lock } from "lucide-react"
import { useState } from "react"
import {
  Async,
  Banner,
  Button,
  ConfirmDialog,
  Dialog,
  Field,
  Select,
  Skeleton,
  Textarea,
} from "@/shared/components"
import { buildCsv, downloadCsv } from "@/shared/lib/export"
import { formatDate, formatPeriod } from "@/shared/utils/format"
import { useShopList } from "@/features/shops"
import { useClosePeriod, useInvoices, useRecordInvoiceExport, useSetInvoicePaid } from "../hooks"
import type { InvoiceView } from "../types"
import { InvoiceDetail } from "./InvoiceDetail"

type Row = {
  date: string
  label: string
  amount: number | string
  fee: number | string
}

export function BillingAdmin() {
  const shops = useShopList()
  const [shopId, setShopId] = useState("shop-indra")
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const q = useInvoices(shopId)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Toko" className="w-72">
          <Select
            value={shopId}
            onValueChange={(v) => {
              setShopId(v)
              setInvoiceId(null)
            }}
            options={(shops.data ?? []).map((s) => ({
              value: s.shop.id,
              label: s.shop.name,
            }))}
          />
        </Field>
        <Async query={q} skeleton={<Skeleton className="h-11 w-72" />}>
          {(views) => (
            <Field label="Bulan atau periode" className="w-80">
              <Select
                value={invoiceId ?? views[0].invoice.id}
                onValueChange={setInvoiceId}
                options={views.map((v) => ({
                  value: v.invoice.id,
                  label: `${formatPeriod(v.invoice.periodStart, v.invoice.periodEnd)}${
                    v.isOpen ? " (berjalan)" : ""
                  }`,
                }))}
              />
            </Field>
          )}
        </Async>
      </div>
      <Async query={q} skeleton={<Skeleton className="h-96" />}>
        {(views) => <Detail view={views.find((v) => v.invoice.id === invoiceId) ?? views[0]} />}
      </Async>
    </div>
  )
}

function Detail({ view }: { view: InvoiceView }) {
  const close = useClosePeriod()
  const paid = useSetInvoicePaid()
  const record = useRecordInvoiceExport()
  const [confirmClose, setConfirmClose] = useState(false)
  const [markOpen, setMarkOpen] = useState(false)
  const [note, setNote] = useState("")
  const { invoice } = view
  const exportCsv = () => {
    const rows: Row[] = [
      ...invoice.lines.map((l) => ({
        date: formatDate(l.date),
        label: l.label,
        amount: l.amount,
        fee: l.fee,
      })),
      ...invoice.credits.map((c) => ({
        date: "",
        label: c.label,
        amount: "",
        fee: -c.amount,
      })),
    ]
    const csv = buildCsv<Row>(
      [
        { header: "Tanggal", value: (r) => r.date },
        { header: "Booking atau walk-in", value: (r) => r.label },
        { header: "Nominal tagihan", value: (r) => r.amount },
        { header: "Biaya", value: (r) => r.fee },
      ],
      rows,
    )
    downloadCsv(
      `${
        view.isOpen ? "periode-berjalan" : invoice.number
      }_${invoice.periodStart}_${invoice.periodEnd}.csv`,
      csv,
    )
    if (!view.isOpen) record.mutate({ id: invoice.id, kind: "csv" })
  }
  const actions = (
    <>
      <Button variant="secondary" onClick={exportCsv}>
        <Download className="size-4" aria-hidden />
        Ekspor CSV
      </Button>
      {view.isOpen ? (
        <Button variant="warning" onClick={() => setConfirmClose(true)}>
          <Lock className="size-4" aria-hidden />
          Tutup periode (simulasi)
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setNote(invoice.note ?? "")
            setMarkOpen(true)
          }}
        >
          {invoice.status === "paid" ? "Tandai Belum dibayar" : "Tandai Dibayar"}
        </Button>
      )}
    </>
  )
  return (
    <>
      {!view.isOpen && (
        <Banner tone="info" className="mb-4">
          Invoice yang sudah ditutup tidak dapat diubah. Hanya status pembayaran yang ditandai
          manual setelah transfer diterima.
        </Banner>
      )}
      <InvoiceDetail view={view} actions={actions} />
      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title="Tutup periode?"
        description="Periode ditutup tanggal 25 pukul 23.59 WIB. Invoice dibuat otomatis dan tidak dapat diubah. Simulasi ini langsung menutup periode berjalan."
        confirmLabel="Tutup periode"
        variant="warning"
        loading={close.isPending}
        onConfirm={() => close.mutate(view.shopId, { onSuccess: () => setConfirmClose(false) })}
      />
      <Dialog
        open={markOpen}
        onOpenChange={setMarkOpen}
        title={invoice.status === "paid" ? "Tandai Belum dibayar" : "Tandai Dibayar"}
        description={`${invoice.number}. Tanggal pencatatan ${formatDate(Date.now())}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setMarkOpen(false)}>
              Batalkan
            </Button>
            <Button
              loading={paid.isPending}
              onClick={() =>
                paid.mutate(
                  { id: invoice.id, paid: invoice.status !== "paid", note },
                  { onSuccess: () => setMarkOpen(false) },
                )
              }
            >
              Simpan
            </Button>
          </>
        }
      >
        <Field label="Catatan (opsional)">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: transfer diterima 4 Nov"
          />
        </Field>
      </Dialog>
    </>
  )
}
