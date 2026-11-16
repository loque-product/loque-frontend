import { LOQUE_FEE_PER_TRANSACTION } from "@/shared/domain/money"
import { addDaysYmd, fromWib, toYmd, wibParts } from "@/shared/domain/time"
import type {
  Bill,
  Invoice,
  InvoiceLine,
  IsoDateTime,
  Money,
  VoidRequest,
  YmdString,
} from "@/shared/types"

export interface BillingPeriod {
  start: YmdString
  end: YmdString
}

const pad = (n: number) => String(n).padStart(2, "0")

/** Periode penagihan yang memuat tanggal tertentu: tanggal 26 bulan lalu sampai tanggal 25 bulan ini. */
export function periodFor(input: IsoDateTime | Date | number): BillingPeriod {
  const p = wibParts(input)
  let sy = p.y
  let sm = p.m
  if (p.d <= 25) {
    sm -= 1
    if (sm === 0) {
      sm = 12
      sy -= 1
    }
  }
  let ey = sy
  let em = sm + 1
  if (em === 13) {
    em = 1
    ey += 1
  }
  return { start: `${sy}-${pad(sm)}-26`, end: `${ey}-${pad(em)}-25` }
}

export function nextPeriod(period: BillingPeriod): BillingPeriod {
  return periodFor(fromWib(addDaysYmd(period.end, 1), "12:00"))
}

export function previousPeriod(period: BillingPeriod): BillingPeriod {
  return periodFor(fromWib(addDaysYmd(period.start, -1), "12:00"))
}

/** Periode tutup tanggal akhir pukul 23.59.59 WIB. */
export function periodCloseTime(period: BillingPeriod): number {
  return fromWib(addDaysYmd(period.end, 1), "00:00").getTime() - 1000
}

export function isPeriodClosed(period: BillingPeriod, now: number): boolean {
  return now > periodCloseTime(period)
}

export function inPeriod(at: IsoDateTime, period: BillingPeriod): boolean {
  const ymd = toYmd(at)
  return ymd >= period.start && ymd <= period.end
}

export interface PeriodSummary {
  lines: InvoiceLine[]
  credits: Invoice["credits"]
  notCharged: { zero: number; productOnly: number }
  feePerTransaction: Money
  gross: Money
  creditTotal: Money
  total: Money
}

/**
 * Menghitung rincian satu periode.
 * - Void sebelum tutup membatalkan biaya (transaksi tidak masuk).
 * - Void setelah tutup menjadi kredit di periode tempat void terjadi.
 */
export function computePeriodSummary(input: {
  bills: Bill[]
  voids: VoidRequest[]
  period: BillingPeriod
  labelOf: (bill: Bill) => string
  fee?: Money
  /** Tagihan yang dipaksa masuk periode ini (selesai setelah periode lain ditutup). */
  extraBillIds?: Set<string>
}): PeriodSummary {
  const fee = input.fee ?? LOQUE_FEE_PER_TRANSACTION
  const close = periodCloseTime(input.period)
  const completed = input.bills.filter(
    (b) =>
      b.completedAt && (inPeriod(b.completedAt, input.period) || input.extraBillIds?.has(b.id)),
  )

  const lines: InvoiceLine[] = []
  let zero = 0
  let productOnly = 0
  for (const b of completed) {
    if (b.total <= 0) {
      zero++
      continue
    }
    if (!b.chargeable) {
      productOnly++
      continue
    }
    const voidedBeforeClose = b.voidedAt !== undefined && new Date(b.voidedAt).getTime() <= close
    if (voidedBeforeClose) continue
    lines.push({
      date: b.completedAt as string,
      bookingId: b.bookingId,
      label: input.labelOf(b),
      amount: b.total,
      fee,
    })
  }

  const credits: Invoice["credits"] = input.voids
    .filter((v) => v.status === "approved" && v.decidedAt && inPeriod(v.decidedAt, input.period))
    .flatMap((v) => {
      const bill = input.bills.find((b) => b.id === v.billId)
      if (!bill || !bill.completedAt || !bill.chargeable) return []
      const billPeriod = periodFor(bill.completedAt)
      // Kredit hanya jika tagihan berasal dari periode yang sudah ditutup sebelum void.
      if (billPeriod.end >= input.period.start) return []
      return [{ voidId: v.id, label: `Void ${input.labelOf(bill)}`, amount: fee }]
    })

  const gross = lines.length * fee
  const creditTotal = credits.reduce((a, c) => a + c.amount, 0)
  return {
    lines,
    credits,
    notCharged: { zero, productOnly },
    feePerTransaction: fee,
    gross,
    creditTotal,
    total: Math.max(0, gross - creditTotal),
  }
}

/** Nomor invoice berurutan, misalnya LQ-2026-0003. */
export function nextInvoiceNumber(existing: string[], year: number): string {
  const max = existing.reduce((m, n) => {
    const match = /^LQ-\d{4}-(\d{4})$/.exec(n)
    return match ? Math.max(m, Number(match[1])) : m
  }, 0)
  return `LQ-${year}-${String(max + 1).padStart(4, "0")}`
}
