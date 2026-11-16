import type { ShopInfoService } from "./contract"
import { httpShopInfoService } from "./http"

export type { ShopInfoService } from "./contract"
export const shopInfoService: ShopInfoService = httpShopInfoService
