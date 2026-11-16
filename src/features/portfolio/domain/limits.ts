import { PORTFOLIO_MAX_PHOTOS } from "@/shared/constants"

export const CAPTION_MAX = 80

/** Masih bisa menambah foto selama belum 9. */
export const canAddMore = (count: number): boolean => count < PORTFOLIO_MAX_PHOTOS

/** Tombol "Unggah" aktif hanya bila foto siap, persetujuan dicentang, dan kuota belum penuh. */
export function canSubmitUpload(s: {
  ready: boolean
  consent: boolean
  count: number
  busy: boolean
}): boolean {
  return s.ready && s.consent && canAddMore(s.count) && !s.busy
}

/** Menggeser satu ID ke atas (-1) atau ke bawah (+1); mengembalikan null bila tidak bisa digeser. */
export function moveId(ids: string[], index: number, delta: -1 | 1): string[] | null {
  const to = index + delta
  if (index < 0 || index >= ids.length || to < 0 || to >= ids.length) return null
  const next = [...ids]
  ;[next[index], next[to]] = [next[to], next[index]]
  return next
}
