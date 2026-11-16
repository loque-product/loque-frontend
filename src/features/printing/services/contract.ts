import type { PrintOptions, Receipt } from "../types"

/**
 * Printer struk. Kontrak ini sengaja tidak terikat pustaka tertentu.
 * Implementasi nyata nanti memakai pustaka bergaya ESC/POS yang berjalan di React atau Bun
 * (mengirim byte ESC/POS lewat WebUSB, Web Serial, atau layanan cetak lokal).
 */
export interface ReceiptPrinter {
  print(receipt: Receipt, options: PrintOptions): Promise<void>
}
