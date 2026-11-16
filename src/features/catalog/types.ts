import type { ExtraItemType, Id, Money, ServiceCategory } from "@/shared/types"

export interface ServiceInput {
  id?: Id
  name: string
  category: ServiceCategory
  basePrice: Money
  duration: number
  startingFrom: boolean
}
export interface OverrideInput {
  serviceId: Id
  barberId: Id
  price?: Money
  duration?: number
}

export interface ExtraItemInput {
  id?: Id
  name: string
  type: ExtraItemType
  price: Money
  active: boolean
}

export const EXTRA_TYPE_LABEL: Record<ExtraItemType, string> = {
  addon: "Add-on",
  food_drink: "Minuman atau makanan",
  product: "Produk",
}
export const EXTRA_TYPE_TONE = { addon: "info", food_drink: "warning", product: "primary" } as const
/** Jenis baris tagihan untuk tiap jenis item master. */
export const EXTRA_TYPE_LINE_KIND = {
  addon: "addon",
  food_drink: "drink",
  product: "product",
} as const
