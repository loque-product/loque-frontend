import { computeFee } from "@/features/payments/domain/computeFee"
import { PAY_METHOD_LABEL } from "@/shared/constants"
import type { BillLine } from "@/shared/types"
import { formatDateTime, formatRupiah } from "@/shared/utils/format"
import {
  PAPER_COLUMNS,
  type PaperWidth,
  type Receipt,
  type ReceiptSection,
  type ReceiptSource,
} from "../types"

const SECTION_TITLE: Record<BillLine["kind"], string> = {
  service: "Layanan",
  addon: "Add-on",
  drink: "Minuman dan makanan",
  product: "Produk",
}
const ORDER: BillLine["kind"][] = ["service", "addon", "drink", "product"]

/** Nomor tagihan tampil sebagai TG-1234; tagihan yang belum dicatat diberi akhiran -DRAF. */
export function billNumber(source: Pick<ReceiptSource, "bill" | "booking">): string {
  if (source.bill) return `TG-${source.bill.id.replace(/^bill-/, "")}`
  return `TG-${source.booking.id.replace(/^bk-/, "")}-DRAF`
}

/** Menyusun struk dari tagihan. Fungsi murni: tanpa waktu sekarang selain argumen `now`. */
export function buildReceipt(source: ReceiptSource, now: number = Date.now()): Receipt {
  const sections: ReceiptSection[] = ORDER.flatMap((kind) => {
    const lines = source.lines
      .filter((l) => l.kind === kind)
      .map((l) => ({ label: l.name, qty: l.qty, unitPrice: l.price, total: l.qty * l.price }))
    return lines.length ? [{ title: SECTION_TITLE[kind], lines }] : []
  })
  const subtotal = source.lines.reduce((a, l) => a + l.qty * l.price, 0)
  const fee = computeFee(source.feeMode, source.feeAmount, subtotal)
  const bill = source.bill
  const status =
    bill?.status === "voided" ? "void" : bill?.status === "completed" ? "paid" : "unpaid"
  return {
    shopName: source.shop.name,
    shopAddress: source.shop.address,
    dateTime: bill?.completedAt ?? new Date(now).toISOString(),
    billNumber: billNumber(source),
    customer: source.booking.customerName,
    cashier: bill?.cashierName ?? source.cashierName ?? "-",
    barber: source.barberName,
    sections,
    subtotal,
    bookingFeePaid: fee.onlineAmount,
    feeCredit: fee.creditToBill,
    total: subtotal,
    paymentMethod: bill?.method ? PAY_METHOD_LABEL[bill.method] : null,
    paidAtShop: status === "paid" ? (bill?.paidAmount ?? fee.payAtShop) : null,
    remaining: status === "paid" ? 0 : fee.payAtShop,
    status,
    thanks: "Terima kasih. Sampai jumpa lagi!",
  }
}

const center = (text: string, cols: number) =>
  text.length >= cols ? text : " ".repeat(Math.floor((cols - text.length) / 2)) + text
const row = (left: string, right: string, cols: number) => {
  const space = cols - left.length - right.length
  return space >= 1
    ? left + " ".repeat(space) + right
    : `${left}\n${" ".repeat(Math.max(0, cols - right.length))}${right}`
}
function wrap(text: string, cols: number): string[] {
  const out: string[] = []
  let line = ""
  for (const word of text.split(" ")) {
    if (!line) line = word
    else if ((line + " " + word).length <= cols) line += " " + word
    else {
      out.push(line)
      line = word
    }
  }
  if (line) out.push(line)
  return out.flatMap((l) =>
    l.length <= cols ? [l] : (l.match(new RegExp(`.{1,${cols}}`, "g")) ?? [l]),
  )
}

/** Teks struk bergaya kertas thermal. Lebar kertas 58 mm memakai 32 kolom, 80 mm memakai 48 kolom. */
export function formatReceiptText(r: Receipt, width: PaperWidth): string[] {
  const cols = PAPER_COLUMNS[width]
  const rule = "-".repeat(cols)
  const out: string[] = []
  const push = (...l: string[]) => out.push(...l.flatMap((x) => x.split("\n")))
  push(...wrap(r.shopName.toUpperCase(), cols).map((l) => center(l, cols)))
  push(...wrap(r.shopAddress, cols).map((l) => center(l, cols)))
  push(rule)
  push(
    row("No", r.billNumber, cols),
    row("Tanggal", formatDateTime(r.dateTime), cols),
    row("Kasir", r.cashier, cols),
    row("Barber", r.barber, cols),
    row("Pelanggan", r.customer, cols),
    rule,
  )
  for (const s of r.sections) {
    push(s.title.toUpperCase())
    for (const l of s.lines) {
      push(...wrap(l.label, cols))
      push(row(`  ${l.qty} x ${formatRupiah(l.unitPrice)}`, formatRupiah(l.total), cols))
    }
    push(rule)
  }
  push(row("Subtotal", formatRupiah(r.subtotal), cols))
  if (r.bookingFeePaid > 0) push(row("Booking fee (online)", formatRupiah(r.bookingFeePaid), cols))
  if (r.feeCredit > 0) push(row("Potongan booking fee", `-${formatRupiah(r.feeCredit)}`, cols))
  push(row("TOTAL", formatRupiah(r.total), cols))
  if (r.status === "paid") {
    push(
      row(`Bayar (${r.paymentMethod ?? "-"})`, formatRupiah(r.paidAtShop ?? 0), cols),
      row("Sisa", formatRupiah(r.remaining), cols),
    )
  } else if (r.status === "unpaid") {
    push(
      row("Sisa bayar", formatRupiah(r.remaining), cols),
      "",
      center("*** BELUM LUNAS ***", cols),
    )
  } else push("", center("*** VOID ***", cols))
  push(rule, ...wrap(r.thanks, cols).map((l) => center(l, cols)))
  return out
}
