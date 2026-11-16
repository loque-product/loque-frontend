import type {
  Barber,
  DayHours,
  HhmmString,
  Money,
  ServiceCategory,
  Service,
  Shop,
  ShopHours,
  StaffAccount,
  WorkingHours,
} from "@/shared/types"

export interface ShopRow {
  shop: Shop
  ownerName: string | null
  barberCount: number
  upcomingBookings: number
}
export interface ShopDetail {
  shop: Shop
  owner: StaffAccount | null
  barberCount: number
  serviceCount: number
  upcomingBookings: number
}
export interface ShopProfileInput {
  name: string
  address: string
  whatsapp: string
  instagram: string
  tiktok: string
}

/** Langkah 1: data dasar toko. */
export interface BasicsInput {
  name: string
  address: string
  city: string
  whatsapp: string
  instagram: string
  tiktok: string
}
/** Langkah 2: akun Owner. Kata sandi hanya diisi saat membuat akun atau mengganti. */
export interface OwnerInput {
  name: string
  email: string
  phone: string
  password?: string
}
/** Langkah 3: kredensial DOKU (write-only). */
export interface DokuInput {
  clientId: string
  secretKey: string
  mode: "sandbox" | "production"
}
/** Langkah 4: satu baris katalog awal. */
export interface CatalogDraftRow {
  name: string
  category: ServiceCategory
  basePrice: Money
  duration: number
}
/** Langkah 5: jam buka, istirahat, dan barber awal. */
export interface HoursInput {
  days: DayHours[]
  breakFrom: HhmmString | null
  breakTo: HhmmString | null
  barbers: { name: string; days: DayHours[] }[]
}
export interface ShopSetupData {
  shop: Shop
  owner: StaffAccount | null
  services: Service[]
  hours: ShopHours | null
  barbers: { barber: Barber; hours: WorkingHours | null }[]
  breakFrom: HhmmString | null
  breakTo: HhmmString | null
  upcomingBookings: number
}
