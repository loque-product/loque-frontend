import type { ShopService } from "./contract"
import { httpShopService } from "./http"

export type { ShopService } from "./contract"
export const shopService: ShopService = httpShopService
