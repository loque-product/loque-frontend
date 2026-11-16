import type { FeeMode, Money } from "@/shared/types"

export interface FeeBreakdown {
  /** Dibayar online saat booking. */
  onlineAmount: Money
  /** Kredit atas tagihan layanan. */
  creditToBill: Money
  /** Sisa bayar di toko. */
  payAtShop: Money
}

export function computeFee(mode: FeeMode, feeAmount: Money, serviceTotal: Money): FeeBreakdown {
  switch (mode) {
    case "deduct": {
      const credit = Math.min(feeAmount, serviceTotal)
      return {
        onlineAmount: feeAmount,
        creditToBill: credit,
        payAtShop: serviceTotal - credit,
      }
    }
    case "separate":
      return {
        onlineAmount: feeAmount,
        creditToBill: 0,
        payAtShop: serviceTotal,
      }
    case "none":
      return { onlineAmount: 0, creditToBill: 0, payAtShop: serviceTotal }
  }
}

/** Teks fee yang mengikuti skema booking. */
export function describeFee(mode: FeeMode, feeAmount: Money, serviceTotal: Money): string {
  if (mode === "none") return "Tanpa booking fee."
  if (mode === "separate") return "Booking fee dibayar terpisah."
  if (feeAmount > serviceTotal) return "Kredit dibatasi sebesar tagihan."
  return "Booking fee memotong tagihan."
}
