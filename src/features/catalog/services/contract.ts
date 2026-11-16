import type { ExtraItem, Service, ServiceOverride } from "@/shared/types"
import type { ExtraItemInput, OverrideInput, ServiceInput } from "../types"

export interface CatalogService {
  listServices(): Promise<Service[]>
  listOverrides(): Promise<ServiceOverride[]>
  saveService(input: ServiceInput): Promise<Service>
  setServiceActive(id: string, active: boolean): Promise<void>
  /** Harga atau durasi kosong menghapus override. */
  setOverride(input: OverrideInput): Promise<void>

  /** Master add-on, minuman atau makanan, dan produk. */
  listExtraItems(): Promise<ExtraItem[]>
  saveExtraItem(input: ExtraItemInput): Promise<ExtraItem>
  /** Baris tagihan lama tetap utuh; hanya master yang dihapus. */
  deleteExtraItem(id: string): Promise<void>
}
