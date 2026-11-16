// Impor langsung ke domain/ katalog (murni) agar uji dan Edge Functions tidak menarik komponen React.
import { bookingDuration, resolveService } from "@/features/catalog/domain/pricing"
import type { BookingItem, Gender, Id, Money, Service, ServiceOverride } from "@/shared/types"

/** Layanan katalog untuk customer: layanan toko beserta gender yang dilayani. */
export interface CatalogService extends Service {
  genders: Gender[]
}

export const EXCLUSIVE_CATEGORIES = ["haircut", "longtrim"] as const
const isExclusive = (s: Service) => (EXCLUSIVE_CATEGORIES as readonly string[]).includes(s.category)

/** Haircut dan Long Trim saling meniadakan; kategori lain bisa banyak. */
export function toggleService(selected: Id[], service: Service, all: Service[]): Id[] {
  if (selected.includes(service.id)) return selected.filter((id) => id !== service.id)
  if (!isExclusive(service)) return [...selected, service.id]
  const rivals = new Set(all.filter(isExclusive).map((s) => s.id))
  return [...selected.filter((id) => !rivals.has(id)), service.id]
}

export function servicesForGender(services: CatalogService[], gender: Gender): CatalogService[] {
  return services.filter((s) => s.active && s.genders.includes(gender))
}

export interface Quote {
  items: BookingItem[]
  total: Money
  /** Kelipatan 30 menit. */
  duration: number
  /** Ada layanan "mulai dari" (coloring): total hanya estimasi. */
  estimate: boolean
}

/** Harga dan durasi layanan terpilih untuk satu barber (default ditambah override). */
export function quoteForBarber(
  serviceIds: Id[],
  services: Service[],
  overrides: ServiceOverride[],
  barberId: Id,
): Quote {
  const items: BookingItem[] = []
  let estimate = false
  for (const id of serviceIds) {
    const s = services.find((x) => x.id === id)
    if (!s) continue
    const r = resolveService(s, overrides, barberId)
    items.push({ serviceId: s.id, name: s.name, price: r.price, duration: r.duration })
    if (s.startingFrom) estimate = true
  }
  return {
    items,
    total: items.reduce((a, i) => a + i.price, 0),
    duration: bookingDuration(items.map((i) => i.duration)),
    estimate,
  }
}

/** Rentang total harga selama barber belum dipilih. */
export function priceRange(
  serviceIds: Id[],
  services: Service[],
  overrides: ServiceOverride[],
  barberIds: Id[],
): { min: Money; max: Money } | null {
  if (barberIds.length === 0 || serviceIds.length === 0) return null
  const totals = barberIds.map((b) => quoteForBarber(serviceIds, services, overrides, b).total)
  return { min: Math.min(...totals), max: Math.max(...totals) }
}

/** Barber dengan total terendah untuk layanan terpilih ("Paling hemat"). Seri: semuanya. */
export function cheapestBarberIds(quotes: { barberId: Id; total: Money }[]): Id[] {
  if (quotes.length < 2) return []
  const min = Math.min(...quotes.map((q) => q.total))
  const winners = quotes.filter((q) => q.total === min)
  // Bila semua barber sama harga, tidak ada yang "paling hemat".
  return winners.length === quotes.length ? [] : winners.map((q) => q.barberId)
}

/** Rentang harga satu layanan di antara barber yang melayani; satu angka bila semuanya sama. */
export function serviceRange(
  service: Service,
  overrides: ServiceOverride[],
  barberIds: Id[],
): { min: Money; max: Money } {
  if (barberIds.length === 0) return { min: service.basePrice, max: service.basePrice }
  const prices = barberIds.map((b) => resolveService(service, overrides, b).price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}
