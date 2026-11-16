// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { ShopService } from "./contract"

export const httpShopService: ShopService = {
  getProfile: () => call("shops", "shops.getProfile", {}, { read: true }),
  updateProfile: (input) => call("shops", "shops.updateProfile", { input }),
  addGalleryPhoto: (label) => call("shops", "shops.addGalleryPhoto", { label }),
  getPaymentStatus: () => call("shops", "shops.getPaymentStatus", {}, { read: true }),
  listShops: () => call("shops", "shops.listShops", {}, { read: true }),
  getShopDetail: (shopId) => call("shops", "shops.getShopDetail", { shopId }, { read: true }),
  getSetupData: (shopId) => call("shops", "shops.getSetupData", { shopId }, { read: true }),
  createShop: (input) => call("shops", "shops.createShop", { input }),
  saveBasics: (shopId, input) => call("shops", "shops.saveBasics", { shopId, input }),
  saveOwner: (shopId, input) => call("shops", "shops.saveOwner", { shopId, input }),
  saveDokuCredentials: (shopId, input) => call("shops", "shops.saveDokuCredentials", { shopId, input }),
  testDoku: (shopId) => call("shops", "shops.testDoku", { shopId }),
  saveCatalog: (shopId, rows) => call("shops", "shops.saveCatalog", { shopId, rows }),
  saveHours: (shopId, input) => call("shops", "shops.saveHours", { shopId, input }),
  runPaymentTestStep: (shopId, step, amount) => call("shops", "shops.runPaymentTestStep", { shopId, step, amount }),
  completePaymentTest: (shopId) => call("shops", "shops.completePaymentTest", { shopId }),
  openShop: (shopId) => call("shops", "shops.openShop", { shopId }),
  freezeShop: (shopId, reason) => call("shops", "shops.freezeShop", { shopId, reason }),
  unfreezeShop: (shopId) => call("shops", "shops.unfreezeShop", { shopId }),
  deleteShop: (shopId, reason, confirmName) => call("shops", "shops.deleteShop", { shopId, reason, confirmName }),
}
