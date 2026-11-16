import type { BarberLinkInfo } from "../types"

export interface BarberLinksService {
  /** Slug, nama, dan statistik bulan berjalan per kanal (Instagram, TikTok, WhatsApp). Tetap tersedia walau keanggotaan nonaktif. */
  getMine(): Promise<BarberLinkInfo>
}
