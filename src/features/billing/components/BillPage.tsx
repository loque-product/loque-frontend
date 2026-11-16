import { Minus, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import {
  Async,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Combobox,
  DateTimeText,
  Field,
  Input,
  MoneyText,
  Select,
  StatusBadge,
} from "@/shared/components"
import { FEE_MODE_LABEL, PAY_METHOD_LABEL } from "@/shared/constants"
import type { BillLine, PayMethod } from "@/shared/types"
import { formatDateTime, formatRupiah } from "@/shared/utils/format"
import { BookingSheet } from "@/features/booking"
import { can, useRole } from "@/features/auth"
import { EXTRA_TYPE_LABEL, EXTRA_TYPE_LINE_KIND, useExtraItems } from "@/features/catalog"
import { PrintReceiptButton, type ReceiptSource } from "@/features/printing"
import { computeBillTotals, isChargeable, lineTotal } from "../domain/bill"
import { useBill, useCompleteBill } from "../hooks"
import type { BillView } from "../types"
import { VoidPanel } from "./VoidPanel"

interface Row {
  key: string
  itemId: string
  qty: number
}

let rowSeq = 0
const newRow = (): Row => ({ key: `row-${++rowSeq}`, itemId: "", qty: 1 })

export function BillPage({ bookingId }: { bookingId: string }) {
  const q = useBill(bookingId)
  return (
    <Async query={q}>
      {(v) => <BillBody key={v.booking.id + (v.bill?.id ?? "")} v={v} bookingId={bookingId} />}
    </Async>
  )
}

function BillBody({ v, bookingId }: { v: BillView; bookingId: string }) {
  const role = useRole()
  const complete = useCompleteBill()
  const extras = useExtraItems()
  const [rows, setRows] = useState<Row[]>([])
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [method, setMethod] = useState<PayMethod>("cash")
  const [paid, setPaid] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [addService, setAddService] = useState(false)

  const done = v.bill !== null
  const items = extras.data ?? []
  const options = useMemo(
    () =>
      items
        .filter((x) => x.active)
        .map((x) => ({
          value: x.id,
          label: x.name,
          group: EXTRA_TYPE_LABEL[x.type],
          hint: formatRupiah(x.price),
        })),
    [items],
  )
  // Baris yang sudah memilih item menjadi baris tagihan. Baris tanpa item dan tanpa perubahan (kosong) diabaikan.
  const filled: BillLine[] = rows.flatMap((r) => {
    const it = items.find((x) => x.id === r.itemId)
    return it
      ? [
          {
            id: r.key,
            name: it.name,
            qty: r.qty,
            price: it.price,
            kind: EXTRA_TYPE_LINE_KIND[it.type],
            extraItemId: it.id,
          },
        ]
      : []
  })
  const lines: BillLine[] = done ? v.lines : [...v.lines, ...filled]
  const totals = done
    ? { total: v.bill!.total, creditToBill: v.bill!.creditToBill, payAtShop: v.bill!.payAtShop }
    : computeBillTotals(lines, v.feeMode, v.feeAmount)
  const chargeable = done ? v.bill!.chargeable : isChargeable(lines)
  const canComplete = v.booking.status === "confirmed" && can(role, "billing.manage")
  const paidNumber = paid === "" ? totals.payAtShop : Number(paid)

  const patch = (key: string, p: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)))

  const submit = () => {
    setError(null)
    const errs: Record<string, string> = {}
    for (const r of rows) {
      const pristine = r.itemId === "" && r.qty === 1
      if (r.itemId === "" && !pristine) errs[r.key] = "Pilih item."
    }
    setRowErrors(errs)
    if (Object.keys(errs).length) return
    complete.mutate(
      {
        bookingId,
        extraLines: filled.map(({ id: _id, ...l }) => l),
        method,
        paidAmount: paidNumber,
      },
      { onError: (e) => setError(e.fields?.paidAmount ?? e.message), onSuccess: () => setRows([]) },
    )
  }

  const receiptSource: ReceiptSource = {
    shop: v.shop,
    booking: { id: v.booking.id, customerName: v.booking.customerName },
    barberName: v.barberName,
    lines,
    feeMode: v.feeMode,
    feeAmount: v.feeAmount,
    bill: v.bill,
  }
  const addServiceBlocked = done || v.booking.status !== "confirmed"

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="flex flex-col gap-4 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{v.booking.customerName}</CardTitle>
            <div className="flex items-center gap-2">
              <StatusBadge status={v.booking.status} />
              <Link
                className="text-sm font-medium text-primary-800 underline"
                to={`/staf/booking/${v.booking.id}`}
              >
                Detail booking
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-700">Layanan</h3>
            <LineTable lines={v.lines} />
            <p className="text-xs text-slate-600">
              Harga layanan mengikuti harga yang tersimpan di booking dan tidak dapat diubah di
              sini. Perubahan harga dilakukan di Kelola, Katalog dan harga.
            </p>
            <div className="flex flex-col gap-1">
              <div>
                <Button
                  variant="secondary"
                  disabled={addServiceBlocked || !can(role, "billing.manage")}
                  onClick={() => setAddService(true)}
                >
                  <Plus className="size-4" aria-hidden />
                  Tambah layanan
                </Button>
              </div>
              {addServiceBlocked && (
                <p className="text-xs text-slate-600">
                  Tidak dapat menambah layanan pada tagihan yang sudah lunas, selesai, atau di-void.
                </p>
              )}
            </div>

            <h3 className="mt-2 text-sm font-semibold text-slate-700">
              Add-on, minuman atau makanan, dan produk
            </h3>
            {done ? (
              v.lines.every((l) => l.kind === "service") ? (
                <p className="text-sm text-slate-600">
                  Tidak ada add-on atau produk pada tagihan ini.
                </p>
              ) : null
            ) : (
              <>
                <ul className="flex flex-col gap-3">
                  {rows.map((r, idx) => {
                    const it = items.find((x) => x.id === r.itemId)
                    return (
                      <li
                        key={r.key}
                        className="grid items-start gap-2 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_auto_auto_auto_auto]"
                      >
                        <Field label={`Item ${idx + 1}`} error={rowErrors[r.key]}>
                          <Combobox
                            options={options}
                            value={r.itemId}
                            onValueChange={(value) => {
                              patch(r.key, { itemId: value })
                              setRowErrors((e) => ({ ...e, [r.key]: "" }))
                            }}
                            placeholder="Pilih item"
                            searchPlaceholder="Cari item"
                            title="Pilih item"
                          />
                        </Field>
                        <Field label="Jumlah">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="secondary"
                              size="icon"
                              aria-label="Kurangi jumlah"
                              disabled={r.qty <= 1}
                              onClick={() => patch(r.key, { qty: r.qty - 1 })}
                            >
                              <Minus className="size-4" aria-hidden />
                            </Button>
                            <span
                              className="w-8 text-center text-sm font-semibold"
                              aria-live="polite"
                            >
                              {r.qty}
                            </span>
                            <Button
                              variant="secondary"
                              size="icon"
                              aria-label="Tambah jumlah"
                              onClick={() => patch(r.key, { qty: r.qty + 1 })}
                            >
                              <Plus className="size-4" aria-hidden />
                            </Button>
                          </div>
                        </Field>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium text-slate-700">Harga satuan</span>
                          <span className="flex h-11 items-center text-sm">
                            {it ? formatRupiah(it.price) : "-"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium text-slate-700">Subtotal</span>
                          <span className="flex h-11 items-center text-sm font-semibold">
                            {it ? formatRupiah(it.price * r.qty) : "-"}
                          </span>
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Hapus baris ${idx + 1}`}
                            onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                {canComplete && (
                  <div className="flex flex-col gap-1">
                    <div>
                      <Button
                        variant="secondary"
                        onClick={() => setRows((rs) => [...rs, newRow()])}
                      >
                        <Plus className="size-4" aria-hidden />
                        Tambah add/ons
                      </Button>
                    </div>
                    {options.length === 0 && !extras.isLoading && (
                      <p className="text-xs text-slate-600">
                        Belum ada item aktif. Tambahkan di Katalog dan harga, tab Add-on & Produk.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            {done && v.lines.some((l) => l.kind !== "service") && (
              <LineTable lines={v.lines.filter((l) => l.kind !== "service")} />
            )}
          </CardContent>
        </Card>
        {done && (
          <Card>
            <CardHeader>
              <CardTitle>Void</CardTitle>
            </CardHeader>
            <CardContent>
              <VoidPanel
                bill={v.bill}
                voidRequest={v.voidRequest}
                threshold={v.voidThreshold}
                canRequest={can(role, "void.request")}
              />
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat tagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3 text-sm">
              {[...v.booking.history].reverse().map((h, i) => (
                <li key={i} className="flex flex-col">
                  <span>{h.text}</span>
                  <span className="text-xs text-slate-600">
                    {h.actor} - {formatDateTime(h.at)} WIB
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Perhitungan</CardTitle>
            <span className="text-xs text-slate-600">Skema {FEE_MODE_LABEL[v.feeMode]}</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <dl className="flex flex-col gap-1.5 text-sm" aria-live="polite">
              <div className="flex justify-between">
                <dt>Total</dt>
                <dd>
                  <MoneyText value={totals.total} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Kredit booking fee</dt>
                <dd>
                  <MoneyText value={totals.creditToBill} />
                </dd>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <dt>Sisa bayar di toko</dt>
                <dd>
                  <MoneyText value={totals.payAtShop} />
                </dd>
              </div>
            </dl>
            {v.feeMode === "separate" && (
              <p className="text-xs text-slate-600">Kredit Rp 0. Booking fee dibayar terpisah.</p>
            )}
            {v.feeMode === "deduct" && v.feeAmount > totals.total && (
              <p className="text-xs text-slate-600">Kredit dibatasi sebesar tagihan.</p>
            )}
            {v.feeMode === "none" && (
              <p className="text-xs text-slate-600">
                {v.booking.source === "walkin"
                  ? "Walk-in tanpa booking fee."
                  : "Booking ini tanpa booking fee."}
              </p>
            )}
            {!chargeable && (
              <Banner tone="info">Tagihan ini tidak dihitung dalam biaya Loque.</Banner>
            )}
            <PrintReceiptButton source={receiptSource} className="w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pembayaran di toko</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {done ? (
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt>Metode</dt>
                  <dd>{PAY_METHOD_LABEL[v.bill!.method as PayMethod]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Diterima</dt>
                  <dd>
                    <MoneyText value={v.bill!.paidAmount ?? 0} />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Kasir</dt>
                  <dd>{v.bill!.cashierName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Selesai</dt>
                  <dd>
                    <DateTimeText value={v.bill!.completedAt as string} />
                  </dd>
                </div>
              </dl>
            ) : canComplete ? (
              <>
                <Field label="Metode pembayaran">
                  <Select
                    value={method}
                    onValueChange={(m) => setMethod(m as PayMethod)}
                    options={(Object.keys(PAY_METHOD_LABEL) as PayMethod[]).map((m) => ({
                      value: m,
                      label: PAY_METHOD_LABEL[m],
                    }))}
                  />
                </Field>
                <Field
                  label="Nominal diterima (Rp)"
                  error={error ?? undefined}
                  hint={`Sisa bayar ${formatRupiah(totals.payAtShop)}`}
                >
                  <Input
                    inputMode="numeric"
                    value={paid === "" ? String(totals.payAtShop) : paid}
                    onChange={(e) => setPaid(e.target.value.replace(/\D/g, ""))}
                  />
                </Field>
                <Button onClick={submit} loading={complete.isPending}>
                  Tandai selesai
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Booking berstatus{" "}
                {v.booking.status === "completed" ? "selesai" : "tidak dapat ditagih"}.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <BookingSheet
        open={addService}
        onOpenChange={setAddService}
        mode="edit"
        bookingId={bookingId}
        focusSection="services"
      />
    </div>
  )
}

function LineTable({ lines }: { lines: BillLine[] }) {
  if (lines.length === 0) return null
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs text-slate-600">
        <tr>
          <th className="py-1 font-medium">Nama</th>
          <th className="py-1 text-right font-medium">Jumlah</th>
          <th className="py-1 text-right font-medium">Harga</th>
          <th className="py-1 text-right font-medium">Subtotal</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {lines.map((l) => (
          <tr key={l.id}>
            <td className="py-2">{l.name}</td>
            <td className="py-2 text-right">{l.qty}</td>
            <td className="py-2 text-right">
              <MoneyText value={l.price} />
            </td>
            <td className="py-2 text-right">
              <MoneyText value={lineTotal(l)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
