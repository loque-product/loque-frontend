// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { BarberLinksService } from "./contract"

export const httpBarberLinksService: BarberLinksService = {
  getMine: () => call("barber-links", "barber-links.getMine", {}, { read: true }),
}
