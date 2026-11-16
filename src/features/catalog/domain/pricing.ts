import type { Id, Money, Service, ServiceOverride } from "@/shared/types"

export interface ResolvedService {
  price: Money
  duration: number
  overridden: boolean
}

/** Harga dan durasi = default layanan ditambah override per barber. */
export function resolveService(
  service: Service,
  overrides: ServiceOverride[],
  barberId: Id,
): ResolvedService {
  const o = overrides.find((x) => x.serviceId === service.id && x.barberId === barberId)
  return {
    price: o?.price ?? service.basePrice,
    duration: o?.duration ?? service.duration,
    overridden: Boolean(o && (o.price !== undefined || o.duration !== undefined)),
  }
}

/** Durasi booking: kelipatan 30 menit, minimal 30. */
export function bookingDuration(durations: number[]): number {
  const total = durations.reduce((a, b) => a + b, 0)
  return Math.max(30, Math.ceil(total / 30) * 30)
}

export const DURATION_OPTIONS = [0, 30, 60, 90, 120, 150, 180]
