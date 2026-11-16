import type { ShopInfo } from "../types"

export interface ShopInfoService {
  /** Info publik toko: tanpa login. */
  getInfo(): Promise<ShopInfo>
}
