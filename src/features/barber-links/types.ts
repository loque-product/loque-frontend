import type { ShareChannel } from "@/shared/domain/links"

export interface ChannelStat {
  ref: ShareChannel
  /** Profil dilihat bulan ini lewat tautan kanal ini. */
  views: number
  /** Booking terkonfirmasi bulan ini yang berasal dari kanal ini. */
  bookings: number
}

export interface BarberLinkInfo {
  slug: string
  name: string
  shopName: string
  stats: ChannelStat[]
}
