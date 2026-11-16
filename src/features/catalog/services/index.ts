import type { CatalogService } from "./contract"
import { httpCatalogService } from "./http"

export type { CatalogService } from "./contract"
export const catalogService: CatalogService = httpCatalogService
