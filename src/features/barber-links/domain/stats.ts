import type { ShareChannel } from "@/shared/domain/links"
import type { ChannelStat } from "../types"

export const CHANNEL_NAME: Record<ShareChannel, string> = {
  ig: "Instagram",
  tt: "TikTok",
  wa: "WhatsApp",
}
export const CHANNEL_ORDER: ShareChannel[] = ["ig", "tt", "wa"]

/** Satu baris per kanal dalam urutan tetap, dengan nol untuk kanal tanpa data. */
export function normalizeStats(stats: ChannelStat[]): ChannelStat[] {
  return CHANNEL_ORDER.map(
    (ref) => stats.find((s) => s.ref === ref) ?? { ref, views: 0, bookings: 0 },
  )
}

/** Lebar batang (0 sampai 100) relatif terhadap nilai terbesar. */
export const barWidth = (value: number, max: number): number =>
  max <= 0 ? 0 : Math.round((value / max) * 100)
