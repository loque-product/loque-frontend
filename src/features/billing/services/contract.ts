import type { Bill, VoidRequestPublic } from "@/shared/types"
import type { BillRow, BillView, CompleteBillInput } from "../types"

export interface BillingService {
  listBills(): Promise<BillRow[]>
  getBill(bookingId: string): Promise<BillView>
  completeBill(input: CompleteBillInput): Promise<Bill>
  requestVoid(billId: string, reason: string): Promise<VoidRequestPublic>
  /** Kasir memasukkan kode dari Owner. Kode benar: void berlaku. */
  submitVoidCode(voidId: string, code: string): Promise<VoidRequestPublic>

  // Owner
  listVoids(): Promise<VoidRequestPublic[]>
  /** Token hanya untuk Owner dan bukan pemohon. Tidak pernah dikirim ke Admin & Kasir. */
  getVoidCode(voidId: string): Promise<{ token: string; expiresAt: string }>
  rejectVoid(voidId: string, note: string): Promise<VoidRequestPublic>
  getVoidThreshold(): Promise<number>
  setVoidThreshold(amount: number): Promise<void>
}
