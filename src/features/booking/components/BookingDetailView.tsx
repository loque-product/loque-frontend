import { CalendarClock, MessageCircle } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"
import {
  Async,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DateTimeText,
  MoneyText,
  RefundBadge,
  Skeleton,
  StatusBadge,
} from "@/shared/components"
import { FEE_MODE_LABEL, SOURCE_LABEL } from "@/shared/constants"
import { cn } from "@/shared/utils/cn"
import { useNow } from "@/shared/hooks"
import { waLink } from "@/shared/lib/wa-link"
import { formatDate, formatDateTime, formatPhone, formatTime } from "@/shared/utils/format"
import { can, useRole } from "@/features/auth"
import { useBill, VoidPanel } from "@/features/billing"
import { computeFee, describeFee } from "@/features/payments"
import { PrintReceiptButton, type ReceiptSource } from "@/features/printing"
import { useShopProfile } from "@/features/shops"
import { noShowState } from "../domain/stateMachine"
import { useBooking, useConfirmLate, useMarkNoShow, useUndoNoShow } from "../hooks"
import {
  CancelCustomerDialog,
  CancelShopDialog,
  NoShowConfirm,
  PrimaryActionButton,
  RiskActions,
  SecondaryActions,
  secondaryIcons,
  type PrimaryAction,
  type RiskAction,
} from "./BookingActions"
import { BookingSheet, type BookingSection } from "./BookingSheet"

/**
 * Detail booking. `layout="sheet"` dipakai di sheet kanan: aksi utama dan sekunder menempel di bawah.
 * `layout="page"` dipakai di halaman penuh.
 */
