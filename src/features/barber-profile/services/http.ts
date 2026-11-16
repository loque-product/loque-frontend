// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { BarberService } from "./contract"

export const httpBarberService: BarberService = {
  list: () => call("barber-profile", "barber-profile.list", {}, { read: true }),
}
