import type { Id, YmdString } from "@/shared/types"

export interface BarberMe {
  id: Id
  /** Tetap walau nama diganti. */
  slug: string
  name: string
  email: string
  /** null bila belum pernah terhubung ke toko. */
  shopName: string | null
  membership: { active: boolean; since: YmdString | null }
  photoUrl: string | null
  coverUrl: string | null
  bio: string
  specialties: string[]
  /** Pilihan spesialisasi yang ditetapkan toko. */
  specialtyOptions: string[]
  rating: number
  reviewCount: number
}

export interface UpdateBarberProfileInput {
  bio: string
  specialties: string[]
  /** Kunci objek hasil unggah (`portfolio.createUploadUrl`); kosong berarti tidak berubah. */
  photoKey?: string
  coverKey?: string
}
