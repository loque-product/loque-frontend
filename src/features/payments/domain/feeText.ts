import { formatRupiah } from "@/shared/utils/format"
import type { FeeMode, Money } from "@/shared/types"
import { computeFee } from "./computeFee"

export interface FeeSummary {
  /** Kalimat lengkap untuk ringkasan, mengikuti skema yang tersimpan di booking. */
  text: string
  /** Bayar di toko: sisa tagihan setelah skema fee. */
  payAtShop: Money
  /** Dibayar online saat booking. */
  online: Money
  /** Label tombol bayar. */
  payLabel: string
  /** Fee dihitung sebagai bagian dari booking. */
  hasFee: boolean
}

/** Teks fee untuk tiga skema (potong tagihan, terpisah, mati). */
export function feeSummary(mode: FeeMode, feeAmount: Money, serviceTotal: Money): FeeSummary {
  const b = computeFee(mode, feeAmount, serviceTotal)
  const payAtShop = formatRupiah(b.payAtShop)
  const fee = formatRupiah(feeAmount)
  if (mode === "deduct")
    return {
      text: `Booking fee ${fee} dipotong dari total. Bayar di toko: ${payAtShop}`,
      payAtShop: b.payAtShop,
      online: b.onlineAmount,
      payLabel: `Bayar ${fee}`,
      hasFee: true,
    }
  if (mode === "separate")
    return {
      text: `Booking fee ${fee} di luar tagihan. Bayar di toko: ${payAtShop}`,
      payAtShop: b.payAtShop,
      online: b.onlineAmount,
      payLabel: `Bayar ${fee}`,
      hasFee: true,
    }
  return {
    text: `Tanpa booking fee. Bayar di toko: ${payAtShop}`,
    payAtShop: b.payAtShop,
    online: 0,
    payLabel: "Konfirmasi booking",
    hasFee: false,
  }
}
