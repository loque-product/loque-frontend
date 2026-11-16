import {
  PHOTO_HIDDEN_SLA_HOURS,
  PHOTO_SLA_DAYS,
  REVIEW_SLA_DAYS,
  BEST_RATED_MIN_REVIEWS,
} from "@/shared/constants"
import { DAY_MS, HOUR_MS } from "@/shared/domain/time"
import type { Barber, IsoDateTime, PhotoReport } from "@/shared/types"

export type SlaLevel = "ok" | "near" | "over"
export interface Sla {
  limitMs: number
  remainingMs: number
  level: SlaLevel
}

/** Mendekati batas bila sisa waktu tinggal 25 persen atau kurang. */
export function slaFor(reportedAt: IsoDateTime, limitMs: number, now: number): Sla {
  const remainingMs = new Date(reportedAt).getTime() + limitMs - now
  const level: SlaLevel = remainingMs <= 0 ? "over" : remainingMs <= limitMs * 0.25 ? "near" : "ok"
  return { limitMs, remainingMs, level }
}

/** Foto yang sudah disembunyikan: batas 48 jam. Laporan lain: 7 hari. */
export function photoSla(r: Pick<PhotoReport, "reportedAt" | "hidden">, now: number): Sla {
  return slaFor(
    r.reportedAt,
    r.hidden ? PHOTO_HIDDEN_SLA_HOURS * HOUR_MS : PHOTO_SLA_DAYS * DAY_MS,
    now,
  )
}

export const reviewSla = (reportedAt: IsoDateTime, now: number): Sla =>
  slaFor(reportedAt, REVIEW_SLA_DAYS * DAY_MS, now)

export function formatRemaining(ms: number): string {
  const abs = Math.abs(ms)
  const h = Math.floor(abs / HOUR_MS)
  const text =
    h >= 48
      ? `${Math.floor(h / 24)} hari`
      : h >= 1
        ? `${h} jam`
        : `${Math.max(1, Math.floor(abs / 60000))} menit`
  return ms >= 0 ? `Sisa ${text}` : `Lewat ${text}`
}

export interface BestRatedRow {
  barber: Barber
  eligible: boolean
  badge: boolean
}

/**
 * Best Rated: rata-rata rating tertinggi dengan minimal 5 ulasan.
 * Seri: ulasan terbanyak, lalu ulasan terbaru. Satu lencana per toko. Barber dengan lencana disembunyikan dikecualikan.
 */
export function bestRated(barbers: Barber[]): BestRatedRow[] {
  const eligible = barbers.filter((b) => b.reviewCount >= BEST_RATED_MIN_REVIEWS && !b.badgeHidden)
  const winner = [...eligible].sort(
    (a, b) =>
      b.rating - a.rating ||
      b.reviewCount - a.reviewCount ||
      b.lastReviewAt.localeCompare(a.lastReviewAt),
  )[0]
  return [...barbers]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .map((barber) => ({
      barber,
      eligible: barber.reviewCount >= BEST_RATED_MIN_REVIEWS,
      badge: winner?.id === barber.id,
    }))
}
