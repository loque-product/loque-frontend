import { bookingDuration, resolveService } from "@/features/catalog"
import type { BookingItem, Id, Service, ServiceOverride } from "@/shared/types"

/**
 * Baris layanan booking setelah diubah.
 * - Barber diganti: semua layanan memakai harga dan durasi barber baru.
 * - Barber sama: layanan lama memakai snapshot, layanan baru memakai harga katalog.
 */
export function quoteItems(input: {
  existing: BookingItem[]
  serviceIds: Id[]
  barberChanged: boolean
  barberId: Id
  services: Service[]
  overrides: ServiceOverride[]
}): BookingItem[] {
  const fresh = (sid: Id): BookingItem | null => {
    const s = input.services.find((x) => x.id === sid)
    if (!s) return null
    const r = resolveService(s, input.overrides, input.barberId)
    return {
      serviceId: sid,
      name: s.name,
      price: r.price,
      duration: r.duration,
    }
  }
  return input.serviceIds.flatMap((sid) => {
    const item = input.barberChanged
      ? fresh(sid)
      : (input.existing.find((i) => i.serviceId === sid) ?? fresh(sid))
    return item ? [item] : []
  })
}

export const itemsTotal = (items: BookingItem[]) => items.reduce((a, i) => a + i.price, 0)
export const itemsDuration = (items: BookingItem[]) => bookingDuration(items.map((i) => i.duration))
