// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { CatalogService } from "./contract"

export const httpCatalogService: CatalogService = {
  listServices: () => call("catalog", "catalog.listServices", {}, { read: true }),
  listOverrides: () => call("catalog", "catalog.listOverrides", {}, { read: true }),
  saveService: (input) => call("catalog", "catalog.saveService", { input }),
  setServiceActive: (id, active) => call("catalog", "catalog.setServiceActive", { id, active }),
  setOverride: (input) => call("catalog", "catalog.setOverride", { input }),
  listExtraItems: () => call("catalog", "catalog.listExtraItems", {}, { read: true }),
  saveExtraItem: (input) => call("catalog", "catalog.saveExtraItem", { input }),
  deleteExtraItem: (id) => call("catalog", "catalog.deleteExtraItem", { id }),
}
