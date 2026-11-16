/** Mengubah nomor lokal (08xx) menjadi format internasional tanpa tanda plus. */
export function toWaNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("0")) return `62${digits.slice(1)}`
  return digits
}

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${toWaNumber(phone)}?text=${encodeURIComponent(message)}`
}
