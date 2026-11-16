import { describe, expect, it } from "vitest"
import type { Service, ServiceOverride } from "@/shared/types"
import { cheapestBarberIds, priceRange, quoteForBarber, toggleService } from "./cart"

const svc = (
  id: string,
  category: Service["category"],
  basePrice: number,
  duration: number,
  startingFrom = false,
): Service => ({
  id,
  shopId: "s",
  name: id,
  category,
  basePrice,
  duration,
  startingFrom,
  active: true,
})
const services = [
  svc("haircut", "haircut", 45000, 30),
  svc("longtrim", "longtrim", 60000, 60),
  svc("razor", "addon", 20000, 0),
  svc("color", "coloring", 80000, 120, true),
]
const overrides: ServiceOverride[] = [{ serviceId: "haircut", barberId: "indra", price: 100000 }]

describe("toggleService", () => {
  it("haircut dan long trim saling meniadakan", () => {
    const a = toggleService([], services[0], services)
    expect(a).toEqual(["haircut"])
    expect(toggleService(a, services[1], services)).toEqual(["longtrim"])
  })
  it("add-on bisa banyak dan bisa dilepas", () => {
    const a = toggleService(["haircut"], services[2], services)
    expect(a).toEqual(["haircut", "razor"])
    expect(toggleService(a, services[2], services)).toEqual(["haircut"])
  })
})

describe("quoteForBarber", () => {
  it("memakai override barber dan membulatkan durasi", () => {
    const q = quoteForBarber(["haircut", "razor"], services, overrides, "indra")
    expect(q.total).toBe(120000)
    expect(q.duration).toBe(30)
  })
  it("menandai estimasi untuk coloring", () => {
    expect(quoteForBarber(["color"], services, overrides, "reza").estimate).toBe(true)
  })
})

describe("priceRange dan cheapestBarberIds", () => {
  it("rentang dari semua barber", () => {
    expect(priceRange(["haircut"], services, overrides, ["indra", "reza"])).toEqual({
      min: 45000,
      max: 100000,
    })
    expect(priceRange([], services, overrides, ["indra"])).toBeNull()
  })
  it("paling hemat dihitung per total terpilih", () => {
    expect(
      cheapestBarberIds([
        { barberId: "a", total: 50 },
        { barberId: "b", total: 40 },
      ]),
    ).toEqual(["b"])
    expect(
      cheapestBarberIds([
        { barberId: "a", total: 40 },
        { barberId: "b", total: 40 },
      ]),
    ).toEqual([])
    expect(cheapestBarberIds([{ barberId: "a", total: 40 }])).toEqual([])
  })
})
