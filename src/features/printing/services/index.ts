import { ApiError } from "@/shared/api"
import type { ReceiptPrinter } from "./contract"

export type { ReceiptPrinter } from "./contract"

/**
 * Printer struk belum tersambung ke perangkat. Ganti dengan implementasi ESC/POS
 * (WebUSB, Web Serial, atau layanan cetak lokal) yang memenuhi `ReceiptPrinter`.
 */
export const receiptPrinter: ReceiptPrinter = {
  print: () => Promise.reject(new ApiError("UNKNOWN", "Printer struk belum tersambung.")),
}
