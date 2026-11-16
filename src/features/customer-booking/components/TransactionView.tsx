import { Download } from "lucide-react"
import { useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { toast } from "sonner"
import { Async, Badge, Button, Card, CardContent, PageSkeleton } from "@/shared/components"
import { usePageMeta } from "@/shared/hooks"
import { formatDateTime, formatRupiah } from "@/shared/utils/format"
import { useTransaction } from "../hooks"
import type { TransactionStatus } from "../types"

const LABEL: Record<TransactionStatus, string> = {
  paid: "Dibayar",
  pending: "Menunggu pembayaran",
  failed: "Gagal",
  refund_processing: "Refund diproses",
  refunded: "Refund selesai",
}

export function TransactionView() {
  usePageMeta("Transaksi")
  const { id = "" } = useParams()
  const q = useTransaction(id)
  const receipt = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const download = async (code: string) => {
    if (!receipt.current) return
    setBusy(true)
    try {
      const { toPng } = await import("html-to-image")
      const url = await toPng(receipt.current, { pixelRatio: 2, backgroundColor: "#ffffff" })
      const a = document.createElement("a")
      a.href = url
      a.download = `bukti-pembayaran-${code}.png`
      a.click()
    } catch {
      toast.error("Bukti pembayaran belum bisa dibuat. Coba lagi.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title font-semibold text-slate-900">Transaksi</h1>
      <Async query={q} skeleton={<PageSkeleton rows={4} />}>
        {(t) => (
          <>
            <Card>
              <CardContent className="p-0">
                <div ref={receipt} className="flex flex-col gap-3 bg-white p-5">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{t.shopName}</p>
                    <p className="text-xs text-slate-600">Bukti pembayaran booking fee</p>
                  </div>
                  <dl className="divide-y text-sm">
                    {[
                      ["Kode booking", t.code],
                      ["Nominal", formatRupiah(t.amount)],
                      ["Waktu pembayaran", t.paidAt ? `${formatDateTime(t.paidAt)} WIB` : "-"],
                      ["Referensi", t.reference ?? "-"],
                      ["Metode", t.method ?? "-"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3 py-2">
                        <dt className="text-slate-600">{k}</dt>
                        <dd className="text-right font-medium tabular-nums text-slate-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-slate-700">
              Status:{" "}
              <Badge
                tone={
                  t.status === "paid" || t.status === "refunded"
                    ? "primary"
                    : t.status === "failed"
                      ? "danger"
                      : "warning"
                }
              >
                {LABEL[t.status]}
              </Badge>
            </p>
            <Button
              disabled={
                t.status !== "paid" && t.status !== "refunded" && t.status !== "refund_processing"
              }
              loading={busy}
              onClick={() => void download(t.code)}
            >
              <Download className="size-4" aria-hidden />
              Unduh bukti pembayaran
            </Button>
            <Link
              to={`/booking-saya/${t.bookingId}`}
              className="flex min-h-11 items-center text-sm font-medium text-primary-800 underline"
            >
              Kembali ke detail booking
            </Link>
          </>
        )}
      </Async>
    </div>
  )
}
