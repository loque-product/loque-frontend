// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { BarberDirectoryService } from "./contract"

export const httpBarberDirectoryService: BarberDirectoryService = {
  list: () => call("barbers", "barbers.list", {}, { read: true }),
  getBySlug: (slug) => call("barbers", "barbers.getBySlug", { slug }, { read: true }),
}
