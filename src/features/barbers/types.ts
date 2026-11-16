import type { Gender, Id, IsoDateTime, Money, ServiceCategory } from "@/shared/types"
import type { GalleryPhoto } from "@/features/shop-info"

export interface PublicBarber {
  id: Id
  slug: string
  name: string
  photoUrl: string | null
  specialties: string[]
  rating: number
  reviewCount: number
  lastReviewAt: IsoDateTime | null
  /** Lencana Best Rated disembunyikan oleh Super Admin. */
  badgeHidden: boolean
  genders: Gender[]
  /** Harga layanan termurah barber ini. */
  startingPrice: Money | null
}

export interface BarberPrice {
  serviceId: Id
  name: string
  category: ServiceCategory
  price: Money
  duration: number
  startingFrom: boolean
  /** Harga barber berbeda dari harga default. */
  overridden: boolean
}

export interface BarberProfile extends PublicBarber {
  coverUrl: string | null
  bio: string
  prices: BarberPrice[]
  gallery: GalleryPhoto[]
}
