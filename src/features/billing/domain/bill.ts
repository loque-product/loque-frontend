import { computeFee } from "@/features/payments/domain/computeFee"
import type { BillLine, FeeMode, Money } from "@/shared/types"

export interface BillTotals {
  total: Money
  creditToBill: Money
  payAtShop: Money
}

export const lineTotal = (l: Pick<BillLine, "qty" | "price">): Money => l.qty * l.price

export function computeBillTotals(
  lines: BillLine[],
  feeMode: FeeMode,
  feeAmount: Money,
): BillTotals {
  const total = lines.reduce((a, l) => a + lineTotal(l), 0)
  const fee = computeFee(feeMode, feeAmount, total)
  return { total, creditToBill: fee.creditToBill, payAtShop: fee.payAtShop }
}

/** Ditagih Loque: total di atas nol dan bukan hanya minuman atau produk. */
export function isChargeable(lines: BillLine[]): boolean {
  const total = lines.reduce((a, l) => a + lineTotal(l), 0)
  const hasService = lines.some((l) => l.kind === "service" || l.kind === "addon")
  return total > 0 && hasService
}
