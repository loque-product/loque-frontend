import type { Barber } from "@/shared/types"

export interface BarberService {
  list(): Promise<Barber[]>
}
