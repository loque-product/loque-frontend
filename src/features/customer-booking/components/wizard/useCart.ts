import { useMemo } from "react"
import { useBarberList, type PublicBarber } from "@/features/barbers"
import { priceRange, quoteForBarber, servicesForGender, type Quote } from "../../domain/cart"
import { useCustomerCatalog } from "../../hooks"
import { useWizard } from "../../store/wizard"

/** Data keranjang wizard: katalog, barber yang melayani gender terpilih, dan harga. */
export function useCart() {
  const w = useWizard()
  const catalog = useCustomerCatalog()
  const barbers = useBarberList()
  return useMemo(() => {
    const c = catalog.data
    const all = barbers.data ?? []
    const eligible: PublicBarber[] = w.gender
      ? all.filter((b) => b.genders.includes(w.gender!))
      : all
    const services = c && w.gender ? servicesForGender(c.services, w.gender) : (c?.services ?? [])
    const barber = eligible.find((b) => b.id === w.barberId) ?? null
    const quote: Quote | null =
      c && barber ? quoteForBarber(w.serviceIds, c.services, c.overrides, barber.id) : null
    const range =
      c && !barber
        ? priceRange(
            w.serviceIds,
            c.services,
            c.overrides,
            eligible.map((b) => b.id),
          )
        : null
    return {
      w,
      catalog,
      barbers,
      c,
      eligible,
      services,
      barber,
      quote,
      range,
      ready: Boolean(c && barbers.data),
    }
  }, [w, catalog, barbers])
}