export function BookingDetailView({
  id,
  layout = "page",
}: {
  id: string
  layout?: "page" | "sheet"
}) {
  const q = useBooking(id)
  const billQ = useBill(id)
  const role = useRole()
  const shop = useShopProfile()
  const now = useNow(15000)
  const [edit, setEdit] = useState<{ section?: BookingSection } | null>(null)
  const [cancelC, setCancelC] = useState(false)
  const [cancelS, setCancelS] = useState(false)
  const [noShow, setNoShow] = useState(false)
  const noShowM = useMarkNoShow()
  const undoM = useUndoNoShow()
  const lateM = useConfirmLate()
  const manage = can(role, "booking.manage")

  return (
    <Async
      query={q}
      skeleton={
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      }
    >
      {({ booking: b, barber, bill, refund, voidRequest, slotTaken }) => {
        const fee = computeFee(b.feeMode, b.feeAmount, b.serviceTotal)
        const ns = noShowState(b, now)
        const forfeited = b.status === "cancelled_customer" || b.status === "no_show"
        const shopName = shop.data?.name ?? "Toko"
        const wa = (text: string) => (b.customerPhone ? waLink(b.customerPhone, text) : undefined)
        const receiptSource: ReceiptSource | null = billQ.data
          ? {
              shop: billQ.data.shop,
              booking: { id: b.id, customerName: b.customerName },
              barberName: billQ.data.barberName,
              lines: billQ.data.lines,
              feeMode: b.feeMode,
              feeAmount: b.feeAmount,
              bill: billQ.data.bill,
              cashierName: undefined,
            }
          : null
        const canReceipt = b.status === "confirmed" || b.status === "completed"

        // Satu aksi utama menurut status.
        let primary: PrimaryAction | null = null
        if (manage) {
          if (b.status === "confirmed")
            primary = {
              label: "Lanjut ke tagihan",
              icon: secondaryIcons.bill,
              to: `/staf/tagihan/${b.id}`,
            }
          else if (b.status === "completed")
            primary = {
              label: "Lihat tagihan",
              icon: secondaryIcons.bill,
              to: `/staf/tagihan/${b.id}`,
            }
          else if (b.status === "unpaid" && b.latePayment)
            primary = {
              label: "Konfirmasi manual",
              onClick: () => lateM.mutate(b.id),
              loading: lateM.isPending,
              disabled: slotTaken,
              hint: "Slot sudah terisi. Batalkan oleh toko dan refund.",
            }
          else if (b.status === "no_show")
            primary = {
              label: "Batalkan penandaan",
              icon: secondaryIcons.undo,
              onClick: () => undoM.mutate(b.id),
              loading: undoM.isPending,
            }
        }

        // Aksi berisiko: hanya yang berlaku untuk status saat ini.
        const risky: RiskAction[] = []
        if (manage) {
          if (b.status === "confirmed") {
            if (ns.enabled)
              risky.push({
                label: "Tandai tidak hadir",
                description: "Booking fee hangus. Bisa dibatalkan penandaannya.",
                tone: "danger",
                onClick: () => setNoShow(true),
              })
            risky.push({
              label: "Batalkan atas permintaan pelanggan",
              description: "Booking fee hangus.",
              tone: "danger",
              onClick: () => setCancelC(true),
            })
            risky.push({
              label: "Batalkan oleh toko",
              description: "Booking fee dikembalikan lewat daftar Perlu di-refund.",
              tone: "danger",
              onClick: () => setCancelS(true),
            })
          } else if (b.status === "unpaid") {
            if (b.latePayment)
              risky.push({
                label: "Batalkan oleh toko dan refund",
                description: "Dipakai bila slot sudah terisi.",
                tone: "danger",
                onClick: () => setCancelS(true),
              })
            else
              risky.push({
                label: "Batalkan booking",
                description: "Slot dilepas tanpa booking fee.",
                tone: "danger",
                onClick: () => setCancelC(true),
              })
          }
        }
        const showVoid = bill && can(role, "void.request")

        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-section font-semibold text-slate-900">{b.customerName}</h2>
                <p className="text-sm text-slate-600">
                  {formatDate(b.start)}, {formatTime(b.start)} - {formatTime(b.end)} WIB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={b.status} />
                <Badge tone="slate">
                  {SOURCE_LABEL[b.source]}
                  {b.channel ? ` - ${b.channel}` : ""}
                </Badge>
              </div>
            </div>

            {b.status === "unpaid" && b.latePayment && (
              <Banner tone="warning" title="Perlu ditangani">
                Pembayaran masuk setelah hold habis.{" "}
                {slotTaken
                  ? "Slot sudah terisi booking lain. Batalkan oleh toko dan refund."
                  : "Slot masih kosong. Anda dapat mengonfirmasi booking secara manual."}
              </Banner>
            )}
            {b.status === "no_show" && (
              <Banner tone="danger" title="Tidak hadir">
                Booking fee hangus.
              </Banner>
            )}
            {b.status === "cancelled_customer" && (
              <Banner tone="info">
                Dibatalkan atas permintaan pelanggan. Booking fee hangus.
                {b.cancelReason ? ` Alasan: ${b.cancelReason}` : ""}
              </Banner>
            )}
            {b.status === "cancelled_shop" && (
              <Banner
                tone="danger"
                title="Dibatalkan oleh toko"
                action={refund ? <RefundBadge status={refund.status} /> : undefined}
              >
                Alasan: {b.cancelReason}.{" "}
                {refund
                  ? refund.status === "needed"
                    ? "Booking fee masuk daftar Perlu di-refund."
                    : `Refund selesai, referensi ${refund.reference}.`
                  : ""}
              </Banner>
            )}
            {b.status === "confirmed" && ns.contactVisible && b.customerPhone && (
              <Banner
                tone="warning"
                title="Pelanggan belum datang"
                action={
                  <Button asChild size="sm" variant="warning">
                    <a
                      href={wa(
                        `Halo ${b.customerName}, booking Anda pukul ${formatTime(b.start)} di ${shopName} sudah dimulai. Apakah Anda masih datang?`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="size-4" aria-hidden />
                      Hubungi tamu
                    </a>
                  </Button>
                }
              >
                Sudah {ns.minutesSinceStart} menit sejak jam mulai.
              </Banner>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Pelanggan dan jadwal</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <Item label="Pelanggan">{b.customerName}</Item>
                  <Item label="Telepon">
                    {b.customerPhone ? formatPhone(b.customerPhone) : "Tidak diisi"}
                  </Item>
                  <Item label="Barber">{barber.name}</Item>
                  <Item label="Jadwal">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="size-4 text-slate-500" aria-hidden />
                      <DateTimeText value={b.start} />
                    </span>
                  </Item>
                  {b.note && (
                    <div className="sm:col-span-2">
                      <Item label="Catatan">{b.note}</Item>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layanan dan rincian uang</CardTitle>
                <Badge tone="info">Skema: {FEE_MODE_LABEL[b.feeMode]}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul className="divide-y text-sm">
                  {b.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between py-2">
                      <span>{i.name}</span>
                      <MoneyText value={i.price} />
                    </li>
                  ))}
                </ul>
                <dl className="flex flex-col gap-1.5 border-t pt-3 text-sm">
                  <Row label="Total layanan" value={b.serviceTotal} bold />
                  <Row label="Booking fee dibayar online" value={fee.onlineAmount} />
                  <Row label="Kredit atas tagihan" value={fee.creditToBill} />
                  <Row label="Sisa bayar di toko" value={fee.payAtShop} bold />
                </dl>
                <p className="text-xs text-slate-600">
                  {describeFee(b.feeMode, b.feeAmount, b.serviceTotal)}
                  {forfeited && b.feeAmount > 0 ? " Booking fee hangus." : ""}
                  {b.status === "cancelled_shop" && b.feeAmount > 0
                    ? " Booking fee dikembalikan."
                    : ""}
                </p>
              </CardContent>
            </Card>

            {bill && (
              <Card>
                <CardHeader>
                  <CardTitle>Tagihan</CardTitle>
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/staf/tagihan/${b.id}`}>Lihat tagihan</Link>
                  </Button>
                </CardHeader>
                <CardContent className="text-sm text-slate-700">
                  Total <MoneyText value={bill.total} />, sisa bayar di toko{" "}
                  <MoneyText value={bill.payAtShop} />.{" "}
                  {bill.status === "voided"
                    ? "Tagihan ini sudah di-void."
                    : "Tagihan sudah selesai."}
                </CardContent>
              </Card>
            )}

            <RiskActions actions={risky}>
              {showVoid && (
                <VoidPanel
                  bill={bill}
                  voidRequest={voidRequest}
                  threshold={shop.data?.voidThreshold ?? 200000}
                  canRequest
                />
              )}
            </RiskActions>

            <Card>
              <CardHeader>
                <CardTitle>Riwayat perubahan</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-3 text-sm">
                  {[...b.history].reverse().map((h, i) => (
                    <li key={i} className="flex flex-col">
                      <span className="text-slate-900">{h.text}</span>
                      <span className="text-xs text-slate-600">
                        {h.actor} - {formatDateTime(h.at)} WIB
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {(primary || canReceipt || manage) && (
              <div
                className={cn(
                  "flex flex-col gap-2 bg-white",
                  layout === "sheet"
                    ? "sticky bottom-0 -mx-5 -mb-4 border-t px-5 py-3"
                    : "border-t pt-4",
                )}
              >
                {primary && <PrimaryActionButton action={primary} />}
                <SecondaryActions>
                  {manage && b.status === "confirmed" && (
                    <Button variant="secondary" className="w-full" onClick={() => setEdit({})}>
                      {secondaryIcons.edit}Edit
                    </Button>
                  )}
                  {canReceipt && <PrintReceiptButton source={receiptSource} className="w-full" />}
                  {manage && b.status === "confirmed" && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setEdit({ section: "schedule" })}
                    >
                      <CalendarClock className="size-4" aria-hidden />
                      Ubah jadwal
                    </Button>
                  )}
                  {b.customerPhone && (
                    <Button asChild variant="secondary" className="w-full">
                      <a
                        href={wa(
                          `Halo ${b.customerName}, kami dari ${shopName} terkait booking Anda pada ${formatDate(b.start)} pukul ${formatTime(b.start)}.`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {secondaryIcons.wa}Hubungi WhatsApp
                      </a>
                    </Button>
                  )}
                </SecondaryActions>
              </div>
            )}

            <BookingSheet
              open={edit !== null}
              onOpenChange={(o) => !o && setEdit(null)}
              mode="edit"
              bookingId={b.id}
              focusSection={edit?.section}
            />
            <CancelCustomerDialog
              id={b.id}
              open={cancelC}
              onOpenChange={setCancelC}
              unpaid={b.status === "unpaid"}
            />
            <CancelShopDialog
              id={b.id}
              open={cancelS}
              onOpenChange={setCancelS}
              hasFee={b.feeAmount > 0 && (b.status === "confirmed" || b.latePayment)}
            />
            <NoShowConfirm
              open={noShow}
              onOpenChange={setNoShow}
              needsConfirm={ns.needsConfirm}
              loading={noShowM.isPending}
              onConfirm={() =>
                noShowM.mutate(
                  { id: b.id, confirmed: true },
                  { onSuccess: () => setNoShow(false), onError: () => setNoShow(false) },
                )
              }
            />
          </div>
        )
      }}
    </Async>
  )
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-600">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{children}</dd>
    </div>
  )
}
function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div
      className={`flex justify-between ${bold ? "font-semibold text-slate-900" : "text-slate-700"}`}
    >
      <dt>{label}</dt>
      <dd>
        <MoneyText value={value} />
      </dd>
    </div>
  )
}
