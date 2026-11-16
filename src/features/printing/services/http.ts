// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { ReceiptPrinter } from "./contract"

export const httpReceiptPrinter: ReceiptPrinter = {
  print: (receipt, options) => call("printing", "printing.print", { receipt, options }),
}
