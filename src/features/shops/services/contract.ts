import type { Shop } from "@/shared/types"
import type {
  BasicsInput,
  CatalogDraftRow,
  DokuInput,
  HoursInput,
  OwnerInput,
  ShopDetail,
  ShopProfileInput,
  ShopRow,
  ShopSetupData,
} from "../types"

export interface ShopService {
  getProfile(): Promise<Shop>
  updateProfile(input: ShopProfileInput): Promise<Shop>
  /** Foto galeri (unggah tiruan). */
  addGalleryPhoto(label: string): Promise<Shop>
  getPaymentStatus(): Promise<Shop["doku"]>

  // Super Admin
  listShops(): Promise<ShopRow[]>
  getShopDetail(shopId: string): Promise<ShopDetail>
  getSetupData(shopId: string): Promise<ShopSetupData>
  createShop(input: BasicsInput): Promise<Shop>
  /** Langkah 1. Hanya toko Draf. */
  saveBasics(shopId: string, input: BasicsInput): Promise<Shop>
  /** Langkah 2. Membuat akun Owner, atau mengubahnya bila sudah ada. */
  saveOwner(shopId: string, input: OwnerInput): Promise<void>
  /** Langkah 3. Write-only: nilai kredensial tidak pernah dikembalikan. */
  saveDokuCredentials(shopId: string, input: DokuInput): Promise<void>
  testDoku(shopId: string): Promise<Shop["doku"]>
  /** Langkah 4. Mengganti katalog awal; minimal satu layanan. */
  saveCatalog(shopId: string, rows: CatalogDraftRow[]): Promise<void>
  /** Langkah 5. Jam buka, istirahat, dan barber awal. */
  saveHours(shopId: string, input: HoursInput): Promise<void>
  /** Langkah 6. Simulasi bertahap: booking fee uji lalu refund uji. */
  runPaymentTestStep(shopId: string, step: "create" | "refund", amount: number): Promise<Shop>
  completePaymentTest(shopId: string): Promise<void>
  openShop(shopId: string): Promise<Shop>
  freezeShop(shopId: string, reason: string): Promise<Shop>
  unfreezeShop(shopId: string): Promise<Shop>
  /** Hanya toko Draf yang belum pernah dibuka. Nama toko harus diketik persis. */
  deleteShop(shopId: string, reason: string, confirmName: string): Promise<void>
}
