import type { Gender, Id, Money, ShopHours } from "@/shared/types"

export interface GalleryPhoto {
  id: Id
  url: string
  alt: string
  /** Dimensi piksel gambar, untuk rasio masonry. */
  width: number
  height: number
  /** Disembunyikan sampai laporan diperiksa. */
  hidden: boolean
}

export interface ShopInfo {
  id: Id
  name: string
  tagline: string
  address: string
  mapsUrl: string
  whatsapp: string
  instagram: string
  tiktok: string
  heroPhotoUrl: string | null
  gallery: GalleryPhoto[]
  hours: ShopHours
  genders: Gender[]
  /** Nominal booking fee saat ini, dipakai pada contoh di halaman Bantuan. */
  feeAmount: Money
}
