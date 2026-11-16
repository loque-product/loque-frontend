import type { BarberProfile, PublicBarber } from "../types"

export interface BarberDirectoryService {
  /** Barber aktif. Tanpa login. */
  list(): Promise<PublicBarber[]>
  /** NOT_FOUND bila slug tidak dikenal atau barber nonaktif. Tanpa login. */
  getBySlug(slug: string): Promise<BarberProfile>
}
