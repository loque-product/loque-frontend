import type { Refund } from "@/shared/types"
import type { FeeConfig } from "../types"

export interface PaymentsService {
  listRefunds(): Promise<Refund[]>
  markRefundDone(id: string, reference: string): Promise<Refund>
  getFeeConfig(): Promise<FeeConfig>
  /** Berlaku untuk booking baru. Booking lama memakai snapshot. */
  saveFeeConfig(config: FeeConfig): Promise<void>
}
