import type { Invoice } from "@/shared/types"
import { formatDate, formatDateTime, formatPeriod, formatRupiah } from "@/shared/utils/format"

export interface InvoiceIssuer {
  name: string
  address: string
  email: string
  contact: string
  bankAccount: string
}

export interface InvoicePdfInput {
  invoice: Invoice
  shopName: string
  issuer: InvoiceIssuer
}

/** Membuat PDF invoice di peramban. jspdf dimuat lazy supaya tidak membebani muat awal aplikasi. */
export async function buildInvoicePdf({
  invoice,
  shopName,
  issuer,
}: InvoicePdfInput): Promise<Blob> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const left = 16
  let y = 18

  doc.setFont("helvetica", "bold").setFontSize(18).text("INVOICE", left, y)
  doc.setFontSize(10).setFont("helvetica", "normal")
  doc.text(invoice.number, 194, y, { align: "right" })
  y += 10
  doc.setFont("helvetica", "bold").text(issuer.name, left, y)
  doc.setFont("helvetica", "normal")
  y += 5
  for (const line of [
    issuer.address,
    `Email: ${issuer.email}`,
    `Kontak: ${issuer.contact}`,
    `Rekening: ${issuer.bankAccount}`,
  ]) {
    doc.text(line, left, y)
    y += 5
  }
  y += 3
  doc.setFont("helvetica", "bold").text("Ditagihkan kepada", left, y)
  doc.setFont("helvetica", "normal")
  doc.text(shopName, left, y + 5)
  doc.text(`Periode: ${formatPeriod(invoice.periodStart, invoice.periodEnd)}`, 194, y + 5, {
    align: "right",
  })
  if (invoice.closedAt)
    doc.text(`Tanggal terbit: ${formatDateTime(invoice.closedAt)} WIB`, 194, y + 10, {
      align: "right",
    })
  y += 16

  autoTable(doc, {
    startY: y,
    head: [["Tanggal", "Booking atau walk-in", "Nominal tagihan", "Biaya"]],
    body: invoice.lines.map((l) => [
      formatDate(l.date),
      l.label,
      formatRupiah(l.amount),
      formatRupiah(l.fee),
    ]),
    headStyles: { fillColor: [4, 120, 87] },
    styles: { fontSize: 9 },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } },
  })
  const docWithTable = doc as unknown as { lastAutoTable?: { finalY: number } }
  let endY = (docWithTable.lastAutoTable?.finalY ?? y) + 8

  const gross = invoice.lines.length * invoice.feePerTransaction
  const rows: [string, string][] = [
    [
      `Biaya ${invoice.lines.length} transaksi x ${formatRupiah(invoice.feePerTransaction)}`,
      formatRupiah(gross),
    ],
    ...invoice.credits.map((c): [string, string] => [c.label, `-${formatRupiah(c.amount)}`]),
    ["Total", formatRupiah(invoice.total)],
  ]
  autoTable(doc, {
    startY: endY,
    body: rows,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 100 },
    didParseCell: (d) => {
      if (d.row.index === rows.length - 1) d.cell.styles.fontStyle = "bold"
    },
  })
  endY = (docWithTable.lastAutoTable?.finalY ?? endY) + 10
  doc.setFontSize(9).setTextColor(100)
  doc.text("Tanpa PPN. Pembayaran lewat transfer ke rekening di atas.", left, endY)
  return doc.output("blob")
}
