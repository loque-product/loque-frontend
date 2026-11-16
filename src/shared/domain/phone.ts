/**
 * Nomor telepon Indonesia ke bentuk kanonik lokal `08xxxxxxxxxx` (10 sampai 13 digit).
 * Menerima `0812...`, `+62812...`, `62812...`, dengan spasi atau tanda hubung.
 * Mengembalikan null bila bukan nomor seluler yang valid.
 */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/[\s\-().]/g, "")
  if (digits.startsWith("+")) digits = digits.slice(1)
  if (!/^\d+$/.test(digits)) return null
  if (digits.startsWith("62")) digits = `0${digits.slice(2)}`
  if (!digits.startsWith("08")) return null
  if (digits.length < 10 || digits.length > 13) return null
  return digits
}
