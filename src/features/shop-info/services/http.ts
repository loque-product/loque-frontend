// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { ShopInfoService } from "./contract"

export const httpShopInfoService: ShopInfoService = {
  getInfo: () => call("shop-info", "shop-info.getInfo", {}, { read: true }),
}
