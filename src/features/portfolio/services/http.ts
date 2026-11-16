// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { PortfolioService } from "./contract"

export const httpPortfolioService: PortfolioService = {
  reportPhoto: (input) => call("portfolio", "portfolio.reportPhoto", { input }),
  listMine: () => call("portfolio", "portfolio.listMine", {}, { read: true }),
  createUploadUrl: (input) => call("portfolio", "portfolio.createUploadUrl", { input }),
  addPhoto: (input) => call("portfolio", "portfolio.addPhoto", { input }),
  updateCaption: (id, caption) => call("portfolio", "portfolio.updateCaption", { id, caption }),
  reorder: (ids) => call("portfolio", "portfolio.reorder", { ids }),
  removePhoto: (id) => call("portfolio", "portfolio.removePhoto", { id }),
}
